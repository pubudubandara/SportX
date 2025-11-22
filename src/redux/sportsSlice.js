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
  },
});

export const { setActiveLeague, toggleFavoriteLeague } = sportsSlice.actions;

// Selectors
export const selectActiveLeague = (state) => state.sports.activeLeague;
export const selectFavoriteLeagues = (state) => state.sports.favoriteLeagues;

export default sportsSlice.reducer;
