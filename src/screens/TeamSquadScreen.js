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
import { selectIsDarkMode } from '../redux/themeSlice';
import { PlayerCardSkeleton } from '../components/SkeletonLoader';

const TeamSquadScreen = ({ route, navigation }) => {
  const { team } = route.params;
  const isDarkMode = useSelector(selectIsDarkMode);
  const COLORS = getColors(isDarkMode);
  const [squad, setSquad] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSquad();
  }, [team]);

  const fetchSquad = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `https://www.thesportsdb.com/api/v1/json/3/lookup_all_players.php?id=${team.idTeam}`
      );
      setSquad(response.data.player || []);
    } catch (err) {
      setError('Failed to load squad');
    } finally {
      setLoading(false);
    }
  };

  const groupPlayersByPosition = () => {
    const positions = {
      'Goalkeeper': [],
      'Defender': [],
      'Midfielder': [],
      'Forward': [],
      'Other': []
    };

    squad.forEach(player => {
      const pos = player.strPosition || 'Other';
      if (pos.includes('Goalkeeper') || pos.includes('Keeper')) {
        positions['Goalkeeper'].push(player);
      } else if (pos.includes('Defender') || pos.includes('Back')) {
        positions['Defender'].push(player);
      } else if (pos.includes('Midfield')) {
        positions['Midfielder'].push(player);
      } else if (pos.includes('Forward') || pos.includes('Striker') || pos.includes('Winger') || pos.includes('Attacker')) {
        positions['Forward'].push(player);
      } else {
        positions['Other'].push(player);
      }
    });

    return positions;
  };

  const renderPlayerCard = (player) => (
    <View key={player.idPlayer} style={styles.playerCard}>
      <View style={styles.playerImageContainer}>
        {player.strCutout || player.strThumb ? (
          <Image
            source={{ uri: player.strCutout || player.strThumb }}
            style={styles.playerImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.playerImagePlaceholder}>
            <Icon name="user" size={30} color={COLORS.textLight} />
          </View>
        )}
      </View>
      <View style={styles.playerInfo}>
        <View style={styles.playerNameRow}>
          <Text style={styles.playerName} numberOfLines={1}>
            {player.strPlayer}
          </Text>
          {player.strNumber && (
            <View style={styles.numberBadge}>
              <Text style={styles.numberText}>{player.strNumber}</Text>
            </View>
          )}
        </View>
        <Text style={styles.playerPosition}>{player.strPosition || 'N/A'}</Text>
        {player.strNationality && (
          <View style={styles.nationalityRow}>
            <Icon name="flag" size={12} color={COLORS.textLight} />
            <Text style={styles.nationalityText}>{player.strNationality}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderPositionSection = (position, players) => {
    if (players.length === 0) return null;

    return (
      <View key={position} style={styles.positionSection}>
        <View style={styles.positionHeader}>
          <Icon 
            name={
              position === 'Goalkeeper' ? 'shield' :
              position === 'Defender' ? 'shield-off' :
              position === 'Midfielder' ? 'circle' :
              position === 'Forward' ? 'target' : 'users'
            } 
            size={20} 
            color={COLORS.primary} 
          />
          <Text style={styles.positionTitle}>{position}s ({players.length})</Text>
        </View>
        <View style={styles.playersGrid}>
          {players.map(player => renderPlayerCard(player))}
        </View>
      </View>
    );
  };

  const styles = createStyles(COLORS);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.teamHeader}>
              {team.strTeamBadge && (
                <Image
                  source={{ uri: `${team.strTeamBadge}/tiny` }}
                  style={styles.teamBadgeSmall}
                  resizeMode="contain"
                />
              )}
              <View style={styles.teamInfo}>
                <Text style={styles.headerTitle} numberOfLines={1}>{team.strTeam}</Text>
                <Text style={styles.headerSubtitle}>Squad Roster</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Content */}
        {loading ? (
          <ScrollView contentContainerStyle={styles.content}>
            <PlayerCardSkeleton />
            <PlayerCardSkeleton />
            <PlayerCardSkeleton />
            <PlayerCardSkeleton />
            <PlayerCardSkeleton />
            <PlayerCardSkeleton />
            <PlayerCardSkeleton />
            <PlayerCardSkeleton />
          </ScrollView>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={60} color={COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchSquad}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : squad.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="users" size={60} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No squad data available</Text>
            <Text style={styles.emptySubtext}>This team doesn't have squad information yet</Text>
          </View>
        ) : (
          <ScrollView 
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}>
            
            {/* Squad Stats */}
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Icon name="users" size={24} color={COLORS.primary} />
                <Text style={styles.statValue}>{squad.length}</Text>
                <Text style={styles.statLabel}>Players</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Icon name="flag" size={24} color={COLORS.primary} />
                <Text style={styles.statValue}>
                  {[...new Set(squad.map(p => p.strNationality).filter(Boolean))].length}
                </Text>
                <Text style={styles.statLabel}>Nations</Text>
              </View>
            </View>

            {/* Players by Position */}
            {Object.entries(groupPlayersByPosition()).map(([position, players]) => 
              renderPositionSection(position, players)
            )}
          </ScrollView>
        )}
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
  },
  backButton: {
    padding: SPACING.sm,
    marginRight: SPACING.md,
  },
  headerContent: {
    flex: 1,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamBadgeSmall: {
    width: 40,
    height: 40,
    marginRight: SPACING.md,
  },
  teamInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    marginTop: 2,
    opacity: 0.9,
  },
  content: {
    padding: SPACING.lg,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
  },
  statValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  positionSection: {
    marginBottom: SPACING.xl,
  },
  positionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  positionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  playersGrid: {
    gap: SPACING.md,
  },
  playerCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  playerImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: COLORS.background,
  },
  playerImage: {
    width: '100%',
    height: '100%',
  },
  playerImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  playerInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  playerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  playerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    flex: 1,
  },
  numberBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    marginLeft: SPACING.sm,
  },
  numberText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
  },
  playerPosition: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  nationalityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nationalityText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginLeft: SPACING.xs,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  emptySubtext: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});

export default TeamSquadScreen;
