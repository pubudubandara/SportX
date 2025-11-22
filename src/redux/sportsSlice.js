import { createSlice } from '@reduxjs/toolkit';

// Default league
const DEFAULT_LEAGUE = { 
  id: '4328', 
  idLeague: '4328',
  name: 'English Premier League', 
  strLeague: 'English Premier League',
  strSport: 'Soccer'
};

const initialState = {
  activeLeague: DEFAULT_LEAGUE,
  favoriteLeagues: [],
  selectedCountry: 'England',
};

const sportsSlice = createSlice({
  name: 'sports',
  initialState,
  reducers: {
    setActiveLeague: (state, action) => {
      state.activeLeague = action.payload;
    },
    toggleFavoriteLeague: (state, action) => {
      const leagueId = action.payload;
      const index = state.favoriteLeagues.findIndex(id => id === leagueId);
      if (index !== -1) {
        state.favoriteLeagues.splice(index, 1);
      } else {
        state.favoriteLeagues.push(leagueId);
      }
    },
    setSelectedCountry: (state, action) => {
      state.selectedCountry = action.payload;
    },
  },
});

export const { setActiveLeague, toggleFavoriteLeague, setSelectedCountry } = sportsSlice.actions;

// Selectors
export const selectActiveLeague = (state) => state.sports.activeLeague;
export const selectFavoriteLeagues = (state) => state.sports.favoriteLeagues;
export const selectSelectedCountry = (state) => state.sports.selectedCountry;

export default sportsSlice.reducer;
