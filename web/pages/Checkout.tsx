import React from 'react';
import axios from 'axios';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Header, PricingCard, Text, Input, Button} from 'react-native-elements';
import {connect} from 'react-redux';
import Config from 'react-native-config';
import {toast} from 'react-toastify';
import {withRouter, RouteComponentProps} from 'react-router-dom';
import backIcon from '@iconify-icons/ic/arrow-back';
import rocketIcon from '@iconify-icons/mdi/rocket-launch';

import {TouchableIcon} from '../components/TouchableIcon';

import {StoreState} from '../../shared/global';
import {
  Class,
  updateClasses,
  registerCurrentClass,
} from '../../shared/global/actions/classes';

import {commonBlue} from '../../shared/styles/colors';
import {pricing} from '../../shared/utils/pricing';
import {paymentUrl} from '../../shared/utils/urls';
type Props = RouteComponentProps<{classId: string}> & {
  currentClass: Class;
  updateClasses: typeof updateClasses;
  registerCurrentClass: typeof registerCurrentClass;
  token: string;
  classes: Class[];
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

declare global {
  interface Window {
    ReactNativeWebView?: any;
  }
}

const loadScript = (src: string) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };

    document.body.appendChild(script);
  });
};

class Checkout extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loading: false,
      coupon: '',
    };
  }

  componentDidMount() {
    const {classId} = this.props.match.params;
    const {classes} = this.props;

    const classFound = classes.find((cls) => cls.id === classId);

    if (classFound) {
      this.props.registerCurrentClass(classFound);
    } else {
      this.props.history.replace('/*');
    }
  }

  updateAndGreet = (data: Class) => {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({success: true, data}),
      );
      return;
    }

    this.props.updateClasses(data);
    this.props.registerCurrentClass(data);
    this.props.history.push(`/classes/home/${this.props.match.params.classId}`);

    toast.success("Payment Successful! You're all ready to enjoy teaching");
  };

  postPayment = async (
    amountPayed: number,
    paymentId: string,
    signature: string,
    orderId: string,
  ) => {
    try {
      const res = await axios.post<Class>(
        `${paymentUrl}/${this.props.match.params.classId}`,
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
      toast.error('Payment failed');
    }
  };

  getPayment = async () => {
    try {
      this.setState({loading: true});

      const resScript = await loadScript(
        'https://checkout.razorpay.com/v1/checkout.js',
      );

      if (!resScript) {
        toast.error(
          'Unable to initiate payment gateway. Please try again later',
        );
        return;
      }

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
        toast.error(res.data.error);
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
          handler: (data: any) => {
            this.postPayment(
              res.data.order!.amount,
              data.razorpay_payment_id,
              data.razorpay_signature,
              res.data.order!.orderId,
            );
          },
          modal: {
            ondismiss: () => {
              this.setState({loading: false});
              axios
                .delete(`${paymentUrl}/${this.props.currentClass!.id}`, {
                  headers: {
                    Authorization: `Bearer ${this.props.token}`,
                  },
                })
                .catch(() => null);
            },
          },
        };

        // @ts-ignore
        // eslint-disable-next-line no-undef
        const rzp = new Razorpay(options);
        rzp.open();
        rzp.on('payment.failed', () => {
          this.setState({loading: false});
          axios
            .delete(`${paymentUrl}/${this.props.currentClass!.id}`, {
              headers: {
                Authorization: `Bearer ${this.props.token}`,
              },
            })
            .catch(() => null);
        });
      }
    } catch (e) {
      this.setState({loading: false});
      await axios.delete(`${paymentUrl}/${this.props.currentClass!.id}`, {
        headers: {
          Authorization: `Bearer ${this.props.token}`,
        },
      });

      toast.error('Unable to place your order');
    }
  };

  render() {
    return (
      <View style={{flex: 1}}>
        {!window.ReactNativeWebView && (
          <Header
            centerComponent={{
              text: 'Checkout',
              style: {fontSize: 24, color: '#ffff', fontWeight: '600'},
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
        )}
        <ScrollView style={{maxWidth: 1000, alignSelf: 'center'}}>
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
            icon={<TouchableIcon icon={rocketIcon} color="#fff" size={24} />}
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
    classes: state.classes.classes,
  };
};

export default withRouter(
  connect(mapStateToProps, {updateClasses, registerCurrentClass})(Checkout),
);
