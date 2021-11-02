import React, {useState, useEffect} from 'react';
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

const Video: React.FC<Props> = (props) => {
  const [isFullScreen, setFullScreen] = useState<boolean>(false);
  const [start] = useState(new Date());

  useEffect(() => {
    StatusBar.setHidden(true);

    return () => {
      Orientation.unlockAllOrientations();
      StatusBar.setHidden(false);

      axios
        .post(
          `${vidTrackerUrl}/${props.currentClass.id}/${props.route.params.moduleId}/${props.route.params.id}`,
          {
            start: start,
            stop: new Date(),
          },
          {
            headers: {
              Authorization: `Bearer ${props.token}`,
            },
          },
        )
        .catch(() => null);
    };
  });

  const onFullScreenPress = () => {
    if (!isFullScreen) {
      Orientation.lockToLandscape();
    } else {
      Orientation.lockToPortrait();
    }

    setFullScreen((prev) => !prev);
  };

  return (
    <VideoPlayer
      source={{
        uri: props.route.params.url,
        headers: {
          Authorization: `Bearer ${props.token}`,
        },
      }}
      onFullScreenPress={onFullScreenPress}
      style={styles.video}>
      <Text style={styles.title}>{props.route.params.title}</Text>
    </VideoPlayer>
  );
};

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
