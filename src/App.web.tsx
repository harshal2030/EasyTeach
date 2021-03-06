import React from 'react';
import axios from 'axios';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import AsyncStorage from '@react-native-community/async-storage';
import {connect} from 'react-redux';

import {RootStackParamList} from './navigators/types';
import {StoreState} from './global';
import {registerToken, removeToken} from './global/actions/token';
import {registerProfile} from './global/actions/profile';
import {fetchClasses} from './global/actions/classes';

import {checkTokenUrl} from './utils/urls';
import {alert} from './utils/functions';

const Stack = createStackNavigator<RootStackParamList>();

interface Props {
  token: string | null;
  registerProfile: typeof registerProfile;
  registerToken: typeof registerToken;
  removeToken: typeof removeToken;
  fetchClasses: Function;
}

interface State {
  loading: boolean;
}

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
        this.props.fetchClasses(token);

        const res = await axios.get<userChecker>(checkTokenUrl, {
          timeout: 20000,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data.message === 'SERVER_MAINTENANCE') {
          alert(
            'Server Maintenance',
            'You might be facing trouble in accessing services',
          );
          return;
        }

        this.props.registerProfile(res.data.user);
      }
    } catch (e) {
      this.props.removeToken();
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
          <Stack.Screen
            name="Drawer"
            component={require('./screens/People').default}
          />
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

export default connect(mapStateToProps, {
  registerToken,
  registerProfile,
  removeToken,
  fetchClasses,
})(App);
