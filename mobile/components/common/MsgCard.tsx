import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {commonGrey, greyWithAlpha} from '../../styles/colors';
import {getDateAndMonth} from '../../../shared/utils/functions';

import {Avatar} from './Avatar';

interface Props {
  message: string;
  avatarUrl: string;
  name: string;
  username: string;
  createdAt: Date;
}

const MsgCard = (props: Props) => {
  return (
    <View style={styles.parent}>
      <View style={styles.userContainer}>
        <Avatar source={{uri: props.avatarUrl}} />

        <View style={styles.nameTextContainer}>
          <Text style={styles.name}>{props.name}</Text>
          <Text style={{color: commonGrey}}>
            {getDateAndMonth(props.createdAt)}
          </Text>
        </View>
      </View>

      <Text style={styles.msgContainer}>{props.message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  parent: {
    borderWidth: 1,
    borderColor: greyWithAlpha(0.4),
    padding: 4,
    borderRadius: 5,
    margin: 5,
  },
  userContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameTextContainer: {
    marginLeft: 8,
  },
  msgContainer: {
    padding: 10,
  },
  name: {
    fontSize: 19,
    fontWeight: '800',
  },
});

export {MsgCard};
