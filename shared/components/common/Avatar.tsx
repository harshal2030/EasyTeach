import React from 'react';
import {StyleSheet} from 'react-native';
import FastImage, {Source, ImageStyle} from 'react-native-fast-image';

interface Props {
  source: Source;
  style?: ImageStyle;
}

const Avatar = (props: Props) => {
  return (
    <FastImage
      source={props.source}
      style={[styles.avatarStyle, props.style]}
    />
  );
};

const styles = StyleSheet.create({
  avatarStyle: {
    height: 50,
    width: 50,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 25,
  },
});

export {Avatar};
