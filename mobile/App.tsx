import React from 'react';
import Axios from 'axios';
import {Alert, BackHandler} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {createStackNavigator} from '@react-navigation/stack';
import {connect} from 'react-redux';
import SplashScreen from 'react-native-splash-screen';
import {encode, decode} from 'js-base64';
import {MMKV} from './MMKV';
import * as Update from 'expo-updates';
import Config from 'react-native-config';

import {StoreState} from '../shared/global';
import {registerToken, removeToken} from '../shared/global/actions/token';
import {registerProfile} from '../shared/global/actions/profile';
import {Class} from '../shared/global/actions/classes';

import {checkTokenUrl} from '../shared/utils/urls';

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
}

interface userChecker {
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  message: 'CONTINUE' | 'UPDATE_REQUIRED' | 'SERVER_MAINTENANCE';
}

const App = (props: Props): JSX.Element => {
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
    const hasMigrated = MMKV.getBool('hasMigrated');
    if (!hasMigrated) {
      const t = await AsyncStorage.getItem('token');
      MMKV.setBool('hasMigrated', true);
      if (t) {
        MMKV.setString('token', t);
      }
    }
    const token = MMKV.getString('token');
    if (token) {
      props.registerToken(token);
      SplashScreen.hide();
      Axios.get<userChecker>(checkTokenUrl, {
        timeout: 20000,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (res.data.message === 'SERVER_MAINTENANCE') {
            Alert.alert(
              'Server Maintenance',
              'Please try some time, servers are under maintenance.',
              [
                {
                  text: 'Ok',
                  onPress: () => BackHandler.exitApp(),
                },
              ],
            );
          }
          props.registerProfile(res.data.user);
        })
        .catch((e) => {
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
        });
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

  return (
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
          {props.isOwner && (
            <Stack.Screen
              name="CreateTest"
              component={require('./screens/CreateTest').default}
            />
          )}
          {props.isOwner && (
            <Stack.Screen
              name="EditQuestion"
              component={require('./screens/EditQuestion').default}
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
})(App);
