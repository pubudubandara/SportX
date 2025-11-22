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

const ResultsScreen = ({ navigation }) => {
  const activeLeague = useSelector(selectActiveLeague);
  const isDarkMode = useSelector(selectIsDarkMode);
  const COLORS = getColors(isDarkMode);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const leagueId = activeLeague?.idLeague || '4328';
      const response = await axios.get(
        `https://www.thesportsdb.com/api/v1/json/3/eventspastleague.php?id=${leagueId}`
      );
      setResults(response.data.events || []);
    } catch (err) {
      setError('Failed to load results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
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

  const getResultStatus = (homeScore, awayScore) => {
    if (homeScore > awayScore) return 'home-win';
    if (awayScore > homeScore) return 'away-win';
    return 'draw';
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={24} color={COLORS.white} />
      </TouchableOpacity>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>{activeLeague?.strLeague || activeLeague?.name || 'League'} Results</Text>
        <Text style={styles.headerSubtitle}>
          {results.length} recent matches
        </Text>
      </View>
    </View>
  );

  const renderResultCard = ({ item }) => {
    const homeScore = item.intHomeScore || '0';
    const awayScore = item.intAwayScore || '0';
    const resultStatus = getResultStatus(parseInt(homeScore), parseInt(awayScore));

    return (
      <View style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <Icon name="activity" size={16} color={COLORS.primary} />
          <Text style={styles.resultDate}>{formatDate(item.dateEvent)}</Text>
          {item.strStatus === 'FT' && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>FULL TIME</Text>
            </View>
          )}
        </View>
        
        <View style={styles.resultContent}>
          <View style={[styles.teamResultContainer, resultStatus === 'home-win' && styles.winnerTeam]}>
            {item.strHomeTeamBadge && (
              <Image
                source={{ uri: `${item.strHomeTeamBadge}/tiny` }}
                style={styles.teamBadgeSmall}
                resizeMode="contain"
              />
            )}
            <Text style={[styles.teamNameResult, resultStatus === 'home-win' && styles.winnerText]}>
              {item.strHomeTeam}
            </Text>
            <View style={[styles.scoreBox, resultStatus === 'home-win' && styles.winnerScore]}>
              <Text style={[styles.scoreText, resultStatus === 'home-win' && styles.winnerScoreText]}>
                {homeScore}
              </Text>
            </View>
          </View>
          
          <View style={styles.separator}>
            <Text style={styles.separatorText}>-</Text>
          </View>
          
          <View style={[styles.teamResultContainer, resultStatus === 'away-win' && styles.winnerTeam]}>
            <View style={[styles.scoreBox, resultStatus === 'away-win' && styles.winnerScore]}>
              <Text style={[styles.scoreText, resultStatus === 'away-win' && styles.winnerScoreText]}>
                {awayScore}
              </Text>
            </View>
            <Text style={[styles.teamNameResult, resultStatus === 'away-win' && styles.winnerText]}>
              {item.strAwayTeam}
            </Text>
            {item.strAwayTeamBadge && (
              <Image
                source={{ uri: `${item.strAwayTeamBadge}/tiny` }}
                style={styles.teamBadgeSmall}
                resizeMode="contain"
              />
            )}
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
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="activity" size={60} color={COLORS.textLight} />
      <Text style={styles.emptyText}>No Past Results</Text>
      <Text style={styles.emptySubtext}>Results will appear here after matches</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyState}>
      <Icon name="alert-circle" size={60} color={COLORS.error} />
      <Text style={styles.emptyText}>Oops! Something went wrong</Text>
      <Text style={styles.emptySubtext}>{error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={fetchResults}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const styles = createStyles(COLORS);

  if (loading && results.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading results...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && results.length === 0) {
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
          data={results}
          keyExtractor={(item, index) => item.idEvent || index.toString()}
          renderItem={renderResultCard}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={results.length === 0 ? styles.emptyList : styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchResults}
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
  resultCard: {
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
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  resultDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.semibold,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  statusBadge: {
    backgroundColor: `${COLORS.success}20`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.success,
    fontWeight: FONT_WEIGHTS.bold,
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  teamResultContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamBadgeSmall: {
    width: 32,
    height: 32,
    marginHorizontal: SPACING.xs,
  },
  winnerTeam: {
    opacity: 1,
  },
  teamNameResult: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    flex: 1,
  },
  winnerText: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.bold,
  },
  scoreBox: {
    minWidth: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.xs,
  },
  winnerScore: {
    backgroundColor: COLORS.primary,
  },
  scoreText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  winnerScoreText: {
    color: COLORS.white,
  },
  separator: {
    marginHorizontal: SPACING.xs,
  },
  separatorText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textLight,
    fontWeight: FONT_WEIGHTS.bold,
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

export default ResultsScreen;
