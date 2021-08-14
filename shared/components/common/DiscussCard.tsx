import React, {memo} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {Text} from 'react-native-elements';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {greyWithAlpha} from '../../styles/colors';
import {getDateAndMonth} from '../../utils/functions';

type Props = {
  title: string;
  comments: number;
  author: string;
  createdAt: string;
  onPress: () => void;
};

const _DiscussCard: React.FC<Props> = (props) => {
  const createdOn = new Date(props.createdAt);

  return (
    <TouchableOpacity style={styles.root} onPress={props.onPress}>
      <View style={styles.titleContainer}>
        <Text h4>{props.title}</Text>

        <View style={styles.commentContainer}>
          <MaterialIcons name="chat" size={18} />
          <Text style={{fontSize: 17}}>{props.comments}</Text>
        </View>
      </View>

      <Text>
        Created on {getDateAndMonth(createdOn)} by {props.author}
      </Text>
    </TouchableOpacity>
  );
};

export const DiscussCard = memo(_DiscussCard, () => false);

const styles = StyleSheet.create({
  root: {
    padding: 10,
    margin: 5,
    borderWidth: 1,
    borderRightWidth: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: greyWithAlpha(0.5),
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
