import React from 'react';
import axios from 'axios';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {
  BrowserRouter as Router,
  Link,
  Route,
  Switch,
  RouteProps,
  Redirect,
} from 'react-router-dom';
import AsyncStorage from '@react-native-community/async-storage';
import {connect} from 'react-redux';

import AuthScreen from './screens/AuthScreen/index.web';
import Main from './navigators/Drawer';

import {StoreState} from './global';
import {registerToken, removeToken} from './global/actions/token';
import {registerProfile} from './global/actions/profile';
import {fetchClasses} from './global/actions/classes';

import {checkTokenUrl} from './utils/urls';
import {alert} from './utils/functions';

interface userChecker {
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  message: 'CONTINUE' | 'UPDATE_REQUIRED' | 'SERVER_MAINTENANCE';
}

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

interface PrivateRouteProps extends RouteProps {
  Component: React.ElementType;
  token: string | null;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  Component,
  token,
  ...rest
}) => {
  return (
    <Route
      {...rest}
      render={(props) => {
        return token ? <Component {...props} /> : <Redirect to="/auth" />;
      }}
    />
  );
};

class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loading: true,
    };
  }

  componentDidMount() {
    this.checkToken();

    document.title = 'EayTeach - Delightful teaching for everyone';
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.token !== prevProps.token) {
      if (this.props.token) {
        this.props.fetchClasses(this.props.token);
      }
    }
  }

  checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token !== null) {
        this.props.registerToken(token);
        this.props.fetchClasses(token);
        this.setState({loading: false});

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
          this.props.removeToken();
          return;
        }

        this.props.registerProfile(res.data.user);
      } else {
        throw new Error();
      }
    } catch (e) {
      this.setState({loading: false});
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
      <Router>
        <Switch>
          <Route
            exact
            path="/"
            render={() => {
              return this.props.token ? <Redirect to="/home" /> : <Home />;
            }}
          />
          <Route path="/auth">
            {this.props.token ? <Redirect to="/home" /> : <AuthScreen />}
          </Route>
          <PrivateRoute
            Component={Main}
            token={this.props.token}
            path="/home"
          />
        </Switch>
      </Router>
    );
  }
}

const Home = () => {
  return (
    <View>
      <Link to="/auth">
        <p>Auth</p>
      </Link>
    </View>
  );
};

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
