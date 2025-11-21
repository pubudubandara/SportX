import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_ENDPOINTS, STORAGE_KEYS } from '../utils/constants';

const initialState = {
  user: null,
  token: null,
  isLoggedIn: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isLoggedIn = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    signupStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    signupSuccess: (state, action) => {
      state.loading = false;
      state.isLoggedIn = true;
      state.user = action.payload.user;
      state.token = action.payload.token || 'dummy-token';
      state.error = null;
    },
    signupFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    restoreAuth: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoggedIn = true;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  signupStart,
  signupSuccess,
  signupFailure,
  logout,
  clearError,
  restoreAuth,
} = authSlice.actions;

// Thunk Actions
export const loginUser = (credentials) => async (dispatch) => {
  dispatch(loginStart());
  try {
    // Check for admin credentials first
    if (credentials.username === 'admin' && credentials.password === 'admin') {
      const userData = {
        user: {
          id: 1,
          username: 'admin',
          email: 'admin@sportx.com',
          firstName: 'Admin',
          lastName: 'User',
        },
        token: 'admin-token-' + Date.now(),
      };

      // Persist to AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, userData.token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData.user));

      dispatch(loginSuccess(userData));
      return;
    }

    // Try DummyJSON API for other credentials
    const response = await axios.post(API_ENDPOINTS.LOGIN, credentials, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const userData = {
      user: {
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
      },
      token: response.data.token,
    };

    // Persist to AsyncStorage
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData.user));

    dispatch(loginSuccess(userData));
  } catch (error) {
    console.log('Login error:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.message || 'Invalid username or password';
    dispatch(loginFailure(errorMessage));
    throw error;
  }
};

export const signupUser = (userData) => async (dispatch) => {
  dispatch(signupStart());
  try {
    const response = await axios.post(API_ENDPOINTS.REGISTER, userData);
    
    const newUser = {
      user: {
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
      },
      token: 'dummy-token-' + Date.now(), // DummyJSON doesn't return token for signup
    };

    // Persist to AsyncStorage
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newUser.token);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(newUser.user));

    dispatch(signupSuccess(newUser));
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Signup failed. Please try again.';
    dispatch(signupFailure(errorMessage));
    throw error;
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    dispatch(logout());
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const restoreAuthState = () => async (dispatch) => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const userDataString = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    
    if (token && userDataString) {
      const user = JSON.parse(userDataString);
      dispatch(restoreAuth({ user, token }));
    }
  } catch (error) {
    console.error('Restore auth error:', error);
  }
};

export default authSlice.reducer;
