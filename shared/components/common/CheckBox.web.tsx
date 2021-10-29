import React from 'react';
import {StyleSheet} from 'react-native';
import {CheckBox as CheckBoxCom, Text} from 'react-native-elements';
import {InlineIcon} from '@iconify/react';
import CheckedSquareO from '@iconify-icons/fa/check-square-o';
import SqaureO from '@iconify-icons/fa/square-o';

import {TextStyles} from '../../styles/styles';
import {commonBackground, commonGrey} from '../../styles/colors';

const CheckBox = (props: {
  checked: boolean;
  title: string;
  desc?: string;
  onPress?(): void;
}) => {
  return (
    <>
      <CheckBoxCom
        checked={props.checked}
        title={props.title}
        textStyle={styles.checkBoxText}
        onPress={props.onPress}
        iconRight
        uncheckedIcon={<InlineIcon icon={SqaureO} />}
        checkedIcon={<InlineIcon icon={CheckedSquareO} />}
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
