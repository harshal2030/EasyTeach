import React, {useRef, useState} from 'react';
import axios from 'axios';
import {View, Text, TextInput, StyleSheet, Alert, Keyboard} from 'react-native';
import {Header, Button} from 'react-native-elements';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import isEmail from 'validator/lib/isEmail';
import Config from 'react-native-config';
import ViewPager from 'react-native-pager-view';
import Feather from 'react-native-vector-icons/Feather';
import * as Analytics from 'expo-firebase-analytics';

import {RootStackParamList} from '../navigators/types';
import {ContainerStyles} from '../../shared/styles/styles';
import {
  commonBlue,
  commonGrey,
  eucalyptusGreen,
} from '../../shared/styles/colors';
import {recoveryUrl} from '../../shared/utils/urls';

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Forgot'>;
}

interface State {
  email: string;
  loading: boolean;
  code: string;
  password: string;
  password2: string;
}

const Forgot: React.FC<Props> = (props) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);

  const pager = useRef<ViewPager | null>(null);

  const flush = () => {
    setEmail('');
    setCode('');
    setPassword('');
    setPassword2('');
    pager.current?.setPage(0);
  };

  const onSendCodePress = () => {
    if (!isEmail(email)) {
      return Alert.alert(
        '',
        'Please enter E-mail which is registered with our services.',
      );
    }

    setLoading(true);
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
        setLoading(false);
        if (res.data.error) {
          return Alert.alert('', res.data.error);
        }

        Keyboard.dismiss();
        pager.current!.setPage(1);
      })
      .catch(() => {
        setLoading(false);
        Alert.alert('', 'Unable to send code at the moment');

        Analytics.logEvent('http_error', {
          url: recoveryUrl,
          method: 'post',
          reason: 'unk',
        });
      });
  };

  const onUpdatePress = () => {
    if (password !== password2) {
      return Alert.alert('', 'Passwords do not match');
    }

    setLoading(false);
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
        setLoading(false);
        Keyboard.dismiss();
        pager.current!.setPage(2);
      })
      .catch(() => {
        setLoading(false);
        Alert.alert('', 'Unable to update password at the moment');

        Analytics.logEvent('http_error', {
          url: `${recoveryUrl}/new`,
          method: 'post',
          reason: 'unk',
        });
      });
  };

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
          onPress: props.navigation.goBack,
        }}
      />

      <ViewPager
        initialPage={0}
        style={{flex: 1}}
        scrollEnabled={false}
        ref={pager}>
        <View collapsable={false} key="1" style={ContainerStyles.padder}>
          <Text style={styles.heading}>E-mail</Text>
          <TextInput
            style={styles.textInput}
            keyboardType="email-address"
            autoCapitalize="none"
            defaultValue={email}
            onChangeText={setEmail}
          />

          <Button
            title="Send Code"
            loading={loading}
            containerStyle={styles.button}
            onPress={onSendCodePress}
          />
          <Text>
            *It will log out from all devices and send a code to your E-mail for
            resetting password
          </Text>
        </View>

        <View key="2" collapsable={false} style={ContainerStyles.padder}>
          <Text style={styles.heading}>Code</Text>
          <TextInput
            style={styles.textInput}
            autoCapitalize="none"
            value={code}
            onChangeText={setCode}
          />

          <Text style={styles.heading}>New Password</Text>
          <TextInput
            style={styles.textInput}
            autoCapitalize="none"
            value={password}
            secureTextEntry
            onChangeText={setPassword}
          />

          <Text style={styles.heading}>Confirm Password</Text>
          <TextInput
            style={styles.textInput}
            autoCapitalize="none"
            value={password2}
            secureTextEntry
            onChangeText={setPassword2}
          />

          <Button
            title="Update Password"
            style={styles.button}
            loading={loading}
            onPress={onUpdatePress}
          />
          <Text>*Code sent is valid only for 1 hour.</Text>

          <Button
            title="Change E-mail"
            type="clear"
            onPress={flush}
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
            onPress={() => props.navigation.navigate('Auth')}
            containerStyle={{width: '100%', marginTop: 20}}
          />
        </View>
      </ViewPager>
    </View>
  );
};

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
