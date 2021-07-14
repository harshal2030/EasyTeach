/**
 * @format
 */
import React from 'react';
import 'react-native-gesture-handler';
import 'expo-asset';
import {AppRegistry} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import App from './mobile/App';
import {Provider} from 'react-redux';
import {name as appName} from './app.json';
import {enableScreens} from 'react-native-screens';
import {store} from './shared/global';
import PushNotification from 'react-native-push-notification';

import {registerFCM} from './shared/global/actions/token';

enableScreens(true);

PushNotification.configure({
  onRegister: (token) => {
    store.dispatch(registerFCM({os: token.os, fcmToken: token.token}));
  },

  requestPermissions: true,
});

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
