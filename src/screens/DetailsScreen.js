import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../utils/constants';

const { width } = Dimensions.get('window');

const DetailsScreen = ({ route, navigation }) => {
  const { team } = route.params;
  const [squad, setSquad] = useState([]);
  const [loadingSquad, setLoadingSquad] = useState(true);

  const primaryColor = team.strColour1 || COLORS.primary;
  const secondaryColor = team.strColour2 || COLORS.white;
  const tertiaryColor = team.strColour3 || COLORS.secondary;

  useEffect(() => {
    fetchSquad();
  }, [team.idTeam]);

  const fetchSquad = async () => {
    try {
      setLoadingSquad(true);
      const response = await axios.get(
        `https://www.thesportsdb.com/api/v1/json/3/lookup_all_players.php?id=${team.idTeam}`
      );
      setSquad(response.data.player || []);
    } catch (error) {
      console.error('Error fetching squad:', error);
    } finally {
      setLoadingSquad(false);
    }
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
        {team.strTeamBanner || team.strFanart1 ? (
          <Image
            source={{ uri: team.strTeamBanner || team.strFanart1 }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.bannerImage, { backgroundColor: primaryColor }, styles.bannerPlaceholder]}>
            <Icon name="image" size={40} color={secondaryColor} />
          </View>
        )}
        
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Team Badge and Name */}
      <View style={styles.teamHeader}>
        {team.strTeamBadge && (
          <Image
            source={{ uri: `${team.strTeamBadge}/small` }}
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

      {/* Team Colors */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Team Colors</Text>
        <View style={styles.colorsContainer}>
          {primaryColor && (
            <View style={styles.colorItem}>
              <View style={[styles.colorCircle, { backgroundColor: primaryColor }]} />
              <Text style={styles.colorLabel}>Primary</Text>
            </View>
          )}
          {secondaryColor && (
            <View style={styles.colorItem}>
              <View style={[styles.colorCircle, { backgroundColor: secondaryColor, borderWidth: 1, borderColor: COLORS.border }]} />
              <Text style={styles.colorLabel}>Secondary</Text>
            </View>
          )}
          {tertiaryColor && (
            <View style={styles.colorItem}>
              <View style={[styles.colorCircle, { backgroundColor: tertiaryColor }]} />
              <Text style={styles.colorLabel}>Tertiary</Text>
            </View>
          )}
        </View>
      </View>

      {/* Squad Section */}
      <View style={styles.section}>
        <View style={styles.squadHeader}>
          <Icon name="users" size={24} color={primaryColor} />
          <Text style={[styles.sectionTitle, { marginBottom: 0, marginLeft: SPACING.sm }]}>
            Squad List
          </Text>
        </View>
        
        {loadingSquad ? (
          <View style={styles.loadingSquad}>
            <ActivityIndicator size="large" color={primaryColor} />
            <Text style={styles.loadingText}>Loading squad...</Text>
          </View>
        ) : squad.length > 0 ? (
          <View style={styles.squadGrid}>
            {squad.slice(0, 20).map((player, index) => (
              <View 
                key={player.idPlayer || index} 
                style={[styles.playerCard, { borderLeftColor: primaryColor }]}>
                <View style={styles.playerInfo}>
                  {player.strCutout ? (
                    <Image
                      source={{ uri: `${player.strCutout}/tiny` }}
                      style={styles.playerImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.playerImagePlaceholder, { backgroundColor: `${primaryColor}20` }]}>
                      <Icon name="user" size={24} color={primaryColor} />
                    </View>
                  )}
                  <View style={styles.playerDetails}>
                    <Text style={styles.playerName} numberOfLines={1}>
                      {player.strPlayer}
                    </Text>
                    <Text style={styles.playerPosition}>
                      {player.strPosition || 'Position N/A'}
                    </Text>
                    {player.strNumber && (
                      <View style={[styles.playerNumber, { backgroundColor: primaryColor }]}>
                        <Text style={styles.playerNumberText}>#{player.strNumber}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noSquad}>
            <Icon name="info" size={40} color={COLORS.textLight} />
            <Text style={styles.noSquadText}>Squad information not available</Text>
          </View>
        )}
      </View>

      {/* Website Button */}
      {team.strWebsite && (
        <TouchableOpacity 
          style={[styles.websiteButton, { borderColor: primaryColor }]} 
          onPress={openWebsite}>
          <Icon name="globe" size={20} color={primaryColor} />
          <Text style={[styles.websiteButtonText, { color: primaryColor }]}>Visit Website</Text>
          <Icon name="external-link" size={16} color={primaryColor} />
        </TouchableOpacity>
      )}

      {/* Social Media */}
      <View style={styles.socialContainer}>
        {team.strFacebook && (
          <TouchableOpacity
            style={[styles.socialButton, { backgroundColor: `${primaryColor}15` }]}
            onPress={() => Linking.openURL(`https://${team.strFacebook}`)}>
            <Icon name="facebook" size={24} color={primaryColor} />
          </TouchableOpacity>
        )}
        {team.strTwitter && (
          <TouchableOpacity
            style={[styles.socialButton, { backgroundColor: `${primaryColor}15` }]}
            onPress={() => Linking.openURL(`https://${team.strTwitter}`)}>
            <Icon name="twitter" size={24} color={primaryColor} />
          </TouchableOpacity>
        )}
        {team.strInstagram && (
          <TouchableOpacity
            style={[styles.socialButton, { backgroundColor: `${primaryColor}15` }]}
            onPress={() => Linking.openURL(`https://${team.strInstagram}`)}>
            <Icon name="instagram" size={24} color={primaryColor} />
          </TouchableOpacity>
        )}
        {team.strYoutube && (
          <TouchableOpacity
            style={[styles.socialButton, { backgroundColor: `${primaryColor}15` }]}
            onPress={() => Linking.openURL(`https://${team.strYoutube}`)}>
            <Icon name="youtube" size={24} color={primaryColor} />
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
  colorsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.sm,
  },
  colorItem: {
    alignItems: 'center',
  },
  colorCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: SPACING.xs,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  colorLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    fontWeight: FONT_WEIGHTS.medium,
  },
  squadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  loadingSquad: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
  },
  squadGrid: {
    gap: SPACING.sm,
  },
  playerCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    borderLeftWidth: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.background,
  },
  playerImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerDetails: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  playerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  },
  playerPosition: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  playerNumber: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: 12,
  },
  playerNumberText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: FONT_WEIGHTS.bold,
  },
  noSquad: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  noSquadText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default DetailsScreen;
