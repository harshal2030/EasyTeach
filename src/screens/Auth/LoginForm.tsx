import React, {Component} from 'react';
import {StyleSheet, ScrollView} from 'react-native';
import {Text, View} from 'react-native-animatable';

import CustomButton from '../../components/common/CustomButton';
import CustomTextInput from '../../components/common/CustomTextInput';
import metrics from '../../config/metrics';

interface Props {
  isLoading: boolean;
  onLoginPress: (email: string, password: string) => void;
  onSignupLinkPress: () => void;
}

interface State {
  email: string;
  password: string;
  fullName: string;
}

export default class LoginForm extends Component<Props, State> {
  state = {
    email: '',
    password: '',
    fullName: '',
  };

  hideForm = async () => {
    if (this.buttonRef && this.formRef && this.linkRef) {
      await Promise.all([
        this.buttonRef.zoomOut(200),
        this.formRef.fadeOut(300),
        this.linkRef.fadeOut(300),
      ]);
    }
  };
  buttonRef: any;
  formRef: any;
  linkRef: any;
  emailInputRef: CustomTextInput | null = null;
  passwordInputRef: any;

  render() {
    const {email, password} = this.state;
    const {isLoading, onSignupLinkPress, onLoginPress} = this.props;
    return (
      <ScrollView style={styles.container}>
        <View
          style={styles.form}
          ref={(ref) => {
            this.formRef = ref;
          }}>
          <CustomTextInput
            name={'email'}
            ref={(ref) => (this.emailInputRef = ref)}
            placeholder={'Email or Username'}
            keyboardType={'email-address'}
            editable={!isLoading}
            returnKeyType={'next'}
            blurOnSubmit={false}
            withRef={true}
            onSubmitEditing={() => this.passwordInputRef.focus()}
            onChangeText={(value) => this.setState({email: value})}
            isEnabled={!isLoading}
          />
          <CustomTextInput
            name={'password'}
            ref={(ref) => (this.passwordInputRef = ref)}
            placeholder={'Password'}
            editable={!isLoading}
            returnKeyType={'done'}
            secureTextEntry={true}
            withRef={true}
            onChangeText={(value) => this.setState({password: value})}
            isEnabled={!isLoading}
          />
        </View>
        <View style={styles.footer}>
          <View
            ref={(ref) => (this.buttonRef = ref)}
            animation={'bounceIn'}
            duration={600}
            delay={400}>
            <CustomButton
              onPress={() => onLoginPress(email, password)}
              isEnabled={true}
              isLoading={isLoading}
              buttonStyle={styles.loginButton}
              textStyle={styles.loginButtonText}
              text={'Log In'}
            />
          </View>
          <Text
            ref={(ref) => (this.linkRef = ref)}
            style={styles.signupLink}
            onPress={onSignupLinkPress}
            animation={'fadeIn'}
            duration={600}
            delay={400}>
            {'Not registered yet?'}
          </Text>
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: metrics.DEVICE_WIDTH * 0.1,
  },
  form: {
    marginTop: 20,
  },
  footer: {
    height: 100,
    justifyContent: 'center',
  },
  loginButton: {
    backgroundColor: 'white',
  },
  loginButtonText: {
    color: '#3E464D',
    fontWeight: 'bold',
  },
  signupLink: {
    color: 'rgba(255,255,255,0.6)',
    alignSelf: 'center',
    padding: 20,
  },
});
