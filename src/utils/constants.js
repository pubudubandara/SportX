// Design System & Constants
export const COLORS = {
  primary: '#3663b1',
  secondary: '#2c4f8c',
  background: '#f5f7fa',
  white: '#ffffff',
  text: '#1a1a1a',
  textLight: '#6b7280',
  border: '#e5e7eb',
  error: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
  cardShadow: '#000',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
};

export const FONT_WEIGHTS = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

// API Endpoints
export const API_ENDPOINTS = {
  LOGIN: 'https://dummyjson.com/auth/login',
  REGISTER: 'https://dummyjson.com/users/add',
  SPORTS_TEAMS: 'https://www.thesportsdb.com/api/v1/json/3/search_all_teams.php?l=English%20Premier%20League',
};

// AsyncStorage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  USER_DATA: '@user_data',
  FAVORITES: '@favorites',
};
