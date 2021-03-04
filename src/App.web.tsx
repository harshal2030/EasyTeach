import React from 'react';
import axios from 'axios';
import {View, ActivityIndicator, StyleSheet, Text} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import AsyncStorage from '@react-native-community/async-storage';
import {connect} from 'react-redux';

import {RootStackParamList} from './navigators/types';
import {StoreState} from './global';
import {registerToken} from './global/actions/token';
import {checkTokenUrl} from './utils/urls';

const Stack = createStackNavigator<RootStackParamList>();

interface Props {
  token: string | null;
  registerToken: typeof registerToken;
}

interface State {
  loading: boolean;
}

const Test = () => {
  return (
    <View>
      <Text>Hello</Text>
    </View>
  );
};

interface userChecker {
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  message: 'CONTINUE' | 'UPDATE_REQUIRED' | 'SERVER_MAINTENANCE';
}

class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loading: true,
    };
  }

  componentDidMount() {
    this.checkToken();
  }

  checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      this.setState({loading: false});
      if (token !== null) {
        this.props.registerToken(token);

        const res = await axios.get<userChecker>(checkTokenUrl, {
          timeout: 20000,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (e) {
      // move on
    }
  };

  render() {
    if (this.state.loading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator animating color="blue" size="large" />
        </View>
      );
    }

    return (
      <Stack.Navigator headerMode="none">
        {this.props.token === null ? (
          <Stack.Screen
            name="Auth"
            component={require('./screens/AuthScreen').default}
          />
        ) : (
          <Stack.Screen name="Drawer" component={Test} />
        )}
      </Stack.Navigator>
    );
  }
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const mapStateToProps = (state: StoreState) => {
  return {
    token: state.token,
  };
};

export default connect(mapStateToProps, {registerToken})(App);
