import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import { getColors, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../utils/constants';
import { selectActiveLeague } from '../redux/sportsSlice';
import { selectIsDarkMode } from '../redux/themeSlice';

const MatchesScreen = ({ navigation }) => {
  const activeLeague = useSelector(selectActiveLeague);
  const isDarkMode = useSelector(selectIsDarkMode);
  const COLORS = getColors(isDarkMode);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const leagueId = activeLeague?.idLeague || '4328';
      const response = await axios.get(
        `https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=${leagueId}`
      );
      setMatches(response.data.events || []);
    } catch (err) {
      setError('Failed to load matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [activeLeague]);

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={24} color={COLORS.white} />
      </TouchableOpacity>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>{activeLeague?.strLeague || activeLeague?.name || 'League'} Matches</Text>
        <Text style={styles.headerSubtitle}>
          {matches.length} fixtures scheduled
        </Text>
      </View>
    </View>
  );

  const renderMatchCard = ({ item }) => (
    <View style={styles.matchCard}>
      <View style={styles.matchHeader}>
        <Icon name="calendar" size={16} color={COLORS.primary} />
        <Text style={styles.matchDate}>{formatDate(item.dateEvent)}</Text>
        {item.strTime && (
          <Text style={styles.matchTime}>• {formatTime(item.strTime)}</Text>
        )}
      </View>
      
      <View style={styles.matchContent}>
        <View style={styles.teamContainer}>
          {item.strHomeTeamBadge && (
            <Image
              source={{ uri: `${item.strHomeTeamBadge}/tiny` }}
              style={styles.teamBadge}
              resizeMode="contain"
            />
          )}
          <View style={styles.teamInfo}>
            <Text style={styles.teamName}>{item.strHomeTeam}</Text>
            <Text style={styles.homeLabel}>HOME</Text>
          </View>
        </View>
        
        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>
        
        <View style={styles.teamContainer}>
          {item.strAwayTeamBadge && (
            <Image
              source={{ uri: `${item.strAwayTeamBadge}/tiny` }}
              style={styles.teamBadge}
              resizeMode="contain"
            />
          )}
          <View style={styles.teamInfo}>
            <Text style={styles.teamName}>{item.strAwayTeam}</Text>
            <Text style={styles.awayLabel}>AWAY</Text>
          </View>
        </View>
      </View>

      {item.strVenue && (
        <View style={styles.venueContainer}>
          <Icon name="map-pin" size={14} color={COLORS.textLight} />
          <Text style={styles.venueText}>{item.strVenue}</Text>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="calendar" size={60} color={COLORS.textLight} />
      <Text style={styles.emptyText}>No Upcoming Matches</Text>
      <Text style={styles.emptySubtext}>Check back later for fixtures</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyState}>
      <Icon name="alert-circle" size={60} color={COLORS.error} />
      <Text style={styles.emptyText}>Oops! Something went wrong</Text>
      <Text style={styles.emptySubtext}>{error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={fetchMatches}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const styles = createStyles(COLORS);

  if (loading && matches.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading matches...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && matches.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {renderHeader()}
          {renderErrorState()}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FlatList
          data={matches}
          keyExtractor={(item, index) => item.idEvent || index.toString()}
          renderItem={renderMatchCard}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={matches.length === 0 ? styles.emptyList : styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchMatches}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderBottomWidth: 0,
  },
  backButton: {
    padding: SPACING.sm,
    marginRight: SPACING.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    marginTop: SPACING.xs,
    opacity: 0.9,
  },
  listContent: {
    padding: SPACING.lg,
  },
  emptyList: {
    flexGrow: 1,
  },
  matchCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  matchDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.semibold,
    marginLeft: SPACING.xs,
  },
  matchTime: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginLeft: SPACING.xs,
  },
  matchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  teamContainer: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  teamBadge: {
    width: 40,
    height: 40,
    marginRight: SPACING.sm,
  },
  teamInfo: {
    alignItems: 'center',
    flex: 1,
  },
  teamName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  homeLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  awayLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.secondary,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  vsContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${COLORS.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.sm,
  },
  vsText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  venueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  venueText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginLeft: SPACING.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl * 2,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  retryText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});

export default MatchesScreen;
