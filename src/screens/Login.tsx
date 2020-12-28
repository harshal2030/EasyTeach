import React from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';
import {View, ScrollView, Alert} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Input, Header, Button} from 'react-native-elements';
import {connect} from 'react-redux';

import {TextLink} from '../components/common';
import {StoreState} from '../global';
import {registerToken} from '../global/actions/token';
import {registerProfile} from '../global/actions/profile';

import {commonBlue} from '../styles/colors';
import {FormStyles} from '../styles/styles';
import {RootStackParamList} from '../navigators/types';
import {loginUrl} from '../utils/urls';

type LoginNavigationProps = StackNavigationProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: LoginNavigationProps;
  token: string | null;
  registerToken: typeof registerToken;
  registerProfile: typeof registerProfile;
  device: {
    os: string;
    fcmToken: string;
  } | null;
};

type State = {
  username: string;
  password: string;
  loading: boolean;
};

class Login extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      loading: false,
    };
  }

  storeToken = async (token: string): Promise<void> => {
    try {
      AsyncStorage.setItem('token', token);
    } catch (e) {}
  };

  onSubmit = (): void => {
    const {username, password} = this.state;
    const {device} = this.props;

    if (password.length < 6) {
      return Alert.alert('Invalid credentials');
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
              username,
              password,
            },
            device,
          },
          {
            timeout: 20000,
            auth: {
              username: 'accountCreator',
              password: 'AJHK TREE VS *(%(@221133',
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
          Alert.alert('Invalid Credentials');
        });
    });
  };

  render(): JSX.Element {
    const {loading} = this.state;
    return (
      <View style={FormStyles.containerStyle}>
        <Header
          centerComponent={{
            text: 'Login',
            style: {color: '#fff', fontSize: 23, fontWeight: 'bold'},
          }}
          containerStyle={{backgroundColor: commonBlue}}
        />
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={FormStyles.formContainerStyle}>
            <Input
              // eslint-disable-next-line react-native/no-inline-styles
              containerStyle={{marginTop: 30}}
              disabled={loading}
              label="E-mail or Username"
              onChangeText={(username) => this.setState({username})}
            />

            <Input
              label="Password"
              disabled={loading}
              secureTextEntry
              onChangeText={(password) => this.setState({password})}
            />

            <Button title="Log In" loading={loading} onPress={this.onSubmit} />
          </View>
          <View style={FormStyles.bottomContainer}>
            <TextLink
              disabled={loading}
              text="New user? "
              clickableText="Create Account"
              onPress={() => this.props.navigation.navigate('SignUp')}
            />
          </View>
        </ScrollView>
      </View>
    );
  }
}

const mapStateToProps = (
  state: StoreState,
): {
  token: string | null;
  device: {
    os: string;
    fcmToken: string;
  } | null;
} => {
  return {
    token: state.token,
    device: state.fcm,
  };
};

export default connect(mapStateToProps, {
  registerToken,
  registerProfile,
})(Login);
