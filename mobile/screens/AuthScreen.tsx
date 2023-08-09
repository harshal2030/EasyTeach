import React, {useState} from 'react';
import axios from 'axios';
import {Alert} from 'react-native';
import {connect} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import isEmail from 'validator/lib/isEmail';
import Config from 'react-native-config';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import * as Analytics from 'expo-firebase-analytics';

import {StoreState} from '../../shared/global';
import {registerToken} from '../../shared/global/actions/token';
import {registerProfile} from '../../shared/global/actions/profile';
import {fetchClasses} from '../../shared/global/actions/classes';

import Auth from '../../shared/screens/AuthScreen';

import {signUpUrl, loginUrl} from '../../shared/utils/urls';
import {usernamePattern} from '../../shared/utils/regexPatterns';
import {RootStackParamList} from '../navigators/types';

interface Props {
  token: string;
  fcm: {
    os: string;
    fcmToken: string;
  };
  registerToken: typeof registerToken;
  registerProfile: typeof registerProfile;
  fetchClasses: Function;
  navigation: NativeStackNavigationProp<RootStackParamList, 'Auth'>;
}

const AuthScreen: React.FC<Props> = (props) => {
  const [loading, setLoading] = useState<boolean>(false);

  const storeToken = (token: string) => {
    AsyncStorage.setItem('token', token);
  };

  const onLogin = (email: string, password: string) => {
    if (password.length < 6 || email === '') {
      return Alert.alert('Invalid credentials');
    }

    console.log('login', email, password, loginUrl);
    setLoading(true);
    axios
      .post<{
        token: string;
        user: {username: string; name: string; avatar: string};
      }>(
        loginUrl,
        {
          user: {
            username: email,
            password,
          },
          device: props.fcm,
        },
        {
          timeout: 20000,
          auth: {
            username: 'accountCreator',
            password: Config.accPass,
          },
        },
      )
      .then((res) => {
        if (res.status === 200) {
          storeToken(res.data.token);
          props.fetchClasses(res.data.token);
          props.registerToken(res.data.token);
          props.registerProfile(res.data.user);
        }
      })
      .catch((e) => {
        console.log(e);
        setLoading(false);
        Alert.alert('Invalid Credentials');

        Analytics.logEvent('http_error', {
          url: loginUrl,
          method: 'post',
          reason: 'unk',
        });
      });
  };

  const onSignUp = (
    name: string,
    username: string,
    email: string,
    password: string,
  ) => {
    if (
      name.trim().length === 0 ||
      username.trim().length === 0 ||
      email.trim().length === 0 ||
      password.trim().length === 0
    ) {
      return Alert.alert('', 'All fields are required');
    }

    if (!usernamePattern.test(username)) {
      return Alert.alert(
        '',
        'Invalid username pattern. Only underscores, periods, alphabets, numbers are allowed',
      );
    }

    if (!isEmail(email)) {
      return Alert.alert('', 'Please enter valid e-mail');
    }

    if (password.length < 6) {
      return Alert.alert(
        '',
        'Password too short. Consider at least 6 characters',
      );
    }

    const {fcm} = props;
    setLoading(true);
    axios
      .post<{
        token: string;
        user: {name: string; username: string; avatar: string};
      }>(
        signUpUrl,
        {
          user: {
            name,
            username,
            email,
            password,
          },
          device: fcm,
        },
        {
          timeout: 20000,
          auth: {
            username: 'accountCreator',
            password: Config.accPass,
          },
        },
      )
      .then((res) => {
        if (res.status === 201) {
          storeToken(res.data.token);
          props.fetchClasses(res.data.token);
          setLoading(false);
          props.registerToken(res.data.token);
          props.registerProfile(res.data.user);
        }
      })
      .catch((e) => {
        setLoading(false);
        if (e.response) {
          if (e.response.status === 400) {
            return Alert.alert('Oops!', e.response.data.error);
          }
        }
        Analytics.logEvent('http_error', {
          url: signUpUrl,
          method: 'post',
          reason: 'unk',
        });
        return Alert.alert(
          'Oops!',
          'Something went wrong! Please try again later.',
        );
      });
  };

  return (
    <Auth
      isLoading={loading}
      isLoggedIn={false}
      login={onLogin}
      signup={onSignUp}
      onLoginAnimationCompleted={() => null}
      onForgotClick={() => props.navigation.navigate('Forgot')}
    />
  );
};

const mapStateToProps = (state: StoreState) => {
  return {
    fcm: state.fcm!,
    token: state.token!,
  };
};

export default connect(mapStateToProps, {
  registerProfile,
  registerToken,
  fetchClasses,
})(AuthScreen);
