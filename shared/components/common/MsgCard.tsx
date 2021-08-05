import React, {memo} from 'react';
import {View, StyleSheet, Text, TouchableNativeFeedback} from 'react-native';
import {Button} from 'react-native-elements';
import {commonGrey, greyWithAlpha} from '../../styles/colors';
import {getDateAndMonth} from '../../utils/functions';

import {Avatar} from './Avatar';

interface Props {
  message: string;
  avatarUrl: string;
  name: string;
  username: string;
  createdAt: Date;
  msgId: string;
  onOptionPress: (msgId: string, username: string) => void;
}

const _MsgCard: React.FC<Props> = (props) => {
  return (
    <View style={styles.parent}>
      <View style={styles.topContainer}>
        <View style={styles.userContainer}>
          <Avatar source={{uri: props.avatarUrl}} />

          <View style={styles.nameTextContainer}>
            <Text style={styles.name}>{props.name}</Text>
            <Text style={{color: commonGrey}}>
              {getDateAndMonth(props.createdAt)}
            </Text>
          </View>
        </View>

        <Button
          icon={{name: 'dots-vertical', type: 'material-community'}}
          type="clear"
          onPress={() => props.onOptionPress(props.msgId, props.username)}
          containerStyle={{padding: 2}}
          buttonStyle={{padding: 2}}
          background={TouchableNativeFeedback.Ripple(greyWithAlpha(0.3), true)}
        />
      </View>

      <Text style={styles.msgContainer}>{props.message}</Text>
    </View>
  );
};

const MsgCard = memo(_MsgCard, () => false);

const styles = StyleSheet.create({
  parent: {
    borderWidth: 1,
    borderColor: greyWithAlpha(0.4),
    padding: 4,
    borderRadius: 5,
    margin: 5,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
