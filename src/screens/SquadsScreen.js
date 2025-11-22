import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import { getColors, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../utils/constants';
import { selectActiveLeague } from '../redux/sportsSlice';
import { selectIsDarkMode } from '../redux/themeSlice';
import { TeamCardSkeleton } from '../components/SkeletonLoader';

const SquadsScreen = ({ navigation }) => {
  const activeLeague = useSelector(selectActiveLeague);
  const isDarkMode = useSelector(selectIsDarkMode);
  const COLORS = getColors(isDarkMode);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTeams();
  }, [activeLeague]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const leagueName = activeLeague?.strLeague || activeLeague?.str || 'English Premier League';
      const response = await axios.get(
        `https://www.thesportsdb.com/api/v1/json/3/search_all_teams.php?l=${encodeURIComponent(leagueName)}`
      );
      setTeams(response.data.teams || []);
    } catch (err) {
      setError('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const handleTeamPress = (team) => {
    navigation.navigate('TeamSquad', { team });
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={24} color={COLORS.white} />
      </TouchableOpacity>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Squad List</Text>
        <Text style={styles.headerSubtitle}>{activeLeague?.strLeague || activeLeague?.name || 'League'} rosters</Text>
      </View>
    </View>
  );

  const styles = createStyles(COLORS);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {renderHeader()}
        <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          
          <View style={styles.instructionSection}>
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Icon name="users" size={40} color={COLORS.primary} />
              </View>
            </View>
            <Text style={styles.title}>Select a Team</Text>
            <Text style={styles.description}>
              Choose a team below to view their complete squad roster and player details.
            </Text>
          </View>

          {loading ? (
            <View>
              <Text style={styles.sectionTitle}>Loading Teams...</Text>
              <TeamCardSkeleton />
              <TeamCardSkeleton />
              <TeamCardSkeleton />
              <TeamCardSkeleton />
              <TeamCardSkeleton />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={48} color={COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchTeams}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>{activeLeague?.strLeague || activeLeague?.name || 'League'} Teams</Text>
              <View style={styles.teamsContainer}>
                {teams.map((team) => (
                  <TouchableOpacity
                    key={team.idTeam}
                    style={styles.teamCard}
                    onPress={() => handleTeamPress(team)}
                    activeOpacity={0.8}>
                    {team.strTeamBadge ? (
                      <Image
                        source={{ uri: team.strTeamBadge }}
                        style={styles.teamBadge}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={styles.teamBadgePlaceholder}>
                        <Icon name="shield" size={40} color={COLORS.textLight} />
                      </View>
                    )}
                    <View style={styles.teamInfo}>
                      <Text style={styles.teamName} numberOfLines={1}>
                        {team.strTeam}
                      </Text>
                      {team.strStadium && (
                        <Text style={styles.teamStadium} numberOfLines={1}>
                          {team.strStadium}
                        </Text>
                      )}
                    </View>
                    <Icon name="chevron-right" size={20} color={COLORS.textLight} />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </ScrollView>
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
  content: {
    flexGrow: 1,
    padding: SPACING.lg,
  },
  instructionSection: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  iconContainer: {
    marginBottom: SPACING.md,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: `${COLORS.primary}30`,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  errorText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  teamsContainer: {
    gap: SPACING.sm,
  },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  teamBadge: {
    width: 50,
    height: 50,
    marginRight: SPACING.md,
  },
  teamBadgePlaceholder: {
    width: 50,
    height: 50,
    marginRight: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  teamName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
  },
  teamStadium: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },

  infoCard: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.primary}10`,
    padding: SPACING.md,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    marginTop: SPACING.xl,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginLeft: SPACING.md,
    lineHeight: 20,
  },
});

export default SquadsScreen;
