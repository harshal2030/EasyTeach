/**
 * @format
 */
import React from 'react';
import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './src/App';
import {Provider} from 'react-redux';
import {NavigationContainer} from '@react-navigation/native';
import {name as appName} from './app.json';
import {enableScreens} from 'react-native-screens';
import {store} from './src/global';
import PushNotification from 'react-native-push-notification';

PushNotification.configure({
  onRegister: (token) => {
    console.log(token.token);
  },

  onNotification: (notification) => {
    console.log(notification.data);
  },

  requestPermissions: true,
});

enableScreens(true);

const Wrapper = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <App />
      </NavigationContainer>
    </Provider>
  );
};

AppRegistry.registerComponent(appName, () => Wrapper);
