/**
 * SportX - Sports & Lifestyle Mobile App
 * React Native CLI with Redux Toolkit
 *
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import store, { persistor } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/utils/constants';

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <StatusBar
            barStyle="light-content"
            backgroundColor={COLORS.primary}
          />
          <AppNavigator />
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
