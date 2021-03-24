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
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import AuthScreen from './screens/AuthScreen';

import {StoreState} from '../shared/global';
import {registerToken, removeToken} from '../shared/global/actions/token';
import {registerProfile} from '../shared/global/actions/profile';
import {fetchClasses} from '../shared/global/actions/classes';

import {checkTokenUrl} from '../shared/utils/urls';

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
  text: string;
  title: string;
  alertVisible: boolean;
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
      text: '',
      title: '',
      alertVisible: false,
    };
  }

  componentDidMount() {
    this.checkToken();

    document.title = 'EayTeach - Delightful teaching for everyone';
  }

  openDialog = (title: string, text: string = '') => {
    this.setState({title, text, alertVisible: true});
  };

  closeDialog = () => this.setState({alertVisible: false});

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
          this.openDialog(
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
      <>
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

        <Dialog
          open={this.state.alertVisible}
          onClose={this.closeDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description">
          <DialogTitle id="alert-dialog-title">{this.state.title}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {this.state.text}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.closeDialog} color="primary" autoFocus>
              Ok
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

const Main = () => {
  return (
    <View>
      <p>Hello</p>
    </View>
  );
};

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
