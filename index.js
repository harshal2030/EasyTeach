/**
 * @format
 */
import React, {useRef} from 'react';
import 'react-native-gesture-handler';
import 'expo-asset';
import * as Analytics from 'expo-firebase-analytics';
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

enableScreens(true);

PushNotification.configure({
  onRegister: (token) => {
    store.dispatch(registerFCM({os: token.os, fcmToken: token.token}));
  },

  requestPermissions: true,
});

const Wrapper = () => {
  const navigationRef = useRef();
  const routeNameRef = useRef();

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer
          ref={navigationRef}
          onReady={() =>
            (routeNameRef.current =
              navigationRef.current.getCurrentRoute().name)
          }
          onStateChange={async () => {
            const previousRouteName = routeNameRef.current;
            const currentRouteName =
              navigationRef.current.getCurrentRoute().name;

            if (previousRouteName !== currentRouteName) {
              await Analytics.setCurrentScreen(currentRouteName);
            }

            routeNameRef.current = currentRouteName;
          }}>
          <App />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
};

AppRegistry.registerComponent(appName, () => Wrapper);
