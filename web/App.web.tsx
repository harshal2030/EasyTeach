import React from 'react';
import axios from 'axios';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {Route, Switch, RouteProps, Redirect} from 'react-router-dom';
import AsyncStorage from '@react-native-community/async-storage';
import {connect} from 'react-redux';
import Dialog from 'react-native-dialog';
import lazy from '@loadable/component';

import {StoreState} from '../shared/global';
import {
  registerToken,
  removeToken,
  registerFCM,
} from '../shared/global/actions/token';
import {registerProfile} from '../shared/global/actions/profile';
import {fetchClasses, Class} from '../shared/global/actions/classes';

import {checkTokenUrl} from '../shared/utils/urls';

const Home = lazy(() => import('./pages/Home'));
const AuthScreen = lazy(() => import('./pages/AuthScreen'), {
  fallback: <div>loading...</div>,
});
const Main = lazy(() => import('./pages/Main'), {
  fallback: <div>loading...</div>,
});
const JoinClass = lazy(() => import('./pages/JoinClass'), {
  fallback: <div>loading...</div>,
});
const CreateTest = lazy(() => import('./pages/CreateTest'), {
  fallback: <div>loading...</div>,
});
const Quiz = lazy(() => import('./pages/Quiz'), {
  fallback: <div>loading...</div>,
});
const Settings = lazy(() => import('./pages/Settings'), {
  fallback: <div>loading...</div>,
});
const EditProfile = lazy(() => import('./pages/EditProfile'), {
  fallback: <div>loading...</div>,
});
const ShowScore = lazy(() => import('./pages/ShowScore'), {
  fallback: <div>loading...</div>,
});
const EditQuestions = lazy(() => import('./pages/EditQuestions'), {
  fallback: <div>loading...</div>,
});
const Files = lazy(() => import('./pages/Files'), {
  fallback: <div>loading...</div>,
});
const Info = lazy(() => import('./pages/Info'), {
  fallback: <div>loading...</div>,
});
const Checkout = lazy(() => import('./pages/Checkout'), {
  fallback: <div>loading...</div>,
});
const CreateSheet = lazy(() => import('./pages/CreateSheet'), {
  fallback: <div>loading...</div>,
});
const Forgot = lazy(() => import('./pages/Forgot'), {
  fallback: <div>loading...</div>,
});

interface userChecker {
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  message: 'CONTINUE' | 'UPDATE_REQUIRED' | 'SERVER_MAINTENANCE';
}

type Props = {
  token: string | null;
  registerProfile: typeof registerProfile;
  registerToken: typeof registerToken;
  removeToken: typeof removeToken;
  registerFCM: typeof registerFCM;
  fetchClasses: Function;
  classIsLoading: boolean;
  currentClass: Class | null;
};

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

    document.title = 'EasyTeach - Delightful teaching for everyone';
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

        const res = await axios.get<userChecker>(checkTokenUrl, {
          timeout: 20000,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.setState({loading: false});

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

  handleRedirect = () => {
    return !this.props.currentClass ? (
      <Redirect to="/classes/home" />
    ) : (
      <Redirect to={`/classes/home/${this.props.currentClass.id}`} />
    );
  };

  handleLoading = () => {
    if (this.state.loading || (this.props.classIsLoading && this.props.token)) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator animating color="blue" size="large" />
        </View>
      );
    } else {
      return (
        <>
          <Route path="/auth">
            {this.props.token ? this.handleRedirect() : <AuthScreen />}
          </Route>
          <Route path="/forgot">
            {this.props.token ? this.handleRedirect() : <Forgot />}
          </Route>
          <PrivateRoute
            Component={Main}
            token={this.props.token}
            path="/classes"
          />
          <PrivateRoute
            Component={JoinClass}
            token={this.props.token}
            path="/joinclass"
          />
          <PrivateRoute
            Component={CreateTest}
            token={this.props.token}
            path="/createtest/:classId"
          />
          <PrivateRoute
            Component={Quiz}
            token={this.props.token}
            path="/quiz/:classId/:quizId"
          />
          <PrivateRoute
            Component={Settings}
            token={this.props.token}
            path="/settings"
          />
          <PrivateRoute
            Component={EditProfile}
            token={this.props.token}
            path="/profile"
          />
          <PrivateRoute
            Component={ShowScore}
            token={this.props.token}
            path="/result/:classId/:quizId"
          />
          <PrivateRoute
            Component={EditQuestions}
            token={this.props.token}
            path="/editque/:classId/:quizId"
          />
          <PrivateRoute
            Component={Files}
            token={this.props.token}
            path="/files/:classId/:moduleId"
          />
          <PrivateRoute
            Component={Info}
            token={this.props.token}
            path="/info/:classId/:moduleId/:videoId"
          />
          <PrivateRoute
            Component={Checkout}
            token={this.props.token}
            path="/checkout/:classId"
          />
          <PrivateRoute
            Component={CreateSheet}
            token={this.props.token}
            path="/createsheet/:classId"
          />
        </>
      );
    }
  };

  render() {
    return (
      <>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          {this.handleLoading()}
        </Switch>

        <Dialog.Container visible={this.state.alertVisible}>
          <Dialog.Title>{this.state.title}</Dialog.Title>
          <Dialog.Description>{this.state.text}</Dialog.Description>
          <Dialog.Button label="Ok" onPress={this.closeDialog} />
        </Dialog.Container>
      </>
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
    classIsLoading: state.classIsLoading,
    currentClass: state.currentClass,
  };
};

export default connect(mapStateToProps, {
  registerToken,
  registerProfile,
  removeToken,
  fetchClasses,
  registerFCM,
})(App);
