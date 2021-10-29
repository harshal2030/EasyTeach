import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import RNSlider from '@react-native-community/slider';

import {humanizeVideoDuration} from '../../../shared/utils/functions';
import {commonBlue} from '../../../shared/styles/colors';
import {PLAYER_STATES} from '../../../shared/utils/constants';

interface Props {
  duration: number;
  progress: number;
  onSeeking: (val: number) => void;
  onSeekReleased: (val: number) => void;
  onFullScreen?: () => void;
  isLoading: boolean;
  playerState: PLAYER_STATES;
  onReplay: () => void;
  onPause: () => void;
  children?: JSX.Element;
}

const getIconFromState = (state: PLAYER_STATES) => {
  switch (state) {
    case PLAYER_STATES.PAUSED:
      return require('../../../shared/images/icons/ic_play.png');
    case PLAYER_STATES.PLAYING:
      return require('../../../shared/images/icons/ic_pause.png');
    case PLAYER_STATES.ENDED:
      return require('../../../shared/images/icons/ic_replay.png');
    default:
      return null;
  }
};

const MediaControls = (props: Props) => {
  const [showControls, setShowControls] = React.useState(true);
  const [opacity] = React.useState(new Animated.Value(1));

  const fadeOutControls = (delay = 0) => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
      delay,
    }).start((result) => {
      if (result.finished) {
        setShowControls(false);
      }
    });
  };

  const fadeInControls = (loop = true) => {
    setShowControls(true);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      delay: 0,
      useNativeDriver: true,
    }).start(() => {
      if (loop) {
        fadeOutControls(5000);
      }
    });
  };

  const {
    progress,
    duration,
    onSeeking,
    onSeekReleased,
    onFullScreen,
    playerState,
    isLoading,
    onReplay,
    onPause,
    children,
  } = props;
  const iconImage = getIconFromState(playerState);
  const pressAction = playerState === PLAYER_STATES.ENDED ? onReplay : onPause;

  const toggleControls = () => {
    if (showControls) {
      fadeOutControls();
    } else {
      fadeInControls();
    }
  };

  const renderControls = () => {
    if (showControls) {
      return (
        <Animated.View style={[styles.root, {opacity}]}>
          {children ? children : <View />}

          {isLoading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <TouchableOpacity style={styles.playButton} onPress={pressAction}>
              <Image source={iconImage} style={styles.playIcon} />
            </TouchableOpacity>
          )}

          <View style={styles.bottomContainer}>
            <Text style={styles.textColor}>
              {humanizeVideoDuration(Math.floor(progress))}
            </Text>
            <RNSlider
              style={styles.seek}
              onSlidingComplete={onSeekReleased}
              onValueChange={onSeeking}
              maximumValue={Math.floor(duration)}
              value={Math.floor(progress)}
              minimumTrackTintColor={commonBlue}
              thumbTintColor={commonBlue}
              maximumTrackTintColor="#fff"
            />
            <Text style={styles.textColor}>
              {humanizeVideoDuration(Math.floor(duration))}
            </Text>
            {onFullScreen && (
              <TouchableOpacity
                style={styles.fullScreenContainer}
                onPress={onFullScreen}>
                <Image
                  source={require('../../../shared/images/icons/ic_fullscreen.png')}
                />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      );
    }

    return <View style={{flex: 1}} />;
  };

  return (
    <TouchableWithoutFeedback onPress={toggleControls}>
      {renderControls()}
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 59, 62, 0.4)',
  },
  textColor: {
    color: '#ffff',
  },
  bottomContainer: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
  },
  seek: {
    alignSelf: 'stretch',
    flex: 1,
  },
  fullScreenContainer: {
    paddingLeft: 10,
  },
  playButton: {
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 3,
    borderWidth: 1.5,
    height: 50,
    justifyContent: 'center',
    width: 50,
    backgroundColor: commonBlue,
  },
  playIcon: {
    height: 22,
    resizeMode: 'contain',
    width: 22,
  },
  toolbarContainer: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
});

export {MediaControls};
