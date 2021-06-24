import React from 'react';
import axios from 'axios';
import {connect} from 'react-redux';
import Dialog from 'react-native-dialog';
import AsyncStorage from '@react-native-community/async-storage';
import validator from 'validator';
import Config from 'react-native-config';
import {withRouter, RouteComponentProps} from 'react-router-dom';

import {StoreState} from '../../shared/global';
import {registerToken} from '../../shared/global/actions/token';
import {registerProfile} from '../../shared/global/actions/profile';
import {fetchClasses} from '../../shared/global/actions/classes';

import Auth from '../../shared/screens/AuthScreen';

import {signUpUrl, loginUrl} from '../../shared/utils/urls';
import {usernamePattern} from '../../shared/utils/regexPatterns';

interface Props extends RouteComponentProps {
  token: string;
  registerToken: typeof registerToken;
  registerProfile: typeof registerProfile;
  fetchClasses: Function;
  fcm: {
    os: string;
    fcmToken: string;
  } | null;
}

interface State {
  loading: boolean;
  title: string;
  text: string;
  alertVisible: boolean;
}

class AuthScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loading: false,
      title: '',
      text: '',
      alertVisible: false,
    };
  }

  openDialog = (title: string, text: string = '') => {
    this.setState({title, text, alertVisible: true});
  };

  closeDialog = () => this.setState({alertVisible: false});

  storeToken = async (token: string) => {
    try {
      await AsyncStorage.setItem('token', token);
    } catch (e) {
      // move on
    }
  };

  onLogin = (email: string, password: string) => {
    if (password.length < 6 || email === '') {
      return this.openDialog('Invalid credentials');
    }

    const {fcm} = this.props;
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
            device: {
              os: fcm ? fcm.os : 'web',
              fcmToken: fcm ? fcm.fcmToken : '',
            },
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
            this.props.fetchClasses(res.data.token);
            this.storeToken(res.data.token);
            this.props.registerToken(res.data.token);
            this.props.registerProfile(res.data.user);
          }
        })
        .catch(() => {
          this.setState({loading: false});
          this.openDialog('Invalid Credentials');
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
      return this.openDialog('', 'All fields are required');
    }

    if (!usernamePattern.test(username)) {
      return this.openDialog(
        '',
        'Invalid username pattern. Only underscores, periods, alphabets, numbers are allowed',
      );
    }

    if (!validator.isEmail(email)) {
      return this.openDialog('', 'Please enter valid e-mail');
    }

    if (password.length < 6) {
      return this.openDialog(
        '',
        'Password too short. Consider at least 6 characters',
      );
    }

    this.setState({loading: true});

    const {fcm} = this.props;
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
          device: {
            os: fcm ? fcm.os : 'web',
            fcmToken: fcm ? fcm.fcmToken : '',
          },
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
          this.props.fetchClasses(res.data.token);
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
            return this.openDialog('Oops!', e.response.data.error);
          }
        }
        return this.openDialog(
          'Oops!',
          'Something went wrong! Please try again later.',
        );
      });
  };
  render() {
    return (
      <>
        <Auth
          isLoading={this.state.loading}
          isLoggedIn={false}
          login={this.onLogin}
          signup={this.onSignUp}
          onLoginAnimationCompleted={() => null}
          onForgotClick={() => this.props.history.push('/forgot')}
        />

        <Dialog.Container visible={this.state.alertVisible}>
          <Dialog.Title>{this.state.title}</Dialog.Title>
          <Dialog.Description>{this.state.text}</Dialog.Description>
          <Dialog.Button label="Ok" onPress={this.closeDialog} />
        </Dialog.Container>
      </>
    );
  }
}

const mapStateToProps = (state: StoreState) => {
  return {
    token: state.token!,
    fcm: state.fcm,
  };
};

export default withRouter(
  connect(mapStateToProps, {
    registerProfile,
    registerToken,
    fetchClasses,
  })(AuthScreen),
);
