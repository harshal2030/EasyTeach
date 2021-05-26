import React from 'react';
import axios from 'axios';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Header, PricingCard, Text, Input, Button} from 'react-native-elements';
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
  coupon: string;
};

interface Order {
  orderId: string;
  amount: number;
  currency: string;
  planId: string;
}

interface OrderApiRes {
  proceedToPay: boolean;
  order: Order | null;
  class: Class | null;
  error: string | null;
}

class Checkout extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loading: false,
      coupon: '',
    };
  }

  updateAndGreet = (data: Class) => {
    this.props.updateClasses(data);
    this.props.registerCurrentClass(data);
    // @ts-ignore
    this.props.navigation.navigate('Drawer', {
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

      this.updateAndGreet(res.data);
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

      const coupon =
        this.state.coupon.trim().length === 0 ? null : this.state.coupon;

      const res = await axios.post<OrderApiRes>(
        `${paymentUrl}/order/${this.props.currentClass!.id}/`,
        {
          planId: pricing.standard.id,
          coupon,
        },
        {
          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
        },
      );

      if (res.data.error) {
        SnackBar.show({
          text: res.data.error,
          duration: SnackBar.LENGTH_LONG,
          backgroundColor: flatRed,
          textColor: '#ffff',
        });
        this.setState({loading: false});
        return;
      }

      if (!res.data.proceedToPay && res.data.class) {
        this.updateAndGreet(res.data.class);
        return;
      }

      if (res.data.proceedToPay && res.data.order) {
        const options = {
          key: Config.key_id,
          name: 'Easy Teach',
          description: 'Standard Plan',
          amount: res.data.order.amount,
          order_id: res.data.order.orderId,
          currency: 'INR',
          theme: {
            color: commonBlue,
          },
        };

        const data = await RazorPay.open(options);
        this.postPayment(
          res.data.order.amount,
          data.razorpay_payment_id,
          data.razorpay_signature,
          res.data.order.orderId,
        );
      }
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
        <ScrollView style={{padding: 10}}>
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
            containerStyle={{margin: 0}}
            // @ts-ignore
            button={{
              buttonStyle: {height: 0, padding: 0},
            }}
          />

          <Input
            label="Coupon Code"
            placeholder="(If any)"
            disabled={this.state.loading}
            value={this.state.coupon}
            onChangeText={(coupon) => this.setState({coupon})}
          />
          <Button
            title="GET STARTED"
            icon={{
              name: 'rocket-launch',
              type: 'material-community',
              color: '#fff',
            }}
            loading={this.state.loading}
            onPress={this.getPayment}
          />

          <View style={styles.bottomView} />
        </ScrollView>
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
  bottomView: {
    height: 30,
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
