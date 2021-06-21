import React from 'react';
import axios from 'axios';
import {View, Text, TextInput, StyleSheet, Keyboard} from 'react-native';
import {Header, Button} from 'react-native-elements';
import validator from 'validator';
import Config from 'react-native-config';
import {withRouter, RouteComponentProps} from 'react-router-dom';
import {toast} from 'react-toastify';
import checkIcon from '@iconify-icons/feather/check-circle';
import backIcon from '@iconify-icons/ic/arrow-back';
import arrowIcon from '@iconify-icons/ic/baseline-arrow-left';

import {TouchableIcon} from '../components';
import {ContainerStyles} from '../../shared/styles/styles';
import {
  commonBlue,
  commonGrey,
  eucalyptusGreen,
} from '../../shared/styles/colors';
import {recoveryUrl} from '../../shared/utils/urls';

type Props = RouteComponentProps;

interface State {
  email: string;
  loading: boolean;
  code: string;
  password: string;
  password2: string;
  page: 0 | 1 | 2;
}

class Forgot extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      email: '',
      loading: false,
      code: '',
      password: '',
      password2: '',
      page: 1,
    };
  }

  onSendCodePress = () => {
    const {email} = this.state;

    if (!validator.isEmail(email)) {
      toast.error(
        'Please enter E-mail which is registered with our services.',
        {
          autoClose: false,
        },
      );
      return;
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
          toast.error(res.data.error, {autoClose: false});
          return;
        }

        Keyboard.dismiss();
        this.setState({page: 1});
      })
      .catch(() => {
        this.setState({loading: false});
        toast.error('Unable to send code at the moment', {autoClose: false});
      });
  };

  onUpdatePress = () => {
    const {email, code, password, password2} = this.state;

    if (password !== password2) {
      toast.error('Passwords do not match', {autoClose: false});
      return;
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
        this.setState({page: 2});
      })
      .catch(() => {
        this.setState({loading: false});
        toast.error('Unable to update password at the moment');
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
          leftComponent={
            <TouchableIcon
              icon={backIcon}
              size={26}
              color="#fff"
              onPress={this.props.history.goBack}
            />
          }
        />

        <View style={{flex: 1}}>
          {this.state.page === 0 && (
            <View collapsable={false} key="1" style={ContainerStyles.padder}>
              <Text style={styles.heading}>E-mail</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="email-address"
                autoCapitalize="none"
                value={this.state.email}
                returnKeyType="done"
                onSubmitEditing={this.onSendCodePress}
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
          )}

          {this.state.page === 1 && (
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
                  this.setState({page: 0});
                }}
                icon={
                  <TouchableIcon
                    icon={arrowIcon}
                    color={commonBlue}
                    size={26}
                  />
                }
              />
            </View>
          )}

          {this.state.page === 2 && (
            <View
              key="3"
              style={[ContainerStyles.padder, styles.successPage]}
              collapsable={false}>
              <TouchableIcon
                icon={checkIcon}
                size={200}
                color={eucalyptusGreen}
              />
              <Text>Password updated successfully</Text>

              <Button
                title="Back to Login"
                onPress={() => this.props.history.push('/auth')}
                containerStyle={{width: '100%', marginTop: 20}}
              />
            </View>
          )}
        </View>
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
    padding: 10,
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

export default withRouter(Forgot);
