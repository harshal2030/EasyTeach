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
  onForgotClick: () => void;
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
    if (this.buttonRef && this.formRef && this.linkRef && this.forgotRef) {
      await Promise.all([
        this.buttonRef.zoomOut(200),
        this.formRef.fadeOut(300),
        this.linkRef.fadeOut(300),
        this.forgotRef.fadeOut(300),
      ]);
    }
  };
  buttonRef: any;
  formRef: any;
  forgotRef: any;
  linkRef: any;
  emailInputRef: CustomTextInput | null = null;
  passwordInputRef: any;

  render() {
    const {email, password} = this.state;
    const {isLoading, onSignupLinkPress, onLoginPress} = this.props;
    return (
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View
          style={styles.form}
          ref={(ref) => {
            this.formRef = ref;
          }}>
          <CustomTextInput
            name={'email'}
            ref={(ref) => (this.emailInputRef = ref)}
            placeholder={'Email or Username'}
            keyboardType="default"
            editable={!isLoading}
            returnKeyType={'next'}
            underlineColorAndroid="transparent"
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
            onSubmitEditing={() => onLoginPress(email, password)}
            underlineColorAndroid="transparent"
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
          <View style={styles.textButtonContainer}>
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
    height: 110,
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
    padding: 10,
    fontSize: 15,
    fontWeight: '700',
  },
  textButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
