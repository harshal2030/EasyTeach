import React from 'react';
import {Text, StyleSheet, TextStyle} from 'react-native';

interface Prop {
  text: string;
  clickableText: string;
  onPress?: () => any;
  clickableTextStyle?: TextStyle;
  containerTextStyle?: TextStyle;
  disabled: boolean;
}

const TextLink = (props: Prop): JSX.Element => {
  return (
    <Text style={props.containerTextStyle || styles.containerTextStyle}>
      <Text>{props.text}</Text>
      <Text
        onPress={props.disabled ? () => null : props.onPress}
        style={props.clickableTextStyle || styles.clickableTextStyle}>
        {props.clickableText}
      </Text>
    </Text>
  );
};

const styles = StyleSheet.create({
  clickableTextStyle: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    color: 'blue',
  },
  containerTextStyle: {
    fontSize: 18,
  },
});

export {TextLink};
