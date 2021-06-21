import React, {Component} from 'react';
import {StyleSheet, ScrollView} from 'react-native';
import {Text, View} from 'react-native-animatable';

import CustomButton from '../../components/common/CustomButton';
import CustomTextInput from '../../components/common/CustomTextInput';
import metrics from '../../config/metrics';

interface Props {
  isLoading: boolean;
  onSignupPress: (
    name: string,
    username: string,
    email: string,
    password: string,
  ) => void;
  onLoginLinkPress: () => void;
}

interface State {
  email: string;
  username: string;
  password: string;
  name: string;
}

export default class SignupForm extends Component<Props, State> {
  state = {
    email: '',
    username: '',
    password: '',
    name: '',
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
  mobileInputRef: CustomTextInput | null = null;
  emailInputRef: any;
  passwordInputRef: any;
  usernameRef: any;

  render() {
    const {email, password, name, username} = this.state;
    const {isLoading, onLoginLinkPress, onSignupPress} = this.props;

    return (
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.form} ref={(ref) => (this.formRef = ref)}>
          <CustomTextInput
            ref={(ref) => (this.mobileInputRef = ref)}
            placeholder={'Full name'}
            editable={!isLoading}
            returnKeyType={'next'}
            blurOnSubmit={false}
            underlineColorAndroid="transparent"
            withRef={true}
            onSubmitEditing={() => this.usernameRef.focus()}
            onChangeText={(value) => this.setState({name: value})}
            isEnabled={!isLoading}
          />
          <CustomTextInput
            ref={(ref) => (this.usernameRef = ref)}
            placeholder={'Username'}
            editable={!isLoading}
            returnKeyType={'next'}
            blurOnSubmit={false}
            underlineColorAndroid="transparent"
            withRef={true}
            onSubmitEditing={() => this.emailInputRef.focus()}
            onChangeText={(value) => this.setState({username: value})}
            isEnabled={!isLoading}
          />
          <CustomTextInput
            ref={(ref) => (this.emailInputRef = ref)}
            placeholder={'Email'}
            keyboardType={'email-address'}
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
            ref={(ref) => (this.passwordInputRef = ref)}
            placeholder={'Password'}
            editable={!isLoading}
            returnKeyType={'done'}
            secureTextEntry={true}
            onSubmitEditing={() =>
              onSignupPress(name, username, email, password)
            }
            underlineColorAndroid="transparent"
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
              onPress={() => onSignupPress(name, username, email, password)}
              isEnabled={true}
              isLoading={isLoading}
              buttonStyle={styles.createAccountButton}
              textStyle={styles.createAccountButtonText}
              text={'Create Account'}
            />
          </View>
          <Text
            ref={(ref) => (this.linkRef = ref)}
            style={styles.loginLink}
            onPress={onLoginLinkPress}
            animation={'fadeIn'}
            duration={600}
            delay={400}>
            {'Already have an account?'}
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
    marginBottom: 20,
  },
  createAccountButton: {
    backgroundColor: 'white',
  },
  createAccountButtonText: {
    color: '#3E464D',
    fontWeight: 'bold',
  },
  loginLink: {
    color: 'rgba(255,255,255,0.6)',
    alignSelf: 'center',
    padding: 20,
  },
});
