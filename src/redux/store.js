import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import sportsReducer from './sportsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    sports: sportsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export default store;
