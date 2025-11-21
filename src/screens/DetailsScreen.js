import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';
import { toggleFavorite, selectIsFavorite } from '../redux/sportsSlice';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../utils/constants';

const { width } = Dimensions.get('window');

const DetailsScreen = ({ route, navigation }) => {
  const { team } = route.params;
  const dispatch = useDispatch();
  const isFavorite = useSelector(selectIsFavorite(team.idTeam));

  const handleFavoriteToggle = () => {
    dispatch(toggleFavorite(team.idTeam));
  };

  const openWebsite = () => {
    if (team.strWebsite) {
      const url = team.strWebsite.startsWith('http')
        ? team.strWebsite
        : `https://${team.strWebsite}`;
      Linking.openURL(url);
    }
  };

  const InfoRow = ({ icon, label, value }) => {
    if (!value) return null;
    return (
      <View style={styles.infoRow}>
        <View style={styles.infoIcon}>
          <Icon name={icon} size={20} color={COLORS.primary} />
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoValue}>{value}</Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Image */}
      <View style={styles.headerContainer}>
        {team.strTeamBanner ? (
          <Image
            source={{ uri: team.strTeamBanner }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.bannerImage, styles.bannerPlaceholder]}>
            <Icon name="image" size={40} color={COLORS.textLight} />
          </View>
        )}
        
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.white} />
        </TouchableOpacity>

        {/* Favorite Button */}
        <TouchableOpacity
          style={styles.favoriteButtonTop}
          onPress={handleFavoriteToggle}>
          <Icon
            name="heart"
            size={24}
            color={isFavorite ? COLORS.error : COLORS.white}
            fill={isFavorite ? COLORS.error : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      {/* Team Badge and Name */}
      <View style={styles.teamHeader}>
        {team.strTeamBadge && (
          <Image
            source={{ uri: team.strTeamBadge }}
            style={styles.teamBadge}
            resizeMode="contain"
          />
        )}
        <Text style={styles.teamName}>{team.strTeam}</Text>
        {team.intFormedYear && (
          <Text style={styles.formedYear}>Founded in {team.intFormedYear}</Text>
        )}
      </View>

      {/* Description */}
      {team.strDescriptionEN && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{team.strDescriptionEN}</Text>
        </View>
      )}

      {/* Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Information</Text>
        <View style={styles.infoContainer}>
          <InfoRow icon="shield" label="League" value={team.strLeague} />
          <InfoRow icon="map-pin" label="Stadium" value={team.strStadium} />
          <InfoRow icon="map" label="Location" value={team.strCountry} />
          <InfoRow
            icon="users"
            label="Stadium Capacity"
            value={team.intStadiumCapacity}
          />
        </View>
      </View>

      {/* Website Button */}
      {team.strWebsite && (
        <TouchableOpacity style={styles.websiteButton} onPress={openWebsite}>
          <Icon name="globe" size={20} color={COLORS.primary} />
          <Text style={styles.websiteButtonText}>Visit Website</Text>
          <Icon name="external-link" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      )}

      {/* Social Media */}
      <View style={styles.socialContainer}>
        {team.strFacebook && (
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => Linking.openURL(`https://${team.strFacebook}`)}>
            <Icon name="facebook" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )}
        {team.strTwitter && (
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => Linking.openURL(`https://${team.strTwitter}`)}>
            <Icon name="twitter" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )}
        {team.strInstagram && (
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => Linking.openURL(`https://${team.strInstagram}`)}>
            <Icon name="instagram" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )}
        {team.strYoutube && (
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => Linking.openURL(`https://${team.strYoutube}`)}>
            <Icon name="youtube" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    position: 'relative',
  },
  bannerImage: {
    width: width,
    height: 200,
    backgroundColor: COLORS.primary,
  },
  bannerPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: SPACING.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButtonTop: {
    position: 'absolute',
    top: 40,
    right: SPACING.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamHeader: {
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    marginTop: -30,
    marginHorizontal: SPACING.md,
    borderRadius: 16,
    elevation: 4,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  teamBadge: {
    width: 100,
    height: 100,
    marginBottom: SPACING.md,
  },
  teamName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  formedYear: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
  },
  section: {
    backgroundColor: COLORS.white,
    marginTop: SPACING.md,
    marginHorizontal: SPACING.md,
    padding: SPACING.lg,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    lineHeight: 24,
  },
  infoContainer: {
    gap: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  infoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginBottom: SPACING.xs / 2,
  },
  infoValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.medium,
  },
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  websiteButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semibold,
    marginHorizontal: SPACING.sm,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
    marginHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default DetailsScreen;
