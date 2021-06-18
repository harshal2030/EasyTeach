import React from 'react';
import {View, StyleSheet, ViewStyle, TouchableOpacity} from 'react-native';
import {Text} from 'react-native-elements';
import Gear from '../../images/gear.svg';
import Assignment from '../../images/assignment.svg';

import {commonBackground, commonGrey, greyWithAlpha} from '../../styles/colors';
import {formatDate} from '../../utils/functions';

type Props = {
  title: string;
  onPress?(): any;
  containerStyle?: ViewStyle;
  expiresOn: Date;
  onGearPress?(): void;
  isOwner: boolean;
};

const Card = (props: Props) => {
  return (
    <View style={[styles.main, props.containerStyle]}>
      <TouchableOpacity onPress={props.onPress}>
        <View style={styles.contentContainer}>
          <View>
            <View style={styles.iconTextContainer}>
              <Assignment />
              <Text style={styles.titleStyle}>{props.title}</Text>
            </View>

            <Text style={styles.timeText}>
              Expires On: {formatDate(props.expiresOn)}
            </Text>
          </View>

          {props.isOwner && (
            <TouchableOpacity onPress={props.onGearPress}>
              <Gear height={23} width={23} color="#0000" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </View>
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
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
