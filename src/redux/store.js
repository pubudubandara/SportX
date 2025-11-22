import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';
import authReducer from './authSlice';
import sportsReducer from './sportsSlice';
import themeReducer from './themeSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'sports', 'theme'], // Persist auth, sports, and theme
};

const rootReducer = combineReducers({
  auth: authReducer,
  sports: sportsReducer,
  theme: themeReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredActionPaths: ['register', 'rehydrate'],
      },
    }),
});

export const persistor = persistStore(store);
export default store;
