import React from 'react';
import axios from 'axios';
import {View, StyleSheet} from 'react-native';
import {Header, PricingCard, Text} from 'react-native-elements';
import {StackNavigationProp} from '@react-navigation/stack';
import {connect} from 'react-redux';
import Config from 'react-native-config';
// @ts-ignore
import RazorPay from 'react-native-razorpay';
import SnackBar from 'react-native-snackbar';

import {StoreState} from '../../shared/global';
import {
  Class,
  updateClasses,
  registerCurrentClass,
} from '../../shared/global/actions/classes';

import {RootStackParamList} from '../navigators/types';
import {commonBlue, flatRed, eucalyptusGreen} from '../../shared/styles/colors';
import {pricing} from '../../shared/utils/pricing';
import {paymentUrl} from '../../shared/utils/urls';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Checkout'>;
  currentClass: Class;
  updateClasses: typeof updateClasses;
  registerCurrentClass: typeof registerCurrentClass;
  token: string;
};

type State = {
  loading: boolean;
};

class Checkout extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loading: false,
    };
  }

  postPayment = async (
    amountPayed: number,
    paymentId: string,
    signature: string,
    orderId: string,
  ) => {
    try {
      const res = await axios.post<Class>(
        `${paymentUrl}/${this.props.currentClass!.id}`,
        {
          amountPayed,
          paymentId,
          orderId,
          signature,
        },
        {
          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
        },
      );
      this.setState({loading: false});

      this.props.updateClasses(res.data);
      this.props.registerCurrentClass(res.data);
      // @ts-ignore
      this.props.navigation.navigate('Drawer', {
        screen: 'Home',
      });

      SnackBar.show({
        text: "You're all ready to enjoy teaching",
        backgroundColor: eucalyptusGreen,
        textColor: '#fff',
        duration: SnackBar.LENGTH_INDEFINITE,
        action: {
          text: 'OKAY',
        },
      });
    } catch (err) {
      this.setState({loading: false});
      SnackBar.show({
        text: 'Payment Failed',
        backgroundColor: flatRed,
        textColor: '#fff',
        duration: SnackBar.LENGTH_LONG,
      });
    }
  };

  getPayment = async () => {
    try {
      this.setState({loading: true});
      const res = await axios.get(
        `${paymentUrl}/${this.props.currentClass!.id}/${pricing.standard.id}`,
        {
          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
        },
      );

      const options = {
        key: Config.key_id,
        name: 'Easy Teach',
        description: 'Standard Plan',
        amount: res.data.amount,
        order_id: res.data.orderId,
        currency: 'INR',
        theme: {
          color: commonBlue,
        },
      };

      const data = await RazorPay.open(options);
      this.postPayment(
        res.data.amount,
        data.razorpay_payment_id,
        data.razorpay_signature,
        res.data.orderId,
      );
    } catch (e) {
      this.setState({loading: false});
      await axios.delete(`${paymentUrl}/${this.props.currentClass!.id}`, {
        headers: {
          Authorization: `Bearer ${this.props.token}`,
        },
      });

      SnackBar.show({
        text: 'Unable to place your order',
        backgroundColor: flatRed,
        textColor: '#fff',
        duration: SnackBar.LENGTH_LONG,
      });
    }
  };

  render() {
    return (
      <View style={{flex: 1}}>
        <Header
          centerComponent={{
            text: 'Checkout',
            style: {fontSize: 24, color: '#ffff', fontWeight: '600'},
          }}
          leftComponent={{
            icon: 'arrow-back',
            color: '#ffff',
            size: 26,
            onPress: this.props.navigation.goBack,
          }}
        />
        <Text h3 style={styles.titleStyle}>
          Upgrading {this.props.currentClass.name} Class
        </Text>

        <PricingCard
          color={commonBlue}
          title="Standard"
          price={'\u20B9 100 per month per class'}
          pricingStyle={styles.pricingStyle}
          info={[
            '1000 Students',
            'Unlimited tests',
            '20 GB Video Storage',
            'All Core Feature Included',
            'No upfront Cost',
          ]}
          button={{
            title: '  GET STARTED',
            // @ts-ignore
            icon: {
              name: 'rocket-launch',
              type: 'material-community',
              color: '#ffff',
            },
            loading: this.state.loading,
          }}
          onButtonPress={this.getPayment}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  titleStyle: {
    alignSelf: 'center',
    padding: 10,
  },
  pricingStyle: {
    fontSize: 25,
  },
});

const mapStateToProps = (state: StoreState) => {
  return {
    currentClass: state.currentClass!,
    token: state.token!,
  };
};

export default connect(mapStateToProps, {updateClasses, registerCurrentClass})(
  Checkout,
);
