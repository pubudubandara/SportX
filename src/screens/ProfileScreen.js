import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import { logoutUser } from '../redux/authSlice';
import { selectSelectedCountry, setSelectedCountry } from '../redux/sportsSlice';
import { toggleTheme, selectIsDarkMode } from '../redux/themeSlice';
import { getColors, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../utils/constants';

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const selectedCountry = useSelector(selectSelectedCountry);
  const isDarkMode = useSelector(selectIsDarkMode);
  const COLORS = getColors(isDarkMode);

  const [showCountryModal, setShowCountryModal] = useState(false);
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await axios.get(
        'https://www.thesportsdb.com/api/v1/json/3/all_countries.php',
      );
      const sortedCountries = response.data.countries.sort((a, b) =>
        a.name_en.localeCompare(b.name_en),
      );
      setCountries(sortedCountries);
      setFilteredCountries(sortedCountries);
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text) {
      const filtered = countries.filter((c) =>
        c.name_en.toLowerCase().includes(text.toLowerCase()),
      );
      setFilteredCountries(filtered);
    } else {
      setFilteredCountries(countries);
    }
  };

  const handleCountrySelect = (countryName) => {
    dispatch(setSelectedCountry(countryName));
    setShowCountryModal(false);
    setSearchQuery('');
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  const profileSections = [
    {
      title: 'Account Information',
      items: [
        { icon: 'user', label: 'Username', value: user?.username || 'N/A' },
        { icon: 'mail', label: 'Email', value: user?.email || 'N/A' },
        { icon: 'phone', label: 'Phone', value: user?.phone || 'N/A' },
      ],
    },
    {
      title: 'Personal Details',
      items: [
        { icon: 'user', label: 'First Name', value: user?.firstName || 'N/A' },
        { icon: 'user', label: 'Last Name', value: user?.lastName || 'N/A' },
      ],
    },
  ];

  const styles = createStyles(COLORS);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user?.image || 'https://via.placeholder.com/120' }}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.userName}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.userEmail}>{user?.email || user?.username}</Text>
        </View>

        {/* Profile Sections */}
        {profileSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, itemIndex) => (
                <View
                  key={itemIndex}
                  style={[
                    styles.infoRow,
                    itemIndex !== section.items.length - 1 && styles.infoRowBorder,
                  ]}>
                  <View style={styles.infoLeft}>
                    <View style={styles.iconWrapper}>
                      <Icon name={item.icon} size={18} color={COLORS.primary} />
                    </View>
                    <Text style={styles.infoLabel}>{item.label}</Text>
                  </View>
                  <Text style={styles.infoValue}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity 
              style={styles.infoRow}
              onPress={() => setShowCountryModal(true)}
              activeOpacity={0.7}>
              <View style={styles.infoLeft}>
                <View style={styles.iconWrapper}>
                  <Icon name="globe" size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.infoLabel}>Country</Text>
              </View>
              <View style={styles.countryValueContainer}>
                <Text style={styles.infoValue}>{selectedCountry}</Text>
                <Icon name="chevron-right" size={18} color={COLORS.textLight} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Appearance Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.sectionCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <View style={styles.iconWrapper}>
                  <Icon name={isDarkMode ? 'moon' : 'sun'} size={18} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.infoLabel}>Dark Mode</Text>
                  <Text style={styles.themeSubtext}>
                    {isDarkMode ? 'Dark theme enabled' : 'Light theme enabled'}
                  </Text>
                </View>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={handleToggleTheme}
                trackColor={{ false: '#e5e7eb', true: '#3663b1' }}
                thumbColor={isDarkMode ? '#ffffff' : '#f9fafb'}
                ios_backgroundColor="#e5e7eb"
                style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }}
              />
            </View>
          </View>
        </View>

        {/* AI Chatbot Button */}
        <TouchableOpacity 
          style={styles.chatbotButton} 
          onPress={() => navigation.navigate('Chatbot')}
        >
          <Icon name="message-circle" size={20} color={COLORS.white} />
          <Text style={styles.chatbotText}>SportX Assistant</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out" size={20} color={COLORS.white} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>SportX v1.0.0</Text>
        </View>
      </ScrollView>

      {/* Country Selection Modal */}
      <Modal
        visible={showCountryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCountryModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity onPress={() => setShowCountryModal(false)}>
                <Icon name="x" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Icon name="search" size={20} color={COLORS.textLight} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search countries..."
                placeholderTextColor={COLORS.textLight}
                value={searchQuery}
                onChangeText={handleSearch}
              />
            </View>

            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.name_en}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.countryItem,
                    selectedCountry === item.name_en && styles.countryItemSelected,
                  ]}
                  onPress={() => handleCountrySelect(item.name_en)}>
                  <Text style={[
                    styles.countryName,
                    selectedCountry === item.name_en && styles.countryNameSelected,
                  ]}>
                    {item.name_en}
                  </Text>
                  {selectedCountry === item.name_en && (
                    <Icon name="check" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarContainer: {
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.primary,
  },
  userName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    marginLeft: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    borderRadius: 12,
    padding: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  infoLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    fontWeight: FONT_WEIGHTS.medium,
  },
  infoValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.semibold,
    maxWidth: '90%',
    textAlign: 'right',
  },
  themeSubtext: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginTop: 2,
  },
  chatbotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  chatbotText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    fontWeight: FONT_WEIGHTS.bold,
    marginLeft: SPACING.sm,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  logoutText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    marginLeft: SPACING.sm,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  countryValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: SPACING.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    margin: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  countryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  countryItemSelected: {
    backgroundColor: `${COLORS.primary}10`,
  },
  countryName: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  countryNameSelected: {
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.primary,
  },
});

export default ProfileScreen;
