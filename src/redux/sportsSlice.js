import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, STORAGE_KEYS } from '../utils/constants';

// Supported Leagues
export const SUPPORTED_LEAGUES = [
  { id: '4328', name: 'English Premier League', str: 'English Premier League' },
  { id: '4387', name: 'NBA', str: 'NBA' },
  { id: '4424', name: 'La Liga', str: 'Spanish La Liga' },
  { id: '4331', name: 'Bundesliga', str: 'German Bundesliga' },
  { id: '4332', name: 'Serie A', str: 'Italian Serie A' },
  { id: '4335', name: 'Ligue 1', str: 'French Ligue 1' },
];

// Async Thunk to fetch teams
export const fetchTeams = createAsyncThunk(
  'sports/fetchTeams',
  async (leagueStr, { rejectWithValue }) => {
    try {
      const url = leagueStr 
        ? `https://www.thesportsdb.com/api/v1/json/3/search_all_teams.php?l=${encodeURIComponent(leagueStr)}`
        : API_ENDPOINTS.SPORTS_TEAMS;
      const response = await axios.get(url);
      return response.data.teams || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch teams');
    }
  }
);

// Load favorites from AsyncStorage
export const loadFavorites = createAsyncThunk(
  'sports/loadFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const favoritesString = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      return favoritesString ? JSON.parse(favoritesString) : [];
    } catch (error) {
      return rejectWithValue('Failed to load favorites');
    }
  }
);

const initialState = {
  teams: [],
  favorites: [],
  loading: false,
  error: null,
  activeLeague: SUPPORTED_LEAGUES[0], // Default to English Premier League
};

const sportsSlice = createSlice({
  name: 'sports',
  initialState,
  reducers: {
    toggleFavorite: (state, action) => {
      const teamId = action.payload;
      const index = state.favorites.findIndex((id) => id === teamId);
      
      if (index !== -1) {
        // Remove from favorites
        state.favorites.splice(index, 1);
      } else {
        // Add to favorites
        state.favorites.push(teamId);
      }
      
      // Persist to AsyncStorage
      AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(state.favorites));
    },
    setActiveLeague: (state, action) => {
      state.activeLeague = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Teams
    builder
      .addCase(fetchTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload;
        state.error = null;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Load Favorites
    builder
      .addCase(loadFavorites.fulfilled, (state, action) => {
        state.favorites = action.payload;
      })
      .addCase(loadFavorites.rejected, (state, action) => {
        console.error('Load favorites error:', action.payload);
      });
  },
});

export const { toggleFavorite, setActiveLeague, clearError } = sportsSlice.actions;

// Selectors
export const selectAllTeams = (state) => state.sports.teams;
export const selectFavoriteTeams = (state) => {
  return state.sports.teams.filter((team) =>
    state.sports.favorites.includes(team.idTeam)
  );
};
export const selectIsLoading = (state) => state.sports.loading;
export const selectError = (state) => state.sports.error;
export const selectIsFavorite = (teamId) => (state) =>
  state.sports.favorites.includes(teamId);
export const selectActiveLeague = (state) => state.sports.activeLeague;

export default sportsSlice.reducer;
