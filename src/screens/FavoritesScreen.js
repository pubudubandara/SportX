import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';
import { selectFavoriteTeams } from '../redux/sportsSlice';
import TeamCard from '../components/TeamCard';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../utils/constants';

const FavoritesScreen = ({ navigation }) => {
  const favoriteTeams = useSelector(selectFavoriteTeams);
  const user = useSelector((state) => state.auth.user);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.greeting}>Your Favorites 💙</Text>
      <Text style={styles.headerSubtitle}>
        {favoriteTeams.length} {favoriteTeams.length === 1 ? 'team' : 'teams'} saved
      </Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="heart" size={80} color={COLORS.textLight} />
      <Text style={styles.emptyText}>No Favorites Yet</Text>
      <Text style={styles.emptySubtext}>
        Start adding teams to your favorites from the Home screen
      </Text>
      <TouchableOpacity
        style={styles.goHomeButton}
        onPress={() => navigation.navigate('Home')}>
        <Text style={styles.goHomeText}>Explore Teams</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={favoriteTeams}
        keyExtractor={(item) => item.idTeam}
        renderItem={({ item }) => (
          <TeamCard
            team={item}
            onPress={() => navigation.navigate('Details', { team: item })}
          />
        )}
        ListHeaderComponent={favoriteTeams.length > 0 ? renderHeader : null}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={
          favoriteTeams.length === 0 ? styles.emptyList : styles.listContent
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderBottomWidth: 0,
    paddingTop: SPACING.xl
  },
  greeting: {
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
    paddingVertical: SPACING.sm,
  },
  emptyList: {
    flexGrow: 1,
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
