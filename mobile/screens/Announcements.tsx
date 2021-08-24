import React, {useEffect, useState, useRef} from 'react';
import axios from 'axios';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  ScrollView,
  Linking,
} from 'react-native';
import {Header, Button, Input, Icon} from 'react-native-elements';
import {connect} from 'react-redux';
import SnackBar, {SnackBarOptions} from 'react-native-snackbar';
import {CompositeNavigationProp, useLinkTo} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {StackNavigationProp} from '@react-navigation/stack';
import Share from 'react-native-share';
import * as Analytics from 'expo-firebase-analytics';
import RBSheet from 'react-native-raw-bottom-sheet';

import Megaphone from '../../shared/images/Megaphone.svg';
import MegaText from '../../shared/images/announcement.svg';

import {MsgCard} from '../../shared/components/common';
import {HeaderBadge} from '../../shared/components/common';

import {DrawerParamList, RootStackParamList} from '../navigators/types';
import {StoreState, store} from '../../shared/global';
import {Class, registerCurrentClass} from '../../shared/global/actions/classes';
import {
  fetchMsgs,
  MsgPayload,
  addMsg,
  Msg,
  removeMsg,
} from '../../shared/global/actions/msgs';
import {addUnread} from '../../shared/global/actions/unreads';
import {redirected} from '../../shared/global/actions/token';

import {ContainerStyles} from '../../shared/styles/styles';
import {
  commonBackground,
  commonBlue,
  commonGrey,
  flatRed,
} from '../../shared/styles/colors';
import {mediaUrl, msgUrl} from '../../shared/utils/urls';
import {socket} from '../../shared/socket';

socket.on('message', (data: {type: string; payload: WSMsg}) => {
  // @ts-ignore
  store.dispatch(addUnread(data.payload.classId));
  store.dispatch(addMsg(data.payload, data.payload.classId));
});

socket.on(
  'message:delete',
  (data: {type: string; payload: {classId: string; msgId: string}}) => {
    store.dispatch(removeMsg(data.payload.msgId, data.payload.classId));
  },
);

type NavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DrawerParamList, 'Home'>,
  StackNavigationProp<RootStackParamList>
>;

type WSMsg = Msg & {
  classId: string;
};

type Props = {
  profile: {
    name: string;
    username: string;
    avatar: string;
  };
  currentClass: Class | null;
  classes: {
    classes: Class[];
    loading: boolean;
    errored: boolean;
  };
  token: string | null;
  fetchMsgs(token: string, classId: string, endReached?: boolean): void;
  addMsg: typeof addMsg;
  msgs: MsgPayload;
  registerCurrentClass: typeof registerCurrentClass;
  isOwner: boolean;
  navigation: NavigationProp;
  unread: number;
  linkRedirected: boolean;
  removeMsg: typeof removeMsg;
  redirected: typeof redirected;
};

