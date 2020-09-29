/**
 * @format
 */
import React from 'react';
import 'react-native-gesture-handler';
import {AppRegistry, StatusBar} from 'react-native';
import App from './src/App';
import {Provider} from 'react-redux';
import {statusbarColor} from './src/styles/colors';
import {NavigationContainer} from '@react-navigation/native';
import {name as appName} from './app.json';
import {enableScreens} from 'react-native-screens';
import {store} from './src/global';

enableScreens();

const Wrapper = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <StatusBar backgroundColor={statusbarColor} />
        <App />
      </NavigationContainer>
    </Provider>
  );
};

AppRegistry.registerComponent(appName, () => Wrapper);
