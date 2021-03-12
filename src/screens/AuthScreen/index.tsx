import React from 'react';
import axios from 'axios';
import {connect} from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import validator from 'validator';
import Config from 'react-native-config';
import {StackNavigationProp} from '@react-navigation/stack';

import {StoreState} from '../../global';
import {registerToken} from '../../global/actions/token';
import {registerProfile} from '../../global/actions/profile';

import Auth from '../Auth';

import {signUpUrl, loginUrl} from '../../utils/urls';
import {alert} from '../../utils/functions';
import {usernamePattern} from '../../utils/regexPatterns';
import {RootStackParamList} from '../../navigators/types';

interface Props {
  token: string;
  fcm: {
    os: string;
    fcmToken: string;
  };
  registerToken: typeof registerToken;
  registerProfile: typeof registerProfile;
  navigation: StackNavigationProp<RootStackParamList, 'Auth'>;
}

interface State {
  loading: boolean;
}

class AuthScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loading: false,
    };
  }

  storeToken = async (token: string) => {
    try {
      await AsyncStorage.setItem('token', token);
    } catch (e) {
      // move on
    }
  };

  onLogin = (email: string, password: string) => {
    if (password.length < 6 || email === '') {
      return alert('Invalid credentials', '');
    }

    this.setState({loading: true}, () => {
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
            device: this.props.fcm,
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
            this.storeToken(res.data.token);
            this.props.registerToken(res.data.token);
            this.props.registerProfile(res.data.user);
          }
        })
        .catch(() => {
          this.setState({loading: false});
          alert('Invalid Credentials', '');
        });
    });
  };

  onSignUp = (
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
      return alert('', 'All fields are required');
    }

    if (!usernamePattern.test(username)) {
      return alert(
        '',
        'Invalid username pattern. Only underscores, periods, alphabets, numbers are allowed',
      );
    }

    if (!validator.isEmail(email)) {
      return alert('', 'Please enter valid e-mail');
    }

    if (password.length < 6) {
      return alert('', 'Password too short. Consider at least 6 characters');
    }

    const {fcm} = this.props;
    this.setState({loading: true});
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
          this.storeToken(res.data.token);
          this.setState({loading: false});
          this.props.registerToken(res.data.token);
          this.props.registerProfile(res.data.user);
        }
      })
      .catch((e) => {
        this.setState({loading: false});
        if (e.response) {
          if (e.response.status === 400) {
            return alert('Oops!', e.response.data.error);
          }
        }
        return alert('Oops!', 'Something went wrong! Please try again later.');
      });
  };
  render() {
    return (
      <Auth
        isLoading={this.state.loading}
        isLoggedIn={false}
        login={this.onLogin}
        signup={this.onSignUp}
        onLoginAnimationCompleted={() => null}
        onForgotClick={() => this.props.navigation.navigate('Forgot')}
      />
    );
  }
}

const mapStateToProps = (state: StoreState) => {
  return {
    fcm: state.fcm!,
    token: state.token!,
  };
};

export default connect(mapStateToProps, {registerProfile, registerToken})(
  AuthScreen,
);
