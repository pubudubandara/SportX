import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isDarkMode: false,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    setTheme: (state, action) => {
      state.isDarkMode = action.payload;
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export const selectIsDarkMode = (state) => state.theme.isDarkMode;
export default themeSlice.reducer;
