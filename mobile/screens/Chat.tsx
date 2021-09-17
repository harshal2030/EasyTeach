import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {View, FlatList, StyleSheet, TextInput} from 'react-native';
import {Header, Text} from 'react-native-elements';
import {connect} from 'react-redux';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';

import {Avatar} from '../../shared/components/common';

import {StoreState} from '../../shared/global';
import {Class} from '../../shared/global/actions/classes';

import {RootStackParamList} from '../navigators/types';
import {discussUrl, mediaUrl, msgUrl} from '../../shared/utils/urls';
import {ContainerStyles} from '../../shared/styles/styles';
import {
  commonGrey,
  eucalyptusGreen,
  greenWithAlpha,
  greyWithAlpha,
} from '../../shared/styles/colors';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Chat'>;
  currentClass: Class;
  token: string;
  route: RouteProp<RootStackParamList, 'Chat'>;
};

type DiscussRes = {
  id: string;
  title: string;
  createdAt: string;
  user: {
    avatar: string;
    name: string;
    username: string;
  };
  comments: string;
};

type MsgRes = {
  id: string;
  message: string;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  createdAt: string;
};

const Chat: React.FC<Props> = (props) => {
  const [discuss, setDiscuss] = useState<DiscussRes | null>(null);
  const [msgs, setMsgs] = useState<MsgRes[]>([]);

  useEffect(() => {
    axios
      .get<MsgRes[]>(
        `${msgUrl}/${props.currentClass.id}/${props.route.params.discussId}`,
        {
          headers: {
            Authorization: `Bearer ${props.token}`,
          },
        },
      )
      .then((res) => setMsgs(res.data))
      .catch((e) => console.log(e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.currentClass.id, props.route.params.discussId]);

  useEffect(() => {
    axios
      .get(
        `${discussUrl}/${props.currentClass.id}/${props.route.params.discussId}`,
        {
          headers: {
            Authorization: `Bearer ${props.token}`,
          },
        },
      )
      .then((res) => setDiscuss(res.data))
      .catch((e) => console.log(e));
  }, [props.currentClass.id, props.route.params.discussId, props.token]);

  const renderItem = ({item}: {item: MsgRes}) => {
    return (
      <View style={[styles.headerContainer, {marginVertical: 5}]}>
        <View style={styles.avatarContainer}>
          <Avatar
            source={{uri: `${mediaUrl}/avatar/${item.user.avatar}`}}
            style={styles.msgAvatar}
          />
          <Text style={styles.msgName}>{item.user.username}</Text>
        </View>
        <Text style={styles.msgText}>{item.message}</Text>
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View style={[styles.headerContainer, {marginBottom: 10}]}>
        <View style={styles.avatarContainer}>
          <Avatar
            source={{uri: `${mediaUrl}/avatar/${discuss?.user.avatar}`}}
            style={styles.avatar}
          />
          <Text>{discuss?.user.name}</Text>
        </View>
        {discuss ? <Text h2>{discuss.title}</Text> : null}
        <View style={styles.indicatorContainer}>
          <MCI name="circle-slice-8" color={eucalyptusGreen} size={18} />
          <Text style={{color: eucalyptusGreen}}>Open</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[ContainerStyles.parent]}>
      <Header
        centerComponent={{
          text: '',
          style: {fontSize: 24, color: '#ffff', fontWeight: '600'},
        }}
        leftComponent={{
          icon: 'arrow-back',
          color: '#ffff',
          size: 26,
          onPress: props.navigation.goBack,
        }}
      />
      <FlatList
        data={msgs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader()}
        ListFooterComponent={<View style={{height: 100}} />}
      />

      <View
        style={{
          backgroundColor: '#ffff',
          padding: 2,
          borderTopColor: greyWithAlpha(0.5),
          borderTopWidth: 1,
        }}>
        <TextInput placeholder="Type here..." multiline />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sheetHeader: {
    backgroundColor: '#ffffff',
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderStartColor: commonGrey,
    width: '100%',
    borderTopColor: commonGrey,
  },
  headerHandle: {
    height: 10,
    width: 30,
    borderRadius: 5,
    backgroundColor: commonGrey,
    borderColor: 'transparent',
    borderWidth: 1,
  },
  headerContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: greyWithAlpha(0.4),
  },
  indicatorContainer: {
    backgroundColor: greenWithAlpha(0.2),
    padding: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: greyWithAlpha(0.3),
    borderRadius: 5,
    width: 70,
  },
  avatar: {
    height: 30,
    width: 30,
    backgroundColor: commonGrey,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 15,
  },
  msgAvatar: {
    height: 40,
    width: 40,
    backgroundColor: commonGrey,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 20,
  },
  msgName: {
    marginLeft: 5,
    fontSize: 17,
    fontWeight: '700',
  },
  msgText: {
    marginLeft: 8,
    marginTop: 10,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

const mapStateToProps = (state: StoreState) => {
  return {
    currentClass: state.currentClass!,
    token: state.token!,
  };
};

export default connect(mapStateToProps)(Chat);
