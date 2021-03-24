import React from 'react';
import {StyleSheet} from 'react-native';
import {CheckBox as CheckBoxCom, Text} from 'react-native-elements';

import {TextStyles} from '../../../shared/styles/styles';
import {commonBackground, commonGrey} from '../../../shared/styles/colors';

const CheckBox = (props: {
  checked: boolean;
  title: string;
  desc?: string;
  onPress?(): any;
}) => {
  return (
    <>
      <CheckBoxCom
        checked={props.checked}
        title={props.title}
        textStyle={styles.checkBoxText}
        onPress={props.onPress}
        iconRight
        containerStyle={styles.checkBoxContainer}
      />
      <Text style={styles.checkBoxDesc}>{props.desc}</Text>
    </>
  );
};

const styles = StyleSheet.create({
  checkBoxText: {
    ...TextStyles.h4Style,
    marginLeft: 0,
  },
  checkBoxContainer: {
    backgroundColor: commonBackground,
    padding: 0,
    marginLeft: 0,
  },
  checkBoxDesc: {
    color: commonGrey,
    marginLeft: 5,
    fontSize: 12,
  },
});

export {CheckBox};
