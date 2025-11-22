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
  Easing,
  Keyboard,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setActiveLeague, toggleFavoriteLeague, setSelectedCountry as setSelectedCountryRedux, selectSelectedCountry } from '../redux/sportsSlice';
import { selectIsDarkMode } from '../redux/themeSlice';
import { getColors } from '../utils/constants';
import { HomeScreenSkeleton } from '../components/SkeletonLoader';

const { width } = Dimensions.get('window');
const PADDING = 15;
// Adjusted sizes for horizontal layout
const LEAGUE_CARD_WIDTH = width * 0.75;
const LEAGUE_CARD_HEIGHT = 180;

const getOptimizedImage = (url, type = 'original') => {
  if (
    !url ||
    url.includes('via.placeholder') ||
    url.includes('transparenttextures')
  )
    return url;
  switch (type) {
    case 'tiny':
      return `${url}/tiny`;
    case 'small':
      return `${url}/small`;
    case 'preview':
      return `${url}/preview`;
    default:
      return url;
  }
};

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const isDarkMode = useSelector(selectIsDarkMode);
  const selectedCountry = useSelector(selectSelectedCountry);
  const COLORS = getColors(isDarkMode);

  // --- STATE ---
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [displayCountry, setDisplayCountry] = useState(selectedCountry || 'England');

  const [leagues, setLeagues] = useState([]);

  // Match Data State
  const [todaysMatches, setTodaysMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshingLeagues, setRefreshingLeagues] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [viewableItems, setViewableItems] = useState([]);

  // Sync displayCountry with Redux selectedCountry
  useEffect(() => {
    setDisplayCountry(selectedCountry || 'England');
  }, [selectedCountry]);

  // 1. Fetch Countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get(
          'https://www.thesportsdb.com/api/v1/json/3/all_countries.php',
        );
        const sortedCountries = response.data.countries.sort((a, b) =>
          a.name_en.localeCompare(b.name_en),
        );

        setCountries(sortedCountries);
        setFilteredCountries(sortedCountries);
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };
    fetchCountries();
  }, []);

  // 2. Fetch Leagues & Matches when Country Changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setRefreshingLeagues(true);

        // A. Fetch Leagues
        const searchRes = await axios.get(
          `https://www.thesportsdb.com/api/v1/json/3/search_all_leagues.php?c=${displayCountry}`,
        );

        if (searchRes.data.countries || searchRes.data.leagues) {
          const rawLeagues =
            searchRes.data.countries || searchRes.data.leagues || [];
          const MAJOR_SPORTS = [
            'Soccer',
            'Basketball',
            'Cricket',
            'Motorsport',
            'Rugby',
            'Ice Hockey',
            'American Football',
            'Baseball',
            'Fighting',
            'Golf',
            'Tennis',
          ];
          const filteredRaw = rawLeagues.filter(l =>
            MAJOR_SPORTS.includes(l.strSport),
          );
          const topLeagues = filteredRaw.slice(0, 8); // Get top 8 for horizontal scroll

          const detailPromises = topLeagues.map(l =>
            axios.get(
              `https://www.thesportsdb.com/api/v1/json/3/lookupleague.php?id=${l.idLeague}`,
            ),
          );

          const detailResponses = await Promise.all(detailPromises);
          const cleanLeagues = detailResponses
            .map(res => (res.data.leagues ? res.data.leagues[0] : null))
            .filter(item => item !== null);

          setLeagues(cleanLeagues);

          // B. Fetch Matches for the #1 League in this country
          if (cleanLeagues.length > 0) {
            fetchMatches(cleanLeagues[0].idLeague);
          } else {
            setTodaysMatches([]);
            setUpcomingMatches([]);
          }
        } else {
          setLeagues([]);
          setTodaysMatches([]);
          setUpcomingMatches([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setLeagues([]);
      } finally {
        setRefreshingLeagues(false);
        setLoading(false);
      }
    };

    fetchData();
  }, [displayCountry]);

  const fetchMatches = async leagueId => {
    try {
      const res = await axios.get(
        `https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=${leagueId}`,
      );
      const events = res.data.events || [];

      // Filter Today vs Upcoming
      // Note: Date format from API is usually YYYY-MM-DD
      const todayStr = new Date().toISOString().split('T')[0];

      const today = events.filter(e => e.dateEvent === todayStr);
      const upcoming = events.filter(e => e.dateEvent !== todayStr);

      setTodaysMatches(today);
      setUpcomingMatches(upcoming);
    } catch (e) {
      console.log('No matches found');
    }
  };

  const handleSearch = text => {
    setSearchQuery(text);
    if (text) {
      const filtered = countries.filter(c =>
        c.name_en.toLowerCase().includes(text.toLowerCase()),
      );
      setFilteredCountries(filtered);
    } else {
      setFilteredCountries(countries);
    }
  };

  const handleCountrySelect = countryName => {
    setDisplayCountry(countryName);
    setSearchQuery('');
    setFilteredCountries(countries);
    Keyboard.dismiss();
  };

  const handleLeaguePress = league => {
    dispatch(setActiveLeague(league));
    navigation.navigate('LeagueDashboard');
  };

  // --- COMPONENTS ---

  const Header = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerLeft}>
        <View style={styles.logoCircle}>
          <Feather name="activity" size={20} color="#3663b1" />
        </View>
        <Text style={styles.headerTitle}>SportyX</Text>
      </View>
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => navigation.navigate('Profile')}
      >
        <Image
          source={{
            uri:
              getOptimizedImage(user?.image, 'tiny') ||
              'https://via.placeholder.com/40',
          }}
          style={styles.profileImage}
        />
        <View style={styles.onlineBadge} />
      </TouchableOpacity>
    </View>
  );

  const CountrySelector = () => (
    <View style={styles.countrySection}>
      <Text style={styles.sectionTitleSmall}>
        {searchQuery ? 'Search Results' : 'Browse by Country'}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        keyboardShouldPersistTaps="handled"
      >
        {filteredCountries.length > 0 ? (
          filteredCountries.map((country, index) => {
            const isSelected = displayCountry === country.name_en;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleCountrySelect(country.name_en)}
                style={[
                  styles.countryChip,
                  isSelected && styles.countryChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.countryText,
                    isSelected && styles.countryTextActive,
                  ]}
                >
                  {country.name_en}
                </Text>
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={{ color: '#999', fontStyle: 'italic', marginTop: 10 }}>
            No countries found
          </Text>
        )}
      </ScrollView>
    </View>
  );

  const LeagueCardHorizontal = ({ league, onPress }) => {
    const favoriteLeagues = useSelector(state => state.sports.favoriteLeagues);
    const isFavorite = favoriteLeagues.includes(league.idLeague);
    
    const images = [
      league.strFanart1,
      league.strFanart2,
      league.strFanart3,
      league.strFanart4,
    ]
      .filter(img => img)
      .map(img => getOptimizedImage(img, 'preview'));

    const bgImage =
      images.length > 0
        ? images[0]
        : 'https://via.placeholder.com/400x200/3663b1/ffffff?text=No+Image';

    const toggleFavorite = (e) => {
      e?.stopPropagation();
      console.log('Toggling favorite for league:', league.idLeague);
      console.log('Current favorites:', favoriteLeagues);
      dispatch(toggleFavoriteLeague(league.idLeague));
      console.log('Dispatched toggleFavoriteLeague');
    };

    return (
      <TouchableOpacity
        style={styles.leagueCardH}
        activeOpacity={0.9}
        onPress={() => onPress(league)}
      >
        <Image
          source={{ uri: bgImage }}
          style={styles.cardBg}
          resizeMode="cover"
        />
        <View style={styles.cardOverlay} />
        
        {/* Favorite Button */}
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={toggleFavorite}
          activeOpacity={0.7}
        >
          <Feather 
            name={isFavorite ? "heart" : "heart"} 
            size={20} 
            color={isFavorite ? "#ef4444" : "#ffffff"}
            fill={isFavorite ? "#ef4444" : "transparent"}
          />
        </TouchableOpacity>

        <View style={styles.cardContent}>
          <View style={styles.cardTopRow}>
            <View style={styles.sportBadge}>
              <Text style={styles.sportBadgeText}>{league.strSport}</Text>
            </View>
          </View>
          <View style={styles.cardBottom}>
            <Text style={styles.leagueNameH} numberOfLines={2}>
              {league.strLeague}
            </Text>
            <Image
              source={{ uri: getOptimizedImage(league.strBadge, 'tiny') }}
              style={styles.leagueBadgeSmall}
              resizeMode="contain"
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const MatchCard = ({ match, isToday }) => (
    <View style={[styles.matchCard, isToday && styles.matchCardToday]}>
      {isToday && (
        <View style={styles.liveBadge}>
          <Text style={styles.liveText}>TODAY</Text>
        </View>
      )}
      <View style={styles.matchRow}>
        <Text style={styles.matchTeam} numberOfLines={1}>
          {match.strHomeTeam}
        </Text>
        <Text style={styles.vsText}>VS</Text>
        <Text style={styles.matchTeam} numberOfLines={1}>
          {match.strAwayTeam}
        </Text>
      </View>
      <View style={styles.matchFooter}>
        <Text style={styles.matchDate}>{match.dateEvent}</Text>
        <Text style={styles.matchTime}>
          {match.strTime ? match.strTime.substring(0, 5) : 'TBD'}
        </Text>
      </View>
    </View>
  );

  const styles = createStyles(COLORS);

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
        <Header />
        <HomeScreenSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <Header />
      <FlatList
        data={upcomingMatches}
        keyExtractor={item => item.idEvent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        ListHeaderComponent={
          <>
            {/* Search & Country */}
            <View style={styles.searchWrapper}>
              <View style={styles.searchContainer}>
                <Feather name="search" size={20} color="#888" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Find Country..."
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={handleSearch}
                />
              </View>
            </View>
            <CountrySelector />

            {/* Horizontal Leagues */}
            <View style={styles.sectionContainer}>
              <View style={styles.statusRow}>
                <Text style={styles.sectionTitle}>
                  Top Leagues in{' '}
                  <Text style={{ color: '#3663b1' }}>{displayCountry}</Text>
                </Text>
                {refreshingLeagues && (
                  <ActivityIndicator size="small" color="#3663b1" />
                )}
              </View>

              {leagues.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 15 }}
                >
                  {leagues.map(league => (
                    <LeagueCardHorizontal
                      key={league.idLeague}
                      league={league}
                      onPress={handleLeaguePress}
                    />
                  ))}
                </ScrollView>
              ) : (
                !refreshingLeagues && (
                  <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>No leagues found.</Text>
                  </View>
                )
              )}
            </View>

            {/* Today's Matches  */}
            {todaysMatches.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, { marginLeft: 15 }]}>
                  Today's Matches
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingHorizontal: 15,
                    paddingTop: 10,
                  }}
                >
                  {todaysMatches.map(match => (
                    <MatchCard
                      key={match.idEvent}
                      match={match}
                      isToday={true}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Upcoming Matches Title */}
            <Text
              style={[
                styles.sectionTitle,
                { marginLeft: 15, marginTop: 10, marginBottom: 10 },
              ]}
            >
              Upcoming Matches
            </Text>
            {upcomingMatches.length === 0 && !refreshingLeagues && (
              <Text
                style={{ marginLeft: 15, color: '#999', fontStyle: 'italic' }}
              >
                No upcoming matches scheduled.
              </Text>
            )}
          </>
        }
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 15, marginBottom: 10 }}>
            <MatchCard match={item} isToday={false} />
          </View>
        )}
      />

      {/* Floating Chatbot Button */}
      <TouchableOpacity
        style={styles.chatbotFab}
        onPress={() => navigation.navigate('Chatbot')}
        activeOpacity={0.8}
      >
        <Feather name="message-circle" size={28} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },

  // Header & Search
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 50,
    backgroundColor: COLORS.primary,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  onlineBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2ecc71',
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: 'white',
  },

  searchWrapper: { paddingHorizontal: 15, marginVertical: 15 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: COLORS.text },

  // Country Selector
  countrySection: { marginBottom: 20 },
  sectionTitleSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginLeft: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  countryChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 80,
    alignItems: 'center',
  },
  countryChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  countryText: { color: COLORS.textLight, fontWeight: '600' },
  countryTextActive: { color: '#ffffff' },

  // Section Layout
  sectionContainer: { marginBottom: 25 },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },

  // Horizontal League Card
  leagueCardH: {
    width: LEAGUE_CARD_WIDTH,
    height: LEAGUE_CARD_HEIGHT,
    marginRight: 15,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#333',
  },
  cardBg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cardContent: { flex: 1, padding: 15, justifyContent: 'space-between' },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  leagueBadgeSmall: { 
    width: 50, 
    height: 50,
    marginLeft: 10,
  },
  sportBadge: {
    backgroundColor: 'rgba(54, 99, 177, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sportBadgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  leagueNameH: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 2,
    flex: 1,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },

  // Match Card
  matchCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 5,
  },
  matchCardToday: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    minWidth: 260,
    marginRight: 15,
  },
  liveBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopRightRadius: 11,
    borderBottomLeftRadius: 8,
  },
  liveText: { color: '#ffffff', fontSize: 10, fontWeight: 'bold' },
  matchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  matchTeam: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  vsText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  matchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  matchDate: { color: COLORS.textLight, fontSize: 12 },
  matchTime: { color: COLORS.primary, fontWeight: 'bold', fontSize: 12 },

  emptyBox: { paddingHorizontal: 15 },
  emptyText: { color: COLORS.textLight, fontStyle: 'italic' },

  // Floating Chatbot Button
  chatbotFab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});

export default HomeScreen;
