import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../utils/constants';

const FavoritesScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Favorites</Text>
        </View>

        {/* Empty State */}
        <View style={styles.emptyState}>
          <Icon name="info" size={60} color={COLORS.primary} />
          <Text style={styles.emptyText}>Feature Unavailable</Text>
          <Text style={styles.emptySubtext}>
            Favorites feature has been temporarily disabled.{'\n'}
            Browse teams and leagues from the Home screen.
          </Text>
          <TouchableOpacity
            style={styles.goHomeButton}
            onPress={() => navigation.navigate('Home')}>
            <Text style={styles.goHomeText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
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
