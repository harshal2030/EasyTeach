import React from 'react';
import axios from 'axios';
import {View, Text, TextInput, StyleSheet, Alert, Keyboard} from 'react-native';
import {Header, Button} from 'react-native-elements';
import {StackNavigationProp} from '@react-navigation/stack';
import validator from 'validator';
import Config from 'react-native-config';
import ViewPager from '@react-native-community/viewpager';
import Feather from 'react-native-vector-icons/Feather';

import {RootStackParamList} from '../navigators/types';
import {ContainerStyles} from '../styles/styles';
import {commonBlue, commonGrey, eucalyptusGreen} from '../styles/colors';
import {recoveryUrl} from '../utils/urls';

interface Props {
  navigation: StackNavigationProp<RootStackParamList, 'Forgot'>;
}

interface State {
  email: string;
  loading: boolean;
  code: string;
  password: string;
  password2: string;
}

class Forgot extends React.Component<Props, State> {
  pager: ViewPager | null = null;
  constructor(props: Props) {
    super(props);

    this.state = {
      email: '',
      loading: false,
      code: '',
      password: '',
      password2: '',
    };
  }

  onSendCodePress = () => {
    const {email} = this.state;

    if (!validator.isEmail(email)) {
      return Alert.alert(
        '',
        'Please enter E-mail which is registered with our services.',
      );
    }

    this.setState({loading: true});
    axios
      .post(
        recoveryUrl,
        {email},
        {
          auth: {
            username: 'accountCreator',
            password: Config.accPass,
          },
        },
      )
      .then((res) => {
        this.setState({loading: false});
        if (res.data.error) {
          return Alert.alert('', res.data.error);
        }

        Keyboard.dismiss();
        this.pager!.setPage(1);
      })
      .catch(() => {
        this.setState({loading: false});
        Alert.alert('', 'Unable to send code at the moment');
      });
  };

  onUpdatePress = () => {
    const {email, code, password, password2} = this.state;

    if (password !== password2) {
      return Alert.alert('', 'Passwords do not match');
    }

    this.setState({loading: true});
    axios
      .post(
        `${recoveryUrl}/new`,
        {
          email,
          code,
          password,
          password2,
        },
        {
          auth: {
            username: 'accountCreator',
            password: Config.accPass,
          },
        },
      )
      .then(() => {
        this.setState({loading: false});
        Keyboard.dismiss();
        this.pager!.setPage(2);
      })
      .catch(() => {
        this.setState({loading: false});
        Alert.alert('', 'Unable to update password at the moment');
      });
  };

  render() {
    return (
      <View style={ContainerStyles.parent}>
        <Header
          centerComponent={{
            text: 'Forgot Password',
            style: {fontSize: 24, color: '#fff', fontWeight: '600'},
          }}
          leftComponent={{
            icon: 'arrow-back',
            color: '#ffff',
            size: 26,
            onPress: () => this.props.navigation.goBack(),
          }}
        />

        <ViewPager
          initialPage={0}
          style={{flex: 1}}
          scrollEnabled={false}
          ref={(ref) => (this.pager = ref)}>
          <View collapsable={false} key="1" style={ContainerStyles.padder}>
            <Text style={styles.heading}>E-mail</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="email-address"
              autoCapitalize="none"
              value={this.state.email}
              onChangeText={(email) => this.setState({email})}
            />

            <Button
              title="Send Code"
              loading={this.state.loading}
              containerStyle={styles.button}
              onPress={this.onSendCodePress}
            />
            <Text>
              *It will log out from all devices and send a code to your E-mail
              for resetting password
            </Text>
          </View>

          <View key="2" collapsable={false} style={ContainerStyles.padder}>
            <Text style={styles.heading}>Code</Text>
            <TextInput
              style={styles.textInput}
              autoCapitalize="none"
              value={this.state.code}
              onChangeText={(code) => this.setState({code})}
            />

            <Text style={styles.heading}>New Password</Text>
            <TextInput
              style={styles.textInput}
              autoCapitalize="none"
              value={this.state.password}
              secureTextEntry
              onChangeText={(password) => this.setState({password})}
            />

            <Text style={styles.heading}>Confirm Password</Text>
            <TextInput
              style={styles.textInput}
              autoCapitalize="none"
              value={this.state.password2}
              secureTextEntry
              onChangeText={(password2) => this.setState({password2})}
            />

            <Button
              title="Update Password"
              style={styles.button}
              loading={this.state.loading}
              onPress={this.onUpdatePress}
            />
            <Text>*Code sent is valid only for 1 hour.</Text>

            <Button
              title="Change E-mail"
              type="clear"
              onPress={() => {
                this.setState({
                  email: '',
                  code: '',
                  password: '',
                  password2: '',
                });
                this.pager!.setPage(0);
              }}
              icon={{name: 'arrow-left', color: commonBlue}}
            />
          </View>

          <View
            key="3"
            style={[ContainerStyles.padder, styles.successPage]}
            collapsable={false}>
            <Feather name="check-circle" size={100} color={eucalyptusGreen} />
            <Text>Password updated successfully</Text>

            <Button
              title="Back to Login"
              onPress={() => this.props.navigation.navigate('Auth')}
              containerStyle={{width: '100%', marginTop: 20}}
            />
          </View>
        </ViewPager>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: commonGrey,
  },
  textInput: {
    borderBottomWidth: 1,
    borderBottomColor: commonGrey,
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
  },
  successPage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Forgot;
