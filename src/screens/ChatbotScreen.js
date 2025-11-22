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
  ScrollView
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
      text: 'Hello! I am your SportX Assistant. Ask me anything about cricket scores, football rules, or player stats!',
      sender: 'bot',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);

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
      // Fetch live sports data from TheSportsDB API
      let sportsContext = '';
      try {
        const sportsResponse = await axios.get(
          'https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=4328'
        );
        if (sportsResponse.data?.events) {
          const upcomingMatches = sportsResponse.data.events.slice(0, 3);
          sportsContext = `\n\nLive Sports Context (recent Premier League matches): ${JSON.stringify(upcomingMatches.map(m => ({
            event: m.strEvent,
            date: m.dateEvent,
            league: m.strLeague
          })))}`;
        }
      } catch (sportsError) {
        console.log('Sports API fetch error:', sportsError);
      }

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: `You are a helpful sports assistant for an app called SportX. You have access to live sports data. Format your response using markdown (bold, italic, lists, etc.). Answer this sports-related question concisely: ${inputText}${sportsContext}`
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
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
      keyboardVerticalOffset={0}
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
    height: 80,
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
    maxWidth: '80%',
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
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageText: { 
    fontSize: FONT_SIZES.md, 
    lineHeight: 22 
  },
  userText: { 
    color: '#ffffff' 
  },
  botText: { 
    color: COLORS.text 
  },
  inputContainer: {
    flexDirection: 'row',
    padding: SPACING.sm,
    backgroundColor: COLORS.card,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: Platform.OS === 'android' ? SPACING.sm : SPACING.sm,
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
