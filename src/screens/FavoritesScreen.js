import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../utils/constants';
import { setActiveLeague, toggleFavoriteLeague } from '../redux/sportsSlice';

const FavoritesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const favoriteLeagues = useSelector(state => state.sports.favoriteLeagues);
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavoriteLeagues();
  }, [favoriteLeagues]);

  const fetchFavoriteLeagues = async () => {
    if (favoriteLeagues.length === 0) {
      setLeagues([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const leaguePromises = favoriteLeagues.map(leagueId =>
        axios.get(`https://www.thesportsdb.com/api/v1/json/3/lookupleague.php?id=${leagueId}`)
      );
      const responses = await Promise.all(leaguePromises);
      const fetchedLeagues = responses
        .map(response => response.data.leagues?.[0])
        .filter(Boolean);
      setLeagues(fetchedLeagues);
    } catch (error) {
      console.error('Error fetching favorite leagues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaguePress = (league) => {
    dispatch(setActiveLeague(league));
    navigation.navigate('LeagueDashboard');
  };

  const handleRemoveFavorite = (leagueId) => {
    dispatch(toggleFavoriteLeague(leagueId));
  };

  const renderLeagueCard = ({ item }) => (
    <TouchableOpacity
      style={styles.leagueCard}
      activeOpacity={0.8}
      onPress={() => handleLeaguePress(item)}
    >
      <Image
        source={{ uri: `${item.strBadge}/tiny` }}
        style={styles.leagueBadge}
        resizeMode="contain"
      />
      <View style={styles.leagueInfo}>
        <Text style={styles.leagueName} numberOfLines={1}>
          {item.strLeague}
        </Text>
        <Text style={styles.leagueSport}>{item.strSport}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveFavorite(item.idLeague)}
      >
        <Icon name="heart" size={22} color="#ef4444" fill="#ef4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Favorite Leagues</Text>
          {leagues.length > 0 && (
            <Text style={styles.headerSubtitle}>{leagues.length} league{leagues.length !== 1 ? 's' : ''}</Text>
          )}
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : leagues.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="heart" size={60} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No Favorite Leagues</Text>
            <Text style={styles.emptySubtext}>
              Add leagues to your favorites by tapping the heart icon on any league card in the Home screen.
            </Text>
            <TouchableOpacity
              style={styles.goHomeButton}
              onPress={() => navigation.navigate('Home')}>
              <Text style={styles.goHomeText}>Browse Leagues</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={leagues}
            renderItem={renderLeagueCard}
            keyExtractor={item => item.idLeague}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: SPACING.md,
  },
  leagueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  leagueBadge: {
    width: 50,
    height: 50,
    marginRight: SPACING.md,
  },
  leagueInfo: {
    flex: 1,
  },
  leagueName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    marginBottom: 4,
  },
  leagueSport: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  removeButton: {
    padding: SPACING.sm,
    marginLeft: SPACING.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginTop: SPACING.lg,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    marginTop: SPACING.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
  goHomeButton: {
    marginTop: SPACING.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  goHomeText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});

export default FavoritesScreen;
