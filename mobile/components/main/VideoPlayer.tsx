import React, {useState, useRef} from 'react';

import {StyleSheet, View, ViewStyle} from 'react-native';

import Video, {OnProgressData, OnLoadData} from 'react-native-video';

import MediaControls, {PLAYER_STATES} from 'react-native-media-controls';
import {commonBlue} from '../../../shared/styles/colors';

type Props = {
  source: {uri?: string; headers?: {[key: string]: string}} | number;
  onFullScreenPress?: () => void;
  style?: ViewStyle;
  children?: JSX.Element | JSX.Element[];
};

const VideoPlayer = (props: Props) => {
  const videoPlayer = useRef<Video | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [playerState, setPlayerState] = useState(PLAYER_STATES.PLAYING);

  const onSeek = (seek: number) => {
    //Handler for change in seekbar
    videoPlayer.current!.seek(seek);
    setCurrentTime(seek);
  };

  const onPaused = (PlayerState: PLAYER_STATES) => {
    //Handler for Video Pause
    setPaused(!paused);
    setPlayerState(PlayerState);
  };

  const onReplay = () => {
    //Handler for Replay
    videoPlayer.current!.seek(0);
    setPaused(false);
    setPlayerState(PLAYER_STATES.PLAYING);
  };

  const onProgress = (data: OnProgressData) => {
    // Video Player will progress continue even if it ends
    if (!isLoading && playerState !== PLAYER_STATES.ENDED) {
      setCurrentTime(data.currentTime);
    }
  };

  const onLoad = (data: OnLoadData) => {
    setDuration(data.duration);
    setIsLoading(false);
  };

  const onLoadStart = () => setIsLoading(true);

  const onEnd = () => setPlayerState(PLAYER_STATES.ENDED);

  const onSeeking = (CurrentTime: number) => setCurrentTime(CurrentTime);

  return (
    <View style={props.style}>
      <Video
        onEnd={onEnd}
        onLoad={onLoad}
        onLoadStart={onLoadStart}
        onProgress={onProgress}
        onBuffer={(data) => console.log(data)}
        paused={paused}
        bufferConfig={{
          minBufferMs: 15000,
          maxBufferMs: 50000,
          bufferForPlaybackMs: 2500,
          bufferForPlaybackAfterRebufferMs: 5000,
        }}
        resizeMode="contain"
        ref={videoPlayer}
        source={props.source}
        style={[styles.mediaPlayer, props.style]}
        useTextureView={false}
      />
      {/* @ts-ignore */}
      <MediaControls
        duration={duration}
        mainColor={commonBlue}
        isLoading={isLoading}
        onFullScreen={props.onFullScreenPress}
        onPaused={onPaused}
        onReplay={onReplay}
        onSeek={onSeek}
        onSeeking={onSeeking}
        playerState={playerState}
        progress={currentTime}>
        {props.children && (
          <MediaControls.Toolbar>{props.children}</MediaControls.Toolbar>
        )}
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
