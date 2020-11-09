import React from 'react';
import {ActivityIndicator, View, Alert, BackHandler} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {connect} from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';

import {StoreState} from './global';
import {registerToken, removeToken} from './global/actions/token';
import {registerProfile} from './global/actions/profile';
import {Class} from './global/actions/classes';

import {checkTokenUrl} from './utils/urls';

import Login from './screens/Login';
import SignUp from './screens/SignUp';
import Drawer from './navigators/Drawer';
import JoinClass from './screens/JoinClass';
import Quiz from './screens/Quiz';
import Settings from './screens/Settings';

import {RootStackParamList} from './navigators/types';
import {commonBlue} from './styles/colors';
import Axios from 'axios';

const Stack = createStackNavigator<RootStackParamList>();

interface Props {
  token: string | null;
  profile: {name: string; username: string; avatar: string};
  currentClass: Class | null;
  registerToken: typeof registerToken;
  removeToken: typeof removeToken;
  registerProfile: typeof registerProfile;
}

const App = (props: Props): JSX.Element => {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        props.registerToken(token);
        Axios.get<{name: string; username: string; avatar: string}>(
          checkTokenUrl,
          {
            timeout: 20000,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
          .then((res) => {
            if (res.status === 200) {
              props.registerProfile(res.data);
            }
          })
          .catch((e) => {
            if (e.response) {
              if (e.response.status === 401) {
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
        props.removeToken();
      }
      setLoading(false);
    };

    checkToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      // eslint-disable-next-line react-native/no-inline-styles
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color={commonBlue} animating />
      </View>
    );
  }

  let isOwner = false;
  let CreateTest = null;

  if (props.currentClass) {
    isOwner = props.profile.username === props.currentClass.owner.username;
    CreateTest = isOwner ? require('./screens/CreateTest').default : null;
  }

  return (
    <Stack.Navigator headerMode="none">
      {props.token === null ? (
        <>
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen name="Login" component={Login} />
        </>
      ) : (
        <>
          <Stack.Screen name="Drawer" component={Drawer} />
          <Stack.Screen name="JoinClass" component={JoinClass} />
          <Stack.Screen name="Quiz" component={Quiz} />
          <Stack.Screen name="Settings" component={Settings} />
          {isOwner && <Stack.Screen name="CreateTest" component={CreateTest} />}
        </>
      )}
    </Stack.Navigator>
  );
};

const mapStateToProps = (state: StoreState) => {
  return {
    token: state.token,
    profile: state.profile,
    currentClass: state.currentClass,
  };
};

export default connect(mapStateToProps, {
  registerToken,
  removeToken,
  registerProfile,
})(App);
