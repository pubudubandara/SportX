import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useSelector } from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import axios from 'axios';
import Markdown from 'react-native-markdown-display';
import { GEMINI_API_KEY } from '@env';
import { selectIsDarkMode } from '../redux/themeSlice';
import { getColors, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../utils/constants';

const ChatbotScreen = ({ navigation }) => {
  const isDarkMode = useSelector(selectIsDarkMode);
  const COLORS = getColors(isDarkMode);
  
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hello! I am your SportX Assistant. I have access to live sports data. Ask me about today\'s scores, upcoming matches, or league standings!',
      sender: 'bot',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [leagueMap, setLeagueMap] = useState({}); // Stores "League Name" -> "ID"
  const flatListRef = useRef(null);

  // 1. Initialize: Fetch All Leagues to build a dynamic ID map
  useEffect(() => {
    const initLeagues = async () => {
      try {
        const res = await axios.get('https://www.thesportsdb.com/api/v1/json/3/all_leagues.php');
        const map = {};
        if (res.data.leagues) {
          res.data.leagues.forEach(l => {
            map[l.strLeague] = l.idLeague;
          });
        }
        setLeagueMap(map);
      } catch (e) {
        console.log("Failed to load league map", e);
      }
    };
    initLeagues();
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    Keyboard.dismiss();

    try {
      // --- STEP 1: GATHER LIVE SPORTS CONTEXT ---
      let sportsContext = '';
      try {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        
        // Resolve IDs dynamically using the map (fallback to defaults if map not ready)
        const eplId = leagueMap['English Premier League'] || '4328';
        const laLigaId = leagueMap['Spanish La Liga'] || '4335';
        const serieAId = leagueMap['Italian Serie A'] || '4332';
        const bundesligaId = leagueMap['German Bundesliga'] || '4331';
        const nbaId = leagueMap['NBA'] || '4387';
        const iplId = leagueMap['Indian Premier League'] || '4436';

        // Parallel API Calls
        const [todayEvents, premierLeague, laLiga, serieA, bundesliga, nba, ipl] = await Promise.all([
          axios.get(`https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${dateStr}&s=Soccer`).catch(() => null),
          axios.get(`https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=${eplId}`).catch(() => null),
          axios.get(`https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=${laLigaId}`).catch(() => null),
          axios.get(`https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=${serieAId}`).catch(() => null),
          axios.get(`https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=${bundesligaId}`).catch(() => null),
          axios.get(`https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=${nbaId}`).catch(() => null),
          axios.get(`https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=${iplId}`).catch(() => null),
        ]);

        const todayMatches = todayEvents?.data?.events || [];
        
        // Build Context String
        if (todayMatches.length > 0) {
          sportsContext += `\n=== TODAY'S SOCCER MATCHES (${dateStr}) ===\n`;
          todayMatches.slice(0, 15).forEach(m => {
            sportsContext += `- ${m.strEvent} (${m.strLeague}) | Time: ${m.strTime || 'TBD'}\n`;
          });
        }

        sportsContext += `\n=== UPCOMING HIGHLIGHTS ===\n`;
        
        const addLeagueToContext = (data, name) => {
          if (data?.events) {
            sportsContext += `\n**${name}:**\n`;
            data.events.slice(0, 5).forEach(m => {
              sportsContext += `- ${m.dateEvent}: ${m.strEvent} (${m.strTime})\n`;
            });
          }
        };

        addLeagueToContext(premierLeague?.data, "Premier League");
        addLeagueToContext(laLiga?.data, "La Liga");
        addLeagueToContext(serieA?.data, "Serie A");
        addLeagueToContext(bundesliga?.data, "Bundesliga");
        addLeagueToContext(nba?.data, "NBA");
        addLeagueToContext(ipl?.data, "IPL Cricket");

      } catch (sportsError) {
        console.log('Sports API fetch error:', sportsError);
      }

      // --- STEP 2: SEND TO GEMINI ---
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: `You are a helpful sports assistant for SportX app.
              
              Here is the latest LIVE data fetched from the API:
              ${sportsContext}

              INSTRUCTIONS:
              1. Answer the user's question: "${inputText}"
              2. Use the live data provided above to be accurate about dates and times.
              3. If the user asks about a specific league not in the list, answer from your general knowledge but mention you don't have the live schedule.
              4. Format nicely with Markdown (bolding teams, lists).
              `
            }]
          }]
        }
      );

      const botReplyText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: botReplyText,
        sender: 'bot',
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Gemini API Error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I couldn't connect to the stadium. Please check your internet or API key configuration.",
        sender: 'bot',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === 'user' ? styles.userBubble : styles.botBubble,
      ]}
    >
      {item.sender === 'user' ? (
        <Text style={styles.userText}>{item.text}</Text>
      ) : (
        <Markdown
          style={{
            body: { color: COLORS.text, fontSize: FONT_SIZES.md },
            heading1: { color: COLORS.text, fontSize: FONT_SIZES.xl, fontWeight: 'bold' },
            heading2: { color: COLORS.text, fontSize: FONT_SIZES.lg, fontWeight: 'bold' },
            strong: { color: COLORS.primary, fontWeight: 'bold' },
            em: { fontStyle: 'italic' },
            link: { color: COLORS.primary },
            bullet_list: { color: COLORS.text },
            ordered_list: { color: COLORS.text },
            code_inline: { 
              backgroundColor: COLORS.background, 
              color: COLORS.primary,
              paddingHorizontal: 4,
              borderRadius: 3
            },
            code_block: { 
              backgroundColor: COLORS.background, 
              color: COLORS.text,
              padding: 10,
              borderRadius: 5
            },
          }}
        >
          {item.text}
        </Markdown>
      )}
    </View>
  );

  const styles = createStyles(COLORS);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SportX Assistant</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask about sports..."
          placeholderTextColor={COLORS.textLight}
          value={inputText}
          onChangeText={setInputText}
          multiline
          returnKeyType="send"
          onSubmitEditing={sendMessage}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[styles.sendButton, { opacity: isLoading ? 0.6 : 1 }]}
          onPress={sendMessage}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Feather name="send" size={20} color="#ffffff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  header: {
    height: 60,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backBtn: {
    padding: SPACING.xs,
  },
  headerTitle: { 
    color: '#ffffff', 
    fontSize: FONT_SIZES.lg, 
    fontWeight: FONT_WEIGHTS.bold 
  },
  listContent: { 
    padding: SPACING.md, 
    paddingBottom: SPACING.lg 
  },
  messageBubble: {
    maxWidth: '85%',
    padding: SPACING.md,
    borderRadius: 15,
    marginBottom: SPACING.sm,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 2,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.card,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  userText: { 
    color: '#ffffff',
    fontSize: FONT_SIZES.md,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: SPACING.sm,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 25,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    color: COLORS.text,
    maxHeight: 100,
    fontSize: FONT_SIZES.md,
  },
  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});

export default ChatbotScreen;