const Home: React.FC<Props> = (props) => {
  const [message, setMessage] = useState<string>('');
  const [msgToDelete, setMsgToDelete] = useState<{
    author: string;
    msgId: string;
  }>({author: '', msgId: ''});
  const linkTo = useLinkTo();

  const sheet = useRef<RBSheet | null>(null);

  const handleRedirect = () => {
    if (!props.linkRedirected) {
      props.redirected();
      Linking.getInitialURL()
        .then((url) => {
          if (url) {
            linkTo(url.replace('https://easyteach.inddex.co', ''));
          }
        })
        .catch(() => null);
    }
  };

  useEffect(() => {
    handleRedirect();
    if (props.currentClass) {
      props.fetchMsgs(props.token!, props.currentClass!.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.currentClass?.id]);

  const showSnackBar = (opts: SnackBarOptions) => {
    setTimeout(() => {
      SnackBar.show(opts);
    }, 500);
  };

  const removeMessage = async () => {
    const {msgId, author} = msgToDelete;
    sheet.current!.close();

    if (!props.isOwner && author !== props.profile.username) {
      showSnackBar({
        text: 'You cannot delete this message',
        backgroundColor: flatRed,
        textColor: '#fff',
        duration: SnackBar.LENGTH_LONG,
      });
      return;
    }

    try {
      const res = await axios.delete<string>(
        `${msgUrl}/${props.currentClass!.id}/${msgId}`,
        {
          headers: {
            Authorization: `Bearer ${props.token}`,
          },
        },
      );

      props.removeMsg(res.data, props.currentClass!.id);

      showSnackBar({
        text: 'Message deleted',
        duration: SnackBar.LENGTH_LONG,
      });
    } catch (e) {
      showSnackBar({
        text: 'Unable to delete message. Please try again later',
        backgroundColor: flatRed,
        textColor: '#ffff',
        duration: SnackBar.LENGTH_LONG,
      });
    }
  };

  const postMessage = async () => {
    if (message.trim().length === 0) {
      return;
    }

    try {
      await Analytics.logEvent('send_message', {
        username: props.profile.username,
      });
    } catch (e) {
      // do nothing
    }

    axios
      .post<Msg>(
        `${msgUrl}/${props.currentClass!.id}`,
        {
          message,
        },
        {
          headers: {
            Authorization: `Bearer ${props.token}`,
          },
        },
      )
      .then(() => null)
      .catch(() => {
        SnackBar.show({
          text: 'Unable to send message at the moment. Please try again later',
          backgroundColor: flatRed,
          textColor: '#fff',
          duration: SnackBar.LENGTH_LONG,
        });
      });
    setMessage('');
  };

  const shareCode = async () => {
    try {
      Share.open({
        title: 'Join my class on EasyTeach',
        message: `Join my class on EasyTeach, through this code: https://easyteach.inddex.co/joinclass?c=${
          props.currentClass!.joinCode
        }. Download app from https://play.google.com/store/apps/details?id=com.hcodes.easyteach`,
      });

      await Analytics.logEvent('button_press', {
        username: props.profile.username,
        purpose: 'share_join_code',
      });
    } catch (e) {
      // do nothing
    }
  };

  const fetchMsg = () => {
    if (!props.msgs.end) {
      props.fetchMsgs(props.token!, props.currentClass!.id, true);
    }
  };

  const setDeleteMsg = (msgId: string, author: string) => {
    sheet.current!.open();
    setMsgToDelete({author, msgId});
  };

  const renderListItem = ({item}: {item: Msg}) => {
    return (
      <MsgCard
        msgId={item.id}
        avatarUrl={`${mediaUrl}/avatar/${item.user.avatar}`}
        name={item.user.name}
        username={item.user.username}
        message={item.message}
        createdAt={new Date(item.createdAt)}
        onOptionPress={setDeleteMsg}
      />
    );
  };

  const renderListFooter = () => {
    if (props.msgs.loading) {
      return (
        <View
          style={{
            height: 100,
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
          }}>
          <ActivityIndicator color={commonBlue} size="large" animating />
        </View>
      );
    }
  };

  const renderContent = () => {
    if (props.classes.errored) {
      return (
        <View style={ContainerStyles.centerElements}>
          <Text>
            We're having trouble in connecting to service. Please consider
            checking your network or try again
          </Text>
        </View>
      );
    }

    if (props.classes.loading) {
      return (
        <View style={ContainerStyles.centerElements}>
          <ActivityIndicator color={commonBlue} animating size="large" />
        </View>
      );
    }

    if (props.classes.classes.length === 0) {
      return (
        <View style={ContainerStyles.centerElements}>
          <Text style={ContainerStyles.padder}>
            Looks like it's your first time. Begin with Joining or Creating a
            class
          </Text>
          <Button
            title="Create or Join class"
            onPress={() => props.navigation.navigate('JoinClass')}
          />
        </View>
      );
    }

    if (props.msgs.errored) {
      return (
        <View style={ContainerStyles.centerElements}>
          <Text>
            We're having trouble in fetching Announcements for you. Please try
            again later
          </Text>
        </View>
      );
    }

    if (props.msgs.msgs.length === 0 && !props.msgs.loading) {
      return (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Megaphone height={200} width={200} />
          <MegaText height={50} width={200} />
          <Text style={{padding: 5}}>
            Open drawer by swiping or click on menu icon in header to navigate.
          </Text>
          {props.isOwner && (
            <Button
              title="Share Join Code"
              type="clear"
              icon={{name: 'share', color: commonBlue}}
              titleStyle={{color: commonBlue}}
              onPress={shareCode}
            />
          )}
        </ScrollView>
      );
    }

    return (
      <FlatList
        data={props.msgs.msgs}
        keyExtractor={(_item, i) => i.toString()}
        inverted
        renderItem={renderListItem}
        ListFooterComponent={renderListFooter()}
        onEndReached={fetchMsg}
        onEndReachedThreshold={0.3}
      />
    );
  };

  const renderComposer = () => {
    if (!props.currentClass) {
      return (
        <View
          style={{
            backgroundColor: commonBackground,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 10,
          }}>
          <Text style={{color: commonGrey}}>
            Join or create class to message
          </Text>
        </View>
      );
    }

    if (props.currentClass.lockMsg) {
      <View
        style={{
          backgroundColor: commonBackground,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 10,
        }}>
        <Text style={{color: commonGrey}}>Read Only</Text>
      </View>;
    }

    return (
      <Input
        placeholder="Type here..."
        value={message}
        errorStyle={{height: 0}}
        returnKeyType="send"
        onSubmitEditing={postMessage}
        onChangeText={setMessage}
        rightIcon={{
          name: 'send',
          color: commonBlue,
          onPress: postMessage,
        }}
      />
    );
  };

  const {unread} = props;
  return (
    <View style={[ContainerStyles.parent, {backgroundColor: '#fff'}]}>
      <Header
        centerComponent={{
          text: props.currentClass ? props.currentClass!.name : 'Home',
          style: {fontSize: 24, color: '#fff', fontWeight: '600'},
        }}
        leftComponent={
          <>
            <Icon
              name="menu"
              size={26}
              onPress={props.navigation.openDrawer}
              color="#ffff"
            />
            {unread !== 0 ? <HeaderBadge /> : null}
          </>
        }
      />
      <View
        style={{
          flex: 1,
        }}>
        {renderContent()}

        {renderComposer()}
      </View>

      <RBSheet
        height={80}
        ref={sheet}
        closeOnPressMask
        closeOnDragDown
        customStyles={{
          container: {
            borderTopWidth: 1,
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            borderColor: 'transparent',
          },
        }}>
        <Button
          title="Delete"
          type="clear"
          onPress={removeMessage}
          titleStyle={{color: flatRed, fontSize: 20}}
          icon={{name: 'delete', color: flatRed}}
        />
      </RBSheet>
    </View>
  );
};

const mapStateToProps = (state: StoreState) => {
  let isOwner = false;
  if (state.currentClass) {
    isOwner = state.currentClass.owner.username === state.profile.username;
  }
  return {
    profile: state.profile,
    currentClass: state.currentClass,
    classes: state.classes,
    token: state.token,
    linkRedirected: state.redirected,
    msgs: state.msgs[state.currentClass?.id || 'test'] || {
      loading: true,
      errored: false,
      end: false,
      msgs: [],
    },
    isOwner,
    unread: state.unreads.totalUnread,
  };
};

export default connect(mapStateToProps, {
  fetchMsgs,
  addMsg,
  registerCurrentClass,
  removeMsg,
  redirected,
})(Home);
