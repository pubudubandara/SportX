import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../utils/constants';

const SquadsScreen = ({ navigation }) => {
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={24} color={COLORS.white} />
      </TouchableOpacity>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Squad List</Text>
        <Text style={styles.headerSubtitle}>Team rosters</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {renderHeader()}
        <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Icon name="users" size={60} color={COLORS.primary} />
            </View>
          </View>

          <Text style={styles.title}>Squad Information</Text>
          <Text style={styles.description}>
            Please select a team from the Teams screen to view their complete squad list and player details.
          </Text>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Icon name="check-circle" size={20} color={COLORS.success} />
              <Text style={styles.featureText}>View complete team rosters</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="check-circle" size={20} color={COLORS.success} />
              <Text style={styles.featureText}>Player positions and numbers</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="check-circle" size={20} color={COLORS.success} />
              <Text style={styles.featureText}>Team formation details</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.navigateButton}
            onPress={() => navigation.navigate('Teams')}>
            <Icon name="shield" size={20} color={COLORS.white} />
            <Text style={styles.navigateButtonText}>Go to Teams</Text>
          </TouchableOpacity>

          <View style={styles.infoCard}>
            <Icon name="info" size={18} color={COLORS.primary} />
            <Text style={styles.infoText}>
              Squad information requires selecting a specific team first. 
              Navigate to the Teams section to browse available teams.
            </Text>
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
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: SPACING.xl,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: `${COLORS.primary}30`,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  featureList: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  featureText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginLeft: SPACING.md,
    fontWeight: FONT_WEIGHTS.medium,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
    marginBottom: SPACING.xl,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  navigateButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    marginLeft: SPACING.sm,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.primary}10`,
    padding: SPACING.lg,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
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
