import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {greyWithAlpha} from '../../styles/colors';

interface Props {
  text: string;
  rightIcon?: JSX.Element;
}

const Chip = (props: Props) => {
  return (
    <View style={styles.container}>
      <Text style={{alignSelf: 'center'}} numberOfLines={1}>
        {props.text}
      </Text>
      {props.rightIcon}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    paddingRight: 24,
    backgroundColor: greyWithAlpha(0.3),
    width: 150,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export {Chip};
