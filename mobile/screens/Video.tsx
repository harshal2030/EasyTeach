import React from 'react';
import axios from 'axios';
import {StatusBar, Text, StyleSheet} from 'react-native';
import {RouteProp} from '@react-navigation/native';
import {connect} from 'react-redux';
import Orientation from 'react-native-orientation-locker';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {VideoPlayer} from '../components/main';

import {StoreState} from '../../shared/global';
import {Class} from '../../shared/global/actions/classes';

import {RootStackParamList} from '../navigators/types';
import {greyWithAlpha} from '../../shared/styles/colors';
import {vidTrackerUrl} from '../../shared/utils/urls';

type Props = {
  route: RouteProp<RootStackParamList, 'Video'>;
  token: string;
  navigation: NativeStackNavigationProp<RootStackParamList, 'Video'>;
  currentClass: Class;
};

type State = {
  isFullScreen: boolean;
};

class Video extends React.Component<Props, State> {
  start: Date = new Date();

  constructor(props: Props) {
    super(props);

    this.state = {
      isFullScreen: false,
    };
  }

  componentDidMount() {
    StatusBar.setHidden(true);
  }

  componentWillUnmount() {
    Orientation.unlockAllOrientations();
    StatusBar.setHidden(false);

    axios
      .post(
        `${vidTrackerUrl}/${this.props.currentClass.id}/${this.props.route.params.moduleId}/${this.props.route.params.id}`,
        {
          start: this.start,
          stop: new Date(),
        },
        {
          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
        },
      )
      .catch(() => null);
  }

  onFullScreenPress = () => {
    if (!this.state.isFullScreen) {
      Orientation.lockToLandscape();
    } else {
      Orientation.lockToPortrait();
    }

    this.setState({isFullScreen: !this.state.isFullScreen});
  };

  render() {
    return (
      <VideoPlayer
        source={{
          uri: this.props.route.params.url,
          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
        }}
        onFullScreenPress={this.onFullScreenPress}
        style={styles.video}>
        <Text style={styles.title}>{this.props.route.params.title}</Text>
      </VideoPlayer>
    );
  }
}

const styles = StyleSheet.create({
  video: {
    height: '100%',
    width: '100%',
  },
  title: {
    color: '#fff',
    backgroundColor: greyWithAlpha(0.2),
    padding: 10,
    width: '100%',
    fontWeight: '900',
    fontSize: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const mapStateToProps = (state: StoreState) => {
  return {
    token: state.token!,
    currentClass: state.currentClass!,
  };
};

export default connect(mapStateToProps)(Video);
