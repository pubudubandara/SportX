import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';
import { getColors, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../utils/constants';
import { selectIsDarkMode } from '../redux/themeSlice';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - SPACING.lg * 2;

const TeamCard = ({ team, onPress }) => {
  const isDarkMode = useSelector(selectIsDarkMode);
  const COLORS = getColors(isDarkMode);
  const styles = createStyles(COLORS);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}>
      <View style={styles.cardContent}>
        {/* Team Badge */}
        <View style={styles.imageContainer}>
          {(team.strTeamBadge || team.strBadge) ? (
            <Image
              source={{ uri: team.strTeamBadge || team.strBadge }}
              style={styles.teamBadge}
              resizeMode="contain"
            />
          ) : (
            <View style={[styles.teamBadge, styles.placeholderBadge]}>
              <Icon name="shield" size={40} color={COLORS.textLight} />
            </View>
          )}
        </View>

        {/* Team Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.teamName} numberOfLines={2}>
            {team.strTeam}
          </Text>
          <Text style={styles.league} numberOfLines={1}>
            {team.strLeague}
          </Text>
          {team.strStadium && (
            <View style={styles.stadiumContainer}>
              <Icon name="map-pin" size={14} color={COLORS.textLight} />
              <Text style={styles.stadium} numberOfLines={1}>
                {team.strStadium}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    elevation: 4,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardContent: {
    flexDirection: 'row',
    padding: SPACING.md,
    alignItems: 'center',
  },
  imageContainer: {
    marginRight: SPACING.md,
  },
  teamBadge: {
    width: 70,
    height: 70,
  },
  placeholderBadge: {
    backgroundColor: COLORS.background,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  teamName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  league: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  stadiumContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  stadium: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  favoriteButton: {
    padding: SPACING.sm,
  },
});

export default TeamCard;
