import React from 'react';
import {View, StyleSheet, TouchableHighlight} from 'react-native';
import {Text} from 'react-native-elements';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {commonBackground, commonGrey, greyWithAlpha} from '../../styles/colors';

const Card = () => {
  return (
    <TouchableHighlight
      style={styles.main}
      onPress={() => console.log('touchable')}
      underlayColor={greyWithAlpha(0.4)}>
      <View>
        <View style={styles.iconTextContainer}>
          <MaterialIcons name="assignment" size={26} />
          <Text style={styles.titleStyle} numberOfLines={1}>
            This is title
          </Text>
        </View>

        <Text style={styles.timeText} numberOfLines={1}>
          Expires On: 11-11-2020 4:10:00 AM
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
