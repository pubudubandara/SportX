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
  StatusBar,
  Animated,
  Easing
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setActiveLeague } from '../redux/sportsSlice';

const { width } = Dimensions.get('window');
const CARD_HEIGHT = 220;
const PADDING = 15;
const CARD_WIDTH = width - (PADDING * 2); 

// --- IMAGE OPTIMIZATION HELPER ---
const getOptimizedImage = (url, type = 'original') => {
  if (!url || url.includes('via.placeholder') || url.includes('transparenttextures')) return url;
  
  switch (type) {
    case 'tiny': return `${url}/tiny`;   
    case 'small': return `${url}/small`;  
    case 'preview': return `${url}/preview`; 
    default: return url;
  }
};

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  
  // --- STATE ---
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('England'); // Default
  const [leagues, setLeagues] = useState([]); 
  
  const [loading, setLoading] = useState(true);
  const [refreshingLeagues, setRefreshingLeagues] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Viewability
  const [viewableItems, setViewableItems] = useState([]);

  // 1. Fetch All Countries on Mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get('https://www.thesportsdb.com/api/v1/json/3/all_countries.php');
        // Sort alphabetically and filter out non-standard entries if needed
        const sortedCountries = response.data.countries
          .sort((a, b) => a.name_en.localeCompare(b.name_en));
        
        setCountries(sortedCountries);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };
    fetchCountries();
  }, []);

  // 2. Fetch Leagues when Country Changes
  useEffect(() => {
    const fetchLeaguesByCountry = async () => {
      try {
        setRefreshingLeagues(true);
        
        // Step A: Get all leagues for the country
        const searchRes = await axios.get(`https://www.thesportsdb.com/api/v1/json/3/search_all_leagues.php?c=${selectedCountry}`);
        
        if (searchRes.data.countries) { // API returns 'countries' key for league search sometimes, or 'leagues'
           // TheSportsDB generic search returns 'countries' array for leagues sometimes? 
           // Actually for search_all_leagues it usually returns "countries" object which is confusing, 
           // OR it might return null if no leagues. Let's handle standard 'leagues' check.
           // Correction: The endpoint search_all_leagues.php?c=England returns key "countries" (historical quirk) or "leagues".
           const rawLeagues = searchRes.data.countries || searchRes.data.leagues || [];

           // Step B: Filter specific sports to avoid noise (Optional, but recommended)
           // We stick to major sports to avoid "Amateur Chess in England" cluttering UI
           const MAJOR_SPORTS = ['Soccer', 'Basketball', 'Cricket', 'Motorsport', 'Rugby', 'Ice Hockey', 'American Football', 'Baseball', 'Fighting'];
           const filteredRaw = rawLeagues.filter(l => MAJOR_SPORTS.includes(l.strSport));

           // Step C: Hydrate Top 10 Results (Fetch details to get Fanart/Images)
           // We limit to 10 to prevent rate limiting
           const topLeagues = filteredRaw.slice(0, 10);
           
           const detailPromises = topLeagues.map(l => 
             axios.get(`https://www.thesportsdb.com/api/v1/json/3/lookupleague.php?id=${l.idLeague}`)
           );

           const detailResponses = await Promise.all(detailPromises);
           const cleanLeagues = detailResponses
             .map(res => res.data.leagues ? res.data.leagues[0] : null)
             .filter(item => item !== null);

           setLeagues(cleanLeagues);
        } else {
           setLeagues([]);
        }

      } catch (error) {
        console.error("Error fetching leagues for country:", error);
        setLeagues([]);
      } finally {
        setRefreshingLeagues(false);
        setLoading(false);
      }
    };

    if (selectedCountry) {
      fetchLeaguesByCountry();
    }
  }, [selectedCountry]);

  const handleLeaguePress = (league) => {
    dispatch(setActiveLeague(league));
    navigation.navigate('LeagueDashboard');
  };

  // Search within the currently displayed leagues
  const filteredLeagues = leagues.filter(l => 
    l.strLeague.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.strSport.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    const visibleIds = viewableItems.map(item => item.item.idLeague);
    setViewableItems(visibleIds);
  }, []);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  // --- SUB-COMPONENTS ---

  const Header = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerLeft}>
        <View style={styles.logoCircle}>
          <Feather name="activity" size={20} color="white" />
        </View>
        <Text style={styles.headerTitle}>SportyX</Text>
      </View>
      <TouchableOpacity style={styles.profileButton}>
        <Image 
          source={{ uri: getOptimizedImage(user?.image, 'tiny') || 'https://via.placeholder.com/40' }} 
          style={styles.profileImage} 
        />
        <View style={styles.onlineBadge} />
      </TouchableOpacity>
    </View>
  );

  const CountrySelector = () => (
    <View style={styles.countrySection}>
      <Text style={styles.sectionTitleSmall}>Select Country</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={{ paddingHorizontal: 15 }}
      >
        {countries.map((country, index) => {
          const isSelected = selectedCountry === country.name_en;
          return (
            <TouchableOpacity 
              key={index} 
              onPress={() => setSelectedCountry(country.name_en)}
              style={[styles.countryChip, isSelected && styles.countryChipActive]}
            >
              <Text style={[styles.countryText, isSelected && styles.countryTextActive]}>
                {country.name_en}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const LeagueCard = React.memo(({ league, onPress, isVisible }) => {
    const images = [league.strFanart1, league.strFanart2, league.strFanart3, league.strFanart4]
      .filter(img => img)
      .map(img => getOptimizedImage(img, 'preview'));

    const finalImages = images.length > 0 ? images : ['https://via.placeholder.com/400x200/3663b1/ffffff?text=No+Image'];
    const translateX = useRef(new Animated.Value(0)).current;
    const [currentIndex, setCurrentIndex] = useState(0);
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
      }, intervalDuration);
      return () => clearInterval(interval);
    }, [currentIndex, finalImages.length, isVisible, intervalDuration]);

    return (
      <TouchableOpacity style={styles.cardContainer} activeOpacity={0.95} onPress={() => onPress(league)}>
        <Animated.View 
          style={{
            flexDirection: 'row',
            width: CARD_WIDTH * finalImages.length,
            height: '100%',
            transform: [{ translateX }]
          }}
        >
          {finalImages.map((img, index) => (
            <Image key={index} source={{ uri: img }} style={{ width: CARD_WIDTH, height: '100%' }} resizeMode="cover" />
          ))}
        </Animated.View>
        <View style={styles.cardOverlay} />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Image source={{ uri: getOptimizedImage(league.strBadge, 'tiny') }} style={styles.leagueBadge} resizeMode="contain" />
            <View style={styles.sportBadge}>
              <Text style={styles.sportBadgeText}>{league.strSport}</Text>
            </View>
          </View>
          <Text style={styles.leagueName}>{league.strLeague}</Text>
        </View>
      </TouchableOpacity>
    );
  });

  if (loading && leagues.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3663b1" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading Countries...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#f8f9fa" barStyle="dark-content" />
      <Header />

      <FlatList
        data={filteredLeagues}
        keyExtractor={(item) => item.idLeague}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        removeClippedSubviews={true}
        
        ListHeaderComponent={
          <>
            <View style={styles.searchWrapper}>
              <View style={styles.searchContainer}>
                <Feather name="search" size={20} color="#888" />
                <TextInput
                  style={styles.searchInput}
                  placeholder={`Search in ${selectedCountry}...`}
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>

            {/* 1. Country Selector Strip */}
            <CountrySelector />

            {/* 2. Status Indicator */}
            <View style={styles.statusRow}>
              <Text style={styles.sectionTitle}>
                Top Leagues in <Text style={{color: '#3663b1'}}>{selectedCountry}</Text>
              </Text>
              {refreshingLeagues && <ActivityIndicator size="small" color="#3663b1" />}
            </View>
          </>
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
            {!refreshingLeagues ? (
              <>
                <Feather name="map" size={40} color="#ccc" />
                <Text style={styles.emptyText}>No major leagues found for {selectedCountry}.</Text>
                <Text style={styles.subEmptyText}>Try selecting England, Spain, USA, or India.</Text>
              </>
            ) : (
               <View style={{height: 200}} /> // Placeholder while loading
            )}
          </View>
        }
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 50,
    backgroundColor: 'white',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logoCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#3663b1', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#333', letterSpacing: 0.5 },
  profileImage: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#f0f0f0' },
  onlineBadge: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#2ecc71', position: 'absolute', bottom: 0, right: 0, borderWidth: 2, borderColor: 'white' },

  searchWrapper: { paddingHorizontal: 15, marginVertical: 15 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#333' },

  // Country Selector Styles
  countrySection: { marginBottom: 20 },
  sectionTitleSmall: { fontSize: 14, fontWeight: '600', color: '#888', marginLeft: 20, marginBottom: 10, textTransform: 'uppercase' },
  countryChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#eee',
    minWidth: 80,
    alignItems: 'center'
  },
  countryChipActive: { backgroundColor: '#3663b1', borderColor: '#3663b1' },
  countryText: { color: '#555', fontWeight: '600' },
  countryTextActive: { color: 'white' },

  statusRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginRight: 10 },

  // Card Styles
  cardWrapper: { paddingHorizontal: PADDING },
  cardContainer: {
    height: CARD_HEIGHT,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'white',
    elevation: 5,
  },
  cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  cardContent: { flex: 1, padding: 20, justifyContent: 'space-between', position: 'absolute', bottom: 0, width: '100%', height: '100%' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', position: 'absolute', top: 20, left: 20, width: '100%' },
  leagueBadge: { width: 50, height: 50 },
  sportBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backdropFilter: 'blur(10px)', marginRight: 40 },
  sportBadgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  leagueName: { color: 'white', fontSize: 24, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: -1, height: 1 }, textShadowRadius: 10 },

  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#333', marginTop: 10, fontSize: 16, fontWeight: 'bold' },
  subEmptyText: { color: '#888', marginTop: 5, fontSize: 14 }
});

export default HomeScreen;