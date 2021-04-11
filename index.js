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
import {NavigationContainer} from '@react-navigation/native';
import {name as appName} from './app.json';
import {enableScreens} from 'react-native-screens';
import {store} from './shared/global';
import PushNotification from 'react-native-push-notification';

import {registerFCM} from './shared/global/actions/token';
import {addMsg} from './shared/global/actions/msgs';

enableScreens(true);

PushNotification.configure({
  onRegister: (token) => {
    store.dispatch(registerFCM({os: token.os, fcmToken: token.token}));
  },

  onNotification: (notification) => {
    const {currentClass} = store.getState();

    if (currentClass && !notification.userInteraction) {
      if (currentClass.id === notification.data.classId) {
        const {
          username,
          name,
          avatar,
          id,
          message,
          createdAt,
        } = notification.data;

        store.dispatch(
          addMsg({
            user: {
              name,
              username,
              avatar,
            },
            id,
            message,
            createdAt,
          }),
        );
      }
    }
  },

  requestPermissions: true,
});

const Wrapper = () => {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <App />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
};

AppRegistry.registerComponent(appName, () => Wrapper);
