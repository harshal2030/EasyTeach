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

import {registerFCM} from './src/global/actions/token';
import {addMsg} from './src/global/actions/msgs';

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
      <NavigationContainer>
        <App />
      </NavigationContainer>
    </Provider>
  );
};

AppRegistry.registerComponent(appName, () => Wrapper);
