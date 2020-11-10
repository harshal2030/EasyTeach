import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Avatar, Text} from 'react-native-elements';
import Entypo from 'react-native-vector-icons/Entypo';
import {commonBackground, commonGrey} from '../../styles/colors';

type Props = {
  avatar: string;
  name: string;
  username: string;
  rightComponent?: JSX.Element | null;
};

const HeadCom = (props: Props) => {
  const {container, info, textContainer, nameText, usernameText} = styles;

  return (
    <View style={container}>
      <View style={info}>
        <Avatar source={{uri: props.avatar}} size="large" rounded />
        <View style={textContainer}>
          <Text style={nameText}>{props.name}</Text>
          <Text style={usernameText}>{'@' + props.username}</Text>
        </View>
      </View>

      {props.rightComponent}
    </View>
  );
};

HeadCom.defaultProps = {
  rightComponent: (
    <Entypo name="chevron-thin-right" size={24} color={commonGrey} />
  ),
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: commonBackground,
    shadowColor: commonGrey,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 10,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '800',
  },
  usernameText: {
    fontSize: 15,
    color: commonGrey,
  },
});

export {HeadCom};
