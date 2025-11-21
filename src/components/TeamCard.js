import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useDispatch, useSelector } from 'react-redux';
import { toggleFavorite, selectIsFavorite } from '../redux/sportsSlice';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../utils/constants';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - SPACING.lg * 2;

const TeamCard = ({ team, onPress }) => {
  const dispatch = useDispatch();
  const isFavorite = useSelector(selectIsFavorite(team.idTeam));

  const handleFavoriteToggle = () => {
    dispatch(toggleFavorite(team.idTeam));
  };

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

        {/* Favorite Button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleFavoriteToggle}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon
            name={isFavorite ? 'heart' : 'heart'}
            size={24}
            color={isFavorite ? COLORS.error : COLORS.textLight}
            fill={isFavorite ? COLORS.error : 'transparent'}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
