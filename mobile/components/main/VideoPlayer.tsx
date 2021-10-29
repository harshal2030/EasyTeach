import React, {useState, useRef} from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';
import Video, {OnProgressData, OnLoadData} from 'react-native-video';

import {PLAYER_STATES} from '../../../shared/utils/constants';
import {MediaControls} from './MediaConrols';

type Props = {
  source: {uri?: string; headers?: {[key: string]: string}} | number;
  onFullScreenPress?: () => void;
  style?: ViewStyle;
  children?: JSX.Element;
};

const VideoPlayer = (props: Props) => {
  const videoPlayer = useRef<Video | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [playerState, setPlayerState] = useState(PLAYER_STATES.PLAYING);
  const [changeProgress, setChangeProgress] = useState(true);

  const onSeek = (seek: number) => {
    //Handler for change in seekbar
    videoPlayer.current!.seek(seek);
    setCurrentTime(seek);
    setChangeProgress(true);
  };

  const onPaused = () => {
    //Handler for Video Pause
    setPaused(!paused);
    setPlayerState(paused ? PLAYER_STATES.PLAYING : PLAYER_STATES.PAUSED);
  };

  const onReplay = () => {
    //Handler for Replay
    videoPlayer.current!.seek(0);
    setCurrentTime(0);
    setPaused(false);
    setPlayerState(PLAYER_STATES.PAUSED);
  };

  const onProgress = (data: OnProgressData) => {
    // Video Player will progress continue even if it ends
    if (!isLoading && playerState !== 2 && changeProgress) {
      setCurrentTime(data.currentTime);
    }
  };

  const onLoad = (data: OnLoadData) => {
    setDuration(data.duration);
    setIsLoading(false);
  };

  const onLoadStart = () => setIsLoading(true);

  const onEnd = () => setPlayerState(PLAYER_STATES.ENDED);

  const onSeeking = (CurrentTime: number) => {
    setChangeProgress(false);
    setCurrentTime(CurrentTime);
  };

  return (
    <View style={props.style}>
      <Video
        onEnd={onEnd}
        onLoad={onLoad}
        onLoadStart={onLoadStart}
        onProgress={onProgress}
        paused={paused}
        resizeMode="contain"
        ref={videoPlayer}
        source={props.source}
        style={[styles.mediaPlayer, props.style]}
        useTextureView={false}
      />
      <MediaControls
        progress={currentTime}
        duration={duration}
        playerState={playerState}
        onSeeking={onSeeking}
        isLoading={isLoading}
        onReplay={onReplay}
        onPause={onPaused}
        onSeekReleased={onSeek}
        onFullScreen={props.onFullScreenPress}>
        {props.children}
      </MediaControls>
    </View>
  );
};

const styles = StyleSheet.create({
  mediaPlayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'black',
    justifyContent: 'center',
  },
});

export {VideoPlayer};
