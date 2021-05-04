import React from 'react';
import {StatusBar, Text, StyleSheet} from 'react-native';
import {RouteProp} from '@react-navigation/native';
import {connect} from 'react-redux';
import Orientation from 'react-native-orientation-locker';
import {StackNavigationProp} from '@react-navigation/stack';

import {VideoPlayer} from '../components/main';

import {StoreState} from '../../shared/global';
import {RootStackParamList} from '../navigators/types';
import {greyWithAlpha} from '../../shared/styles/colors';

type Props = {
  route: RouteProp<RootStackParamList, 'Video'>;
  token: string;
  navigation: StackNavigationProp<RootStackParamList, 'Video'>;
};

class Video extends React.Component<Props> {
  componentDidMount() {
    Orientation.lockToLandscape();
    StatusBar.setHidden(true);
  }

  componentWillUnmount() {
    Orientation.unlockAllOrientations();
    StatusBar.setHidden(false);
  }

  render() {
    return (
      <VideoPlayer
        source={{
          uri: this.props.route.params.url,
          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
        }}
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
  };
};

export default connect(mapStateToProps)(Video);
