import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {greyWithAlpha} from '../../styles/colors';
import Entypo from 'react-native-vector-icons/Entypo';

interface Props {
  text: string;
  onCrossPress: () => any;
}

const Chip = (props: Props) => {
  return (
    <View style={styles.container}>
      <Text style={{alignSelf: 'center'}} numberOfLines={1}>
        {props.text}
      </Text>
      <Entypo name="circle-with-cross" size={18} onPress={props.onCrossPress} />
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
