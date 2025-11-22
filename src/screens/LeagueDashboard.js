import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import { getColors, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../utils/constants';
import { selectActiveLeague } from '../redux/sportsSlice';
import { selectIsDarkMode } from '../redux/themeSlice';

const LeagueDashboard = ({ navigation }) => {
  const activeLeague = useSelector(selectActiveLeague);
  const isDarkMode = useSelector(selectIsDarkMode);
  const COLORS = getColors(isDarkMode);
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, [activeLeague]);

  const fetchTeams = async () => {
    try {
      setLoadingTeams(true);
      const leagueName = activeLeague?.strLeague || 'English Premier League';
      const response = await axios.get(
        `https://www.thesportsdb.com/api/v1/json/3/search_all_teams.php?l=${encodeURIComponent(leagueName)}`
      );
      setTeams(response.data.teams || []);
    } catch (err) {
      console.error('Failed to load teams:', err);
      setTeams([]);
    } finally {
      setLoadingTeams(false);
    }
  };

  const menuItems = [
    {
      id: 1,
      title: 'Teams',
      subtitle: 'Browse all teams',
      icon: 'shield',
      route: 'Teams',
      color: '#3663b1',
    },
    {
      id: 2,
      title: 'Matches',
      subtitle: 'Upcoming fixtures',
      icon: 'calendar',
      route: 'Matches',
      color: '#4a7ac7',
    },
    {
      id: 3,
      title: 'Results',
      subtitle: 'Past matches',
      icon: 'activity',
      route: 'Results',
      color: '#2d5199',
    },
    {
      id: 4,
      title: 'Squads',
      subtitle: 'Team rosters',
      icon: 'users',
      route: 'Squads',
      color: '#5685d9',
    },
  ];

  const styles = createStyles(COLORS);

  const renderMenuButton = (item) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.menuButton, { backgroundColor: item.color }]}
      onPress={() => navigation.navigate(item.route)}
      activeOpacity={0.8}>
      <Icon name={item.icon} size={40} color={COLORS.white} />
      <Text style={styles.menuTitle}>{item.title}</Text>
      <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Banner Section */}
        <View style={styles.bannerContainer}>
          {activeLeague?.strFanart1 ? (
            <Image
              source={{ uri: activeLeague.strFanart1 }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.bannerImage, { backgroundColor: '#3663b1' }]} />
          )}
          <View style={styles.bannerOverlay} />
          
          {/* League Badge Centered */}
          <View style={styles.badgeContainer}>
            {activeLeague?.strBadge ? (
              <Image
                source={{ uri: activeLeague.strBadge }}
                style={styles.leagueBadge}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.badgePlaceholder}>
                <Icon name="shield" size={80} color='#fffff' />
              </View>
            )}
            <Text style={styles.leagueName}>
              {activeLeague?.strLeague || 'League Dashboard'}
            </Text>
            {activeLeague?.strSport && (
              <Text style={styles.leagueSport}>{activeLeague.strSport}</Text>
            )}
          </View>
        </View>

        {/* Menu Grid (2x2) */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.menuGrid}>
            {menuItems.map(renderMenuButton)}
          </View>
        </View>

        {/* Teams Preview Section */}
        <View style={styles.teamsSection}>
          <View style={styles.teamsSectionHeader}>
            <Text style={styles.sectionTitle}>League Teams</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('Teams')}>
              <Text style={styles.viewAllText}>View All</Text>
              <Icon name="chevron-right" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          
          {loadingTeams ? (
            <View style={styles.teamsLoadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          ) : teams.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.teamsScrollContainer}>
              {teams.slice(0, 10).map((team) => (
                <TouchableOpacity
                  key={team.idTeam}
                  style={styles.teamItem}
                  onPress={() => navigation.navigate('Details', { team })}
                  activeOpacity={0.8}>
                  {team.strTeamBadge ? (
                    <Image
                      source={{ uri: team.strTeamBadge }}
                      style={styles.teamLogo}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.teamLogoPlaceholder}>
                      <Icon name="shield" size={30} color={COLORS.textLight} />
                    </View>
                  )}
                  <Text style={styles.teamItemName} numberOfLines={2}>
                    {team.strTeam}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.teamsEmptyContainer}>
              <Text style={styles.teamsEmptyText}>No teams found</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContainer: {
    height: 320,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  badgeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  leagueBadge: {
    width: 140,
    height: 140,
    marginBottom: SPACING.lg,
  },
  badgePlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  leagueName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: "#ffffff",
    textAlign: 'center',
    marginBottom: SPACING.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  leagueSport: {
    fontSize: FONT_SIZES.md,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
  },
  menuSection: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuButton: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 20,
    padding: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  menuTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  menuSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  infoSection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  infoContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  infoTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  teamsSection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  teamsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  viewAllText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semibold,
    marginRight: SPACING.xs,
  },
  teamsLoadingContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  teamsScrollContainer: {
    paddingRight: SPACING.lg,
  },
  teamItem: {
    width: 90,
    alignItems: 'center',
    marginRight: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  teamLogo: {
    width: 60,
    height: 60,
    marginBottom: SPACING.xs,
  },
  teamLogoPlaceholder: {
    width: 60,
    height: 60,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.background,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamItemName: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: FONT_WEIGHTS.medium,
  },
  teamsEmptyContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  teamsEmptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
});

export default LeagueDashboard;
