import React, {useRef} from 'react';
import axios from 'axios';
import {Alert, BackHandler} from 'react-native';
import * as Analytics from 'expo-firebase-analytics';
import {createStackNavigator} from '@react-navigation/stack';
import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import {connect} from 'react-redux';
import SplashScreen from 'react-native-splash-screen';
import {encode, decode} from 'js-base64';
import {MMKV, dataStore} from './MMKV';
import * as Update from 'expo-updates';
import Config from 'react-native-config';

import Loading from './Loading';

import {StoreState} from '../shared/global';
import {registerToken, removeToken} from '../shared/global/actions/token';
import {registerProfile} from '../shared/global/actions/profile';
import {Class, fetchClasses} from '../shared/global/actions/classes';

import {checkTokenUrl} from '../shared/utils/urls';
import {linking} from './linking';

import {RootStackParamList} from './navigators/types';

const Stack = createStackNavigator<RootStackParamList>();

if (!global.btoa) {
  global.btoa = encode;
}

if (!global.atob) {
  global.atob = decode;
}

interface Props {
  token: string | null;
  profile: {name: string; username: string; avatar: string};
  currentClass: Class | null;
  registerToken: typeof registerToken;
  removeToken: typeof removeToken;
  registerProfile: typeof registerProfile;
  isOwner: boolean;
  fetchClasses: Function;
}

interface userChecker {
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  message: 'CONTINUE' | 'UPDATE_REQUIRED' | 'SERVER_MAINTENANCE';
}

const App: React.FC<Props> = (props) => {
  const [loading, setLoading] = React.useState(true);

  const navigationRef = useRef<NavigationContainerRef>();
  const routeNameRef = useRef<string>();

  const checkForUpdate = async () => {
    try {
      if (Config.env === 'production') {
        const update = await Update.checkForUpdateAsync();
        if (update.isAvailable) {
          await Update.fetchUpdateAsync();

          Alert.alert(
            'Update available',
            "An update is available for the app. This won't take much of your time",
            [
              {
                text: 'Ok, update my app',
                onPress: Update.reloadAsync,
              },
            ],
          );
        }
      }
    } catch (e) {
      // move on
    }
  };

  const checkToken = async () => {
    const token = MMKV.getString('token');
    setLoading(false);
    if (token) {
      props.registerToken(token);
      SplashScreen.hide();
      try {
        const res = await axios.get<userChecker>(checkTokenUrl, {
          timeout: 20000,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data.message === 'SERVER_MAINTENANCE') {
          Alert.alert(
            'Server Maintenance',
            'Please try after some time, server are under maintenance',
            [
              {
                text: 'ok',
                onPress: BackHandler.exitApp,
              },
            ],
          );
        }

        props.fetchClasses(token, dataStore);
        Analytics.setUserId(res.data.user.username);
        props.registerProfile(res.data.user);
      } catch (e) {
        if (e.response) {
          if (e.response.status === 401) {
            SplashScreen.hide();
            return props.removeToken();
          }
        }

        Alert.alert(
          'Unable to login',
          "we're having a tough time in connecting to services. Please check your internet connection or try after some time.",
          [
            {
              text: 'Ok',
              onPress: () => BackHandler.exitApp(),
            },
          ],
        );
      }
    } else {
      SplashScreen.hide();
      props.removeToken();
    }
  };

  React.useEffect(() => {
    checkToken();
    checkForUpdate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <NavigationContainer
      linking={linking}
      fallback={<Loading />}
      // @ts-ignore
      ref={navigationRef}
      onReady={() =>
        (routeNameRef.current = navigationRef.current!.getCurrentRoute()!.name)
      }
      onStateChange={async () => {
        const previousRouteName = routeNameRef.current;
        const currentRouteName = navigationRef.current!.getCurrentRoute()!.name;

        if (previousRouteName !== currentRouteName) {
          await Analytics.setCurrentScreen(currentRouteName);
        }

        routeNameRef.current = currentRouteName;
      }}>
      <Stack.Navigator headerMode="none">
        {props.token === null ? (
          <>
            <Stack.Screen
              name="Auth"
              component={require('./screens/AuthScreen').default}
            />
            <Stack.Screen
              name="Forgot"
              component={require('./screens/Forgot').default}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Drawer"
              component={require('./navigators/Drawer').default}
            />
            <Stack.Screen
              name="Info"
              component={require('./screens/Info').default}
            />
            <Stack.Screen
              name="JoinClass"
              component={require('./screens/JoinClass').default}
            />
            <Stack.Screen
              name="Quiz"
              component={require('./screens/Quiz').default}
            />
            <Stack.Screen
              name="EditProfile"
              component={require('./screens/EditProfile').default}
            />
            <Stack.Screen
              name="Files"
              component={require('./screens/Files').default}
            />
            <Stack.Screen
              name="Video"
              component={require('./screens/Video').default}
            />
            <Stack.Screen
              name="PDFViewer"
              component={require('./screens/PdfViewer').default}
            />
            {props.isOwner && (
              <Stack.Screen
                name="CreateTest"
                component={require('./screens/CreateTest').default}
              />
            )}
            {props.isOwner && (
              <Stack.Screen
                name="Checkout"
                component={require('./screens/Checkout').default}
              />
            )}
            {props.currentClass && (
              <Stack.Screen
                name="ShowScore"
                component={require('./screens/ShowScore').default}
              />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const mapStateToProps = (state: StoreState) => {
  let isOwner: boolean = false;
  if (state.currentClass) {
    isOwner = state.currentClass.owner.username === state.profile.username;
  }
  return {
    token: state.token,
    profile: state.profile,
    currentClass: state.currentClass,
    isOwner,
  };
};

export default connect(mapStateToProps, {
  registerToken,
  removeToken,
  registerProfile,
  fetchClasses,
})(App);
