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
};

const sportsSlice = createSlice({
  name: 'sports',
  initialState,
  reducers: {
    setActiveLeague: (state, action) => {
      state.activeLeague = action.payload;
    },
  },
});

export const { setActiveLeague } = sportsSlice.actions;

// Selectors
export const selectActiveLeague = (state) => state.sports.activeLeague;

export default sportsSlice.reducer;
