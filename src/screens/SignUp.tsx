import React from 'react';
import {View, ScrollView, Alert} from 'react-native';
import {Header, Input, Button} from 'react-native-elements';
import {StackNavigationProp} from '@react-navigation/stack';
import {connect} from 'react-redux';
import axios from 'axios';
import validator from 'validator';
import AsyncStorage from '@react-native-community/async-storage';

import {StoreState} from '../global';
import {registerToken} from '../global/actions/token';
import {registerProfile} from '../global/actions/profile';
import {usernamePattern} from '../utils/regexPatterns';

import {TextLink} from '../components/common';

import {commonBlue} from '../styles/colors';
import {FormStyles} from '../styles/forms';

import {RootStackParamList} from '../navigators/types';
import {signUpUrl} from '../utils/urls';

type SignUpNavProps = StackNavigationProp<RootStackParamList, 'SignUp'>;

type Props = {
  navigation: SignUpNavProps;
  registerToken: typeof registerToken;
  token: string;
  registerProfile: typeof registerProfile;
};

interface State {
  name: string;
  username: string;
  email: string;
  password: string;
  loading: boolean;
  nameErr: string;
  usernameErr: string;
  mailErr: string;
  passErr: string;
}

class SignUp extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      name: '',
      username: '',
      email: '',
      password: '',
      loading: false,
      nameErr: '',
      usernameErr: '',
      mailErr: '',
      passErr: '',
    };
  }

  storeToken = async (token: string): Promise<void> => {
    try {
      AsyncStorage.setItem('token', token);
    } catch (e) {}
  };

  onSubmit = (): void => {
    const {name, username, email, password} = this.state;

    if (name.length <= 0) {
      this.setState({nameErr: 'Please enter your name'});
    } else {
      this.setState({nameErr: ''});
    }

    if (!usernamePattern.test(username)) {
      this.setState({
        usernameErr:
          'Invalid username pattern. Only underscores, periods are allowed',
      });
    } else {
      this.setState({usernameErr: ''});
    }

    if (!validator.isEmail(email)) {
      this.setState({mailErr: 'Invalid E-mail'});
    } else {
      this.setState({mailErr: ''});
    }

    if (password.length < 6) {
      this.setState({
        passErr: 'Password too short. Consider at least 6 characters',
      });
    } else {
      this.setState({passErr: ''});
    }

    if (
      name.length <= 0 ||
      !usernamePattern.test(username) ||
      !validator.isEmail(email) ||
      password.length < 6
    ) {
      return;
    }

    this.setState({loading: true}, () => {
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
          },
          {
            timeout: 20000,
          },
        )
        .then((res) => {
          if (res.status === 201) {
            this.storeToken(res.data.token);
            this.props.registerToken(res.data.token);
            this.props.registerProfile(res.data.user);
          }
        })
        .catch((e) => {
          this.setState({loading: false});
          if (e.response) {
            if (e.response.status === 400) {
              return Alert.alert('Oops!', e.response.data.error);
            }
          }
          return Alert.alert(
            'Oops!',
            'Something went wrong! Please try again later.',
          );
        });
    });
  };

  render(): JSX.Element {
    const {loading, nameErr, usernameErr, mailErr, passErr} = this.state;
    return (
      <View style={FormStyles.containerStyle}>
        <Header
          centerComponent={{
            text: 'Create Account',
            style: {color: '#fff', fontSize: 23, fontWeight: 'bold'},
          }}
          containerStyle={{backgroundColor: commonBlue}}
        />

        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={FormStyles.formContainerStyle}>
            <Input
              label="Name"
              errorMessage={nameErr}
              disabled={loading}
              onChangeText={(name) => this.setState({name})}
            />

            <Input
              label="Username"
              errorMessage={usernameErr}
              disabled={loading}
              onChangeText={(username) => this.setState({username})}
            />

            <Input
              label="E-mail"
              errorMessage={mailErr}
              disabled={loading}
              onChangeText={(email) => this.setState({email})}
            />

            <Input
              label="Password"
              errorMessage={passErr}
              secureTextEntry
              disabled={loading}
              onChangeText={(password) => this.setState({password})}
            />

            <Button
              title="Create Account"
              loading={loading}
              onPress={this.onSubmit}
            />
          </View>

          <View style={FormStyles.bottomContainer}>
            <TextLink
              disabled={this.state.loading}
              text="Already have an account? "
              clickableText="Log In"
              onPress={() => this.props.navigation.navigate('Login')}
            />
          </View>
        </ScrollView>
      </View>
    );
  }
}

const mapStateToProps = (state: StoreState): {token: string} => {
  return {
    token: state.token!,
  };
};

export default connect(mapStateToProps, {registerToken, registerProfile})(
  SignUp,
);
