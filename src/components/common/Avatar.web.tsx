import React from 'react';
import {StyleSheet, Image, ImageSourcePropType, ImageStyle} from 'react-native';

interface Props {
  source: ImageSourcePropType;
  style?: ImageStyle;
}

const Avatar = (props: Props) => {
  return (
    <Image source={props.source} style={[styles.avatarStyle, props.style]} />
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
