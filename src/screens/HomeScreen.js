import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../utils/constants';

const HomeScreen = ({ navigation }) => {
  const user = useSelector((state) => state.auth.user);

  const menuCards = [
    {
      id: 1,
      title: 'Upcoming Matches',
      subtitle: 'View scheduled fixtures',
      icon: 'calendar',
      route: 'Matches',
      gradient: ['#3663b1', '#4a7ac7'],
    },
    {
      id: 2,
      title: 'Squad List',
      subtitle: 'Team rosters & players',
      icon: 'users',
      route: 'Squads',
      gradient: ['#3663b1', '#2d5199'],
    },
    {
      id: 3,
      title: 'Teams',
      subtitle: 'Browse all teams',
      icon: 'shield',
      route: 'Teams',
      gradient: ['#3663b1', '#5685d9'],
    },
    {
      id: 4,
      title: 'Past Results',
      subtitle: 'Recent match scores',
      icon: 'activity',
      route: 'Results',
      gradient: ['#3663b1', '#1f3d7a'],
    },
  ];

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View>
        <Text style={styles.greeting}>Hello, {user?.firstName || 'User'}! 👋</Text>
        <Text style={styles.headerSubtitle}>
          Welcome to your Sports Dashboard
        </Text>
      </View>
    </View>
  );

  const renderMenuCard = (card) => (
    <TouchableOpacity
      key={card.id}
      style={styles.menuCard}
      onPress={() => navigation.navigate(card.route)}
      activeOpacity={0.8}>
      <View style={styles.cardContent}>
        <View style={styles.cardLeft}>
          <View style={styles.iconWrapper}>
            <Icon name={card.icon} size={32} color={COLORS.white} />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
          </View>
        </View>
        <Icon name="chevron-right" size={24} color={COLORS.white} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {renderHeader()}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          
          <View style={styles.dashboardSection}>
            <Text style={styles.sectionTitle}>Quick Access</Text>
            <View style={styles.menuGrid}>
              {menuCards.map(card => renderMenuCard(card))}
            </View>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <Icon name="info" size={20} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Premier League Coverage</Text>
                <Text style={styles.infoText}>
                  Access complete Premier League data including teams, fixtures, results, and more.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
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
    padding: SPACING.xl,
    paddingTop: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  greeting: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  dashboardSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginLeft: SPACING.xs,
  },
  menuGrid: {
    gap: SPACING.md,
  },
  menuCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: SPACING.xl,
    marginBottom: SPACING.md,
    elevation: 5,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.lg,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  cardSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    opacity: 0.85,
  },
  infoSection: {
    marginTop: SPACING.md,
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
});

export default HomeScreen;
