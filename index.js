/**
 * @format
 */
import React from 'react';
import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import {enableScreens} from 'react-native-screens';
import {store} from './shared/global';
import {Provider} from 'react-redux';
import {SafeAreaProvider} from 'react-native-safe-area-context';

enableScreens();

const Wrapper = () => {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <App />
      </SafeAreaProvider>
    </Provider>
  );
};

AppRegistry.registerComponent(appName, () => Wrapper);
