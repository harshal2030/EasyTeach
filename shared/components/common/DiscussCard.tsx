import React, {memo} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {Text} from 'react-native-elements';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';

import {eucalyptusGreen, greyWithAlpha} from '../../styles/colors';
import {getDateAndMonth} from '../../utils/functions';

type Props = {
  title: string;
  comments: string;
  id: string;
  author: string;
  createdAt: string;
  onPress: (id: string) => void;
};

const _DiscussCard: React.FC<Props> = (props) => {
  const createdOn = new Date(props.createdAt);

  return (
    <TouchableOpacity
      style={styles.root}
      onPress={() => props.onPress(props.id)}>
      <View style={styles.titleContainer}>
        <View style={styles.ITContainer}>
          <MCI name="circle-slice-8" color={eucalyptusGreen} size={18} />
          <Text h4 style={styles.title}>
            {props.title}
          </Text>
        </View>

        <View style={styles.commentContainer}>
          <MaterialIcons name="chat" size={18} />
          <Text style={styles.comment}>{props.comments}</Text>
        </View>
      </View>

      <Text style={styles.meta}>
        Started on {getDateAndMonth(createdOn)} by {props.author}
      </Text>
    </TouchableOpacity>
  );
};

export const DiscussCard = memo(_DiscussCard, () => false);

const styles = StyleSheet.create({
  root: {
    padding: 10,
    paddingVertical: 15,
    borderWidth: 1,
    borderRightWidth: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: greyWithAlpha(0.5),
    backgroundColor: '#fff',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '15%',
  },
  ITContainer: {
    // IconTitleContainer
    flexDirection: 'row',
    alignItems: 'center',
    width: '85%',
  },
  title: {
    marginLeft: 5,
    flexWrap: 'wrap',
  },
  meta: {
    marginLeft: 25,
  },
  comment: {
    fontSize: 17,
  },
});
