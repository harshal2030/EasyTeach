/* eslint-disable no-alert */
import React from 'react';
import axios from 'axios';
import {connect} from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import validator from 'validator';
import Config from 'react-native-config';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import {StoreState} from '../../shared/global';
import {registerToken} from '../../shared/global/actions/token';
import {registerProfile} from '../../shared/global/actions/profile';

import Auth from '../../shared/screens/AuthScreen';

import {signUpUrl, loginUrl} from '../../shared/utils/urls';
import {usernamePattern} from '../../shared/utils/regexPatterns';

interface Props {
  token: string;
  fcm: {
    os: string;
    fcmToken: string;
  };
  registerToken: typeof registerToken;
  registerProfile: typeof registerProfile;
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
          onForgotClick={() => alert('You have to complete this')}
        />

        <Dialog
          open={this.state.alertVisible}
          onClose={this.closeDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description">
          <DialogTitle id="alert-dialog-title">{this.state.title}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {this.state.text}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.closeDialog} color="primary" autoFocus>
              Ok
            </Button>
          </DialogActions>
        </Dialog>
      </>
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
