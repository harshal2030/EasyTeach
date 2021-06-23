import React from 'react';
// import axios from 'axios';
import {View} from 'react-native';
import {Header} from 'react-native-elements';
import {WebView, WebViewMessageEvent} from 'react-native-webview';
import {websiteRoot} from '../../shared/utils/urls';
import {StackNavigationProp} from '@react-navigation/stack';
import {connect} from 'react-redux';
import SnackBar from 'react-native-snackbar';

import {StoreState} from '../../shared/global';
import {
  Class,
  updateClasses,
  registerCurrentClass,
} from '../../shared/global/actions/classes';

import {RootStackParamList} from '../navigators/types';
import {flatRed, eucalyptusGreen} from '../../shared/styles/colors';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Checkout'>;
  token: string;
  currentClassId: string;
  updateClasses: typeof updateClasses;
  registerCurrentClass: typeof registerCurrentClass;
};

const Checkout: React.FC<Props> = (props) => {
  const injectedJS = `
  (function() {
    window.localStorage.setItem('token', '${props.token}')
  })();`;

  const updateAndGreet = (data: Class) => {
    props.updateClasses(data);
    props.registerCurrentClass(data);
    // @ts-ignore
    props.navigation.navigate('Drawer', {
      screen: 'Home',
    });

    SnackBar.show({
      text: "Payment Successful! You're all ready to enjoy teaching",
      backgroundColor: eucalyptusGreen,
      textColor: '#fff',
      duration: SnackBar.LENGTH_INDEFINITE,
      action: {
        text: 'OKAY',
      },
    });
  };

  const onWebViewMessage = (e: WebViewMessageEvent) => {
    const {data} = e.nativeEvent;
    const parsedData = JSON.parse(data) as {success: boolean; data?: Class};

    if (parsedData.success && parsedData.data) {
      updateAndGreet(parsedData.data);
      return;
    }

    if (!parsedData.success) {
      SnackBar.show({
        text: 'Payment failed',
        backgroundColor: flatRed,
        textColor: '#fff',
        duration: SnackBar.LENGTH_LONG,
      });
    }
  };

  return (
    <View style={{flex: 1}}>
      <Header
        leftComponent={{
          icon: 'close',
          color: '#fff',
          onPress: props.navigation.goBack,
        }}
      />

      <WebView
        source={{uri: `${websiteRoot}/checkout/${props.currentClassId}`}}
        incognito
        injectedJavaScriptBeforeContentLoaded={injectedJS}
        onMessage={onWebViewMessage}
      />
    </View>
  );
};

const mapStateToProps = (state: StoreState) => {
  return {
    currentClassId: state.currentClass!.id,
    token: state.token!,
  };
};

export default connect(mapStateToProps, {updateClasses, registerCurrentClass})(
  Checkout,
);
