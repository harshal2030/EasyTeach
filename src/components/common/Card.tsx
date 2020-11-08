import React from 'react';
import {View, StyleSheet, TouchableHighlight, ViewStyle} from 'react-native';
import {Text} from 'react-native-elements';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {commonBackground, commonGrey, greyWithAlpha} from '../../styles/colors';
import {formatDate} from '../../utils/functions';

type Props = {
  title: string;
  onPress?(): any;
  containerStyle?: ViewStyle;
  expiredOn: Date;
};

const Card = (props: Props) => {
  return (
    <TouchableHighlight
      style={[styles.main, props.containerStyle]}
      onPress={props.onPress}
      underlayColor={greyWithAlpha(0.4)}>
      <View>
        <View style={styles.iconTextContainer}>
          <MaterialIcons name="assignment" size={26} />
          <Text style={styles.titleStyle} numberOfLines={1}>
            {props.title}
          </Text>
        </View>

        <Text style={styles.timeText} numberOfLines={1}>
          Expires On: {formatDate(props.expiredOn)}
        </Text>
      </View>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  main: {
    borderWidth: 1,
    borderColor: greyWithAlpha(0.5),
    borderRadius: 5,
    padding: 10,
    backgroundColor: commonBackground,
    marginVertical: 5,
  },
  iconTextContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  titleStyle: {
    fontSize: 20,
    marginLeft: 10,
    fontWeight: '100',
  },
  timeText: {
    marginLeft: 36,
    color: commonGrey,
  },
});

export {Card};
