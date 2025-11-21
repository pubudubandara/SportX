import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Animated,
  Easing,
  StatusBar
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setActiveLeague } from '../redux/sportsSlice';

const { width } = Dimensions.get('window');
const CARD_HEIGHT = 220;
const PADDING = 15;
const CARD_WIDTH = width - (PADDING * 2); 

// EXPANDED Curated List
const INITIAL_LEAGUE_IDS = [
  '4328', // Soccer: EPL
  '4387', // Basketball: NBA
  '4436', // Cricket: IPL
  '4335', // Soccer: La Liga
  '4391', // Am. Football: NFL
  '4332', // Soccer: Serie A
  '4331', // Soccer: Bundesliga
  '4370', // Motorsport: F1
  '4380', // Hockey: NHL
  '4429', // MMA: UFC
  '4480', // Soccer: UCL
];

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  
  const [leagues, setLeagues] = useState([]); 
  const [filteredLeagues, setFilteredLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Track visible items for performance
  const [viewableItems, setViewableItems] = useState([]);

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const promises = INITIAL_LEAGUE_IDS.map(id =>
          axios.get(`https://www.thesportsdb.com/api/v1/json/3/lookupleague.php?id=${id}`)
        );
        const responses = await Promise.all(promises);
        const cleanData = responses
          .map(res => res.data.leagues ? res.data.leagues[0] : null)
          .filter(item => item !== null);

        setLeagues(cleanData);
        setFilteredLeagues(cleanData); 
      } catch (error) {
        console.error("Error fetching leagues:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeagues();
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text) {
      const filtered = leagues.filter((league) =>
        league.strLeague.toLowerCase().includes(text.toLowerCase()) ||
        league.strSport.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredLeagues(filtered);
    } else {
      setFilteredLeagues(leagues);
    }
  };

  const handleLeaguePress = (league) => {
    dispatch(setActiveLeague(league));
    navigation.navigate('LeagueDashboard');
  };

  // Viewability Config
  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    const visibleIds = viewableItems.map(item => item.item.idLeague);
    setViewableItems(visibleIds);
  }, []);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50 
  }).current;

  // --- Sub-Components ---

  const HeroSlide = ({ title, subtitle, color }) => (
    <View style={[styles.heroSlide, { backgroundColor: color }]}>
      <Image 
        source={{ uri: 'https://www.transparenttextures.com/patterns/cubes.png' }} 
        style={styles.patternOverlay}
      />
      
      {/* User Greeting - Moved higher and given separate space */}
      <View style={styles.userGreetingContainer}>
        <Text style={styles.greetingText}>Hi, {user?.firstName || 'Athlete'}</Text>
        <View style={styles.userAvatar}>
           <Image 
             source={{ uri: user?.image || 'https://via.placeholder.com/40' }} 
             style={{ width: 36, height: 36, borderRadius: 18 }}
           />
        </View>
      </View>

      <View style={styles.heroContent}>
        <Text style={styles.heroTitle}>{title}</Text>
        <Text style={styles.heroSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );

  // Smart Live Card with Randomized Timing
  const LeagueCard = React.memo(({ league, onPress, isVisible }) => {
    const images = [
      league.strFanart1, 
      league.strFanart2, 
      league.strFanart3, 
      league.strFanart4
    ].filter(img => img);

    const finalImages = images.length > 0 ? images : ['https://via.placeholder.com/400x200/3663b1/ffffff?text=No+Image'];
    const translateX = useRef(new Animated.Value(0)).current;
    const [currentIndex, setCurrentIndex] = useState(0);

    // Generate a random duration between 3000ms and 6000ms for each card
    // This desynchronizes animations to prevent CPU spikes (Lag Fix)
    const intervalDuration = useRef(Math.floor(Math.random() * 3000) + 3000).current;

    useEffect(() => {
      if (!isVisible || finalImages.length <= 1) return;

      const interval = setInterval(() => {
        let nextIndex = currentIndex + 1;
        if (nextIndex >= finalImages.length) nextIndex = 0; 

        Animated.timing(translateX, {
          toValue: -nextIndex * CARD_WIDTH,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease)
        }).start();

        setCurrentIndex(nextIndex);
      }, intervalDuration); // Use randomized duration

      return () => clearInterval(interval);
    }, [currentIndex, finalImages.length, isVisible, intervalDuration]);

    return (
      <TouchableOpacity 
        style={styles.cardContainer} 
        activeOpacity={0.95}
        onPress={() => onPress(league)}
      >
        <Animated.View 
          style={{
            flexDirection: 'row',
            width: CARD_WIDTH * finalImages.length,
            height: '100%',
            transform: [{ translateX }]
          }}
        >
          {finalImages.map((img, index) => (
            <Image 
              key={index} 
              source={{ uri: img }} 
              style={{ width: CARD_WIDTH, height: '100%' }} 
              resizeMode="cover" 
            />
          ))}
        </Animated.View>

        <View style={styles.cardOverlay} />
        
        <View style={styles.cardContent}>
          <Image source={{ uri: league.strBadge }} style={styles.leagueBadge} resizeMode="contain" />
          <View>
            <Text style={styles.leagueName}>{league.strLeague}</Text>
            <Text style={styles.sportName}>{league.strSport}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3663b1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <FlatList
        data={filteredLeagues}
        keyExtractor={(item) => item.idLeague}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        removeClippedSubviews={true} // Performance optimization
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        
        ListHeaderComponent={
          <View style={{ marginBottom: 10 }}>
            {/* Hero Slider */}
            <ScrollView 
              horizontal 
              pagingEnabled 
              showsHorizontalScrollIndicator={false}
              style={styles.heroContainer}
              contentContainerStyle={{ padding: 0, margin: 0 }}
            >
              <HeroSlide title="Welcome to SportyX" subtitle="Your Ultimate Sports Hub" color="#3663b1" />
              <HeroSlide title="Live Scores" subtitle="Real-time Match Updates" color="#2c3e50" />
              <HeroSlide title="Player Stats" subtitle="Deep Dive into Data" color="#c0392b" />
            </ScrollView>

            {/* Search Bar */}
            <View style={styles.paddedSection}>
              <View style={styles.searchContainer}>
                <Feather name="search" size={20} color="#888" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search Leagues..."
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={handleSearch}
                />
              </View>
              <Text style={styles.sectionTitle}>Featured Leagues</Text>
            </View>
          </View>
        }
        
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
             <LeagueCard 
               league={item} 
               onPress={handleLeaguePress} 
               isVisible={viewableItems.includes(item.idLeague)}
             />
          </View>
        )}
        
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="frown" size={40} color="#ccc" />
            <Text style={styles.emptyText}>No leagues found.</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Hero Styles - Increased Height for better spacing
  heroContainer: { height: 240, marginBottom: 20 },
  heroSlide: {
    width: width, 
    height: 240,
    justifyContent: 'flex-end', 
    padding: 20,
    paddingBottom: 40,
    paddingTop: 80, // Added top padding so content doesn't hit header
  },
  patternOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
  },
  heroTitle: { color: 'white', fontSize: 32, fontWeight: 'bold', letterSpacing: 0.5 },
  heroSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 16, marginTop: 5 },
  
  // User Greeting Styles
  userGreetingContainer: {
    position: 'absolute',
    top: 50, // Kept high
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 30,
    zIndex: 10,
  },
  greetingText: { color: 'white', fontWeight: 'bold', marginRight: 10 },
  userAvatar: { 
    borderWidth: 2, 
    borderColor: 'white', 
    borderRadius: 20,
    overflow: 'hidden'
  },

  paddedSection: { paddingHorizontal: PADDING },

  // Search Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: '#333', fontSize: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  
  // Card Styles
  cardWrapper: { paddingHorizontal: PADDING },
  cardContainer: {
    height: CARD_HEIGHT,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'white',
    elevation: 5,
    width: CARD_WIDTH,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.40)',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '100%'
  },
  leagueBadge: {
    width: 50,
    height: 50,
    marginBottom: 10,
    position: 'absolute',
    top: 15,
    left: 15
  },
  leagueName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  sportName: {
    color: '#ddd',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 4
  },
  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#999', marginTop: 10, fontSize: 16 }
});

export default HomeScreen;