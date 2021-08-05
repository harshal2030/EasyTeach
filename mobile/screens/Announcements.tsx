import React from 'react';
import axios from 'axios';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  ScrollView,
} from 'react-native';
import {Header, Button, Input, Icon} from 'react-native-elements';
import {connect} from 'react-redux';
import SnackBar, {SnackBarOptions} from 'react-native-snackbar';
import {CompositeNavigationProp} from '@react-navigation/native';
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
  removeMsg: typeof removeMsg;
};

interface State {
  message: string;
  msgDelete: {
    author: string;
    msgId: string;
  };
}

class Home extends React.Component<Props, State> {
  sheet: RBSheet | null = null;
  constructor(props: Props) {
    super(props);

    this.state = {
      message: '',
      msgDelete: {
        author: '',
        msgId: '',
      },
    };
  }

  componentDidMount() {
    if (this.props.currentClass) {
      this.props.fetchMsgs(this.props.token!, this.props.currentClass!.id);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const {currentClass} = this.props;

    const prevClassId = prevProps.currentClass?.id;

    const currentClassId = currentClass?.id;
    if (currentClass) {
      if (currentClassId !== prevClassId) {
        this.props.fetchMsgs(this.props.token!, this.props.currentClass!.id);
      }
    }
  }

  postMessage = async () => {
    if (this.state.message.trim().length === 0) {
      return;
    }

    try {
      await Analytics.logEvent('send_message', {
        username: this.props.profile.username,
      });
    } catch (e) {
      // do nothing
    }

    axios
      .post<Msg>(
        `${msgUrl}/${this.props.currentClass!.id}`,
        {
          message: this.state.message,
        },
        {
          headers: {
            Authorization: `Bearer ${this.props.token}`,
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
    this.setState({message: ''});
  };

  shareCode = async () => {
    try {
      Share.open({
        title: 'Join my class on EasyTeach',
        message: `Join my class on EasyTeach, through this code: https://easyteach.inddex.co/joinclass?c=${
          this.props.currentClass!.joinCode
        }. Download app from https://play.google.com/store/apps/details?id=com.hcodes.easyteach`,
      });

      await Analytics.logEvent('button_press', {
        username: this.props.profile.username,
        purpose: 'share_join_code',
      });
    } catch (e) {
      // do nothing
    }
  };

  fetchMsg = () => {
    if (!this.props.msgs.end) {
      this.props.fetchMsgs(
        this.props.token!,
        this.props.currentClass!.id,
        true,
      );
    }
  };

  showSnackBar = (opts: SnackBarOptions) => {
    setTimeout(() => {
      SnackBar.show(opts);
    }, 500);
  };

  removeMessage = async () => {
    const {msgId, author} = this.state.msgDelete;
    this.sheet!.close();

    if (!this.props.isOwner && author !== this.props.profile.username) {
      this.showSnackBar({
        text: 'You cannot delete this message',
        backgroundColor: flatRed,
        textColor: '#fff',
        duration: SnackBar.LENGTH_LONG,
      });
      return;
    }

    try {
      const res = await axios.delete<string>(
        `${msgUrl}/${this.props.currentClass!.id}/${msgId}`,
        {
          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
        },
      );

      this.props.removeMsg(res.data, this.props.currentClass!.id);

      this.showSnackBar({
        text: 'Message deleted',
        duration: SnackBar.LENGTH_LONG,
      });
    } catch (e) {
      this.showSnackBar({
        text: 'Unable to delete message. Please try again later',
        backgroundColor: flatRed,
        textColor: '#ffff',
        duration: SnackBar.LENGTH_LONG,
      });
    }
  };

  setDeleteMsg = (msgId: string, author: string) => {
    this.sheet!.open();
    this.setState({msgDelete: {msgId, author}});
  };

  renderListItem = ({item}: {item: Msg}) => {
    return (
      <MsgCard
        msgId={item.id}
        avatarUrl={`${mediaUrl}/avatar/${item.user.avatar}`}
        name={item.user.name}
        username={item.user.username}
        message={item.message}
        createdAt={new Date(item.createdAt)}
        onOptionPress={this.setDeleteMsg}
      />
    );
  };

  renderListFooter = () => {
    if (this.props.msgs.loading) {
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

  renderContent = () => {
    const {props} = this;

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
            onPress={() => this.props.navigation.navigate('JoinClass')}
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
          {this.props.isOwner && (
            <Button
              title="Share Join Code"
              type="clear"
              icon={{name: 'share', color: commonBlue}}
              titleStyle={{color: commonBlue}}
              onPress={this.shareCode}
            />
          )}
        </ScrollView>
      );
    }

    return (
      <FlatList
        data={this.props.msgs.msgs}
        keyExtractor={(_item, i) => i.toString()}
        inverted
        renderItem={this.renderListItem}
        ListFooterComponent={this.renderListFooter()}
        onEndReached={this.fetchMsg}
        onEndReachedThreshold={0.3}
      />
    );
  };

  render() {
    const {unread} = this.props;
    return (
      <View style={[ContainerStyles.parent, {backgroundColor: '#fff'}]}>
        <Header
          centerComponent={{
            text: this.props.currentClass
              ? this.props.currentClass!.name
              : 'Home',
            style: {fontSize: 24, color: '#fff', fontWeight: '600'},
          }}
          leftComponent={
            <>
              <Icon
                name="menu"
                size={26}
                onPress={this.props.navigation.openDrawer}
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
          {this.renderContent()}

          {this.props.isOwner || !this.props.currentClass?.lockMsg ? (
            <Input
              placeholder="Type here..."
              value={this.state.message}
              errorStyle={{height: 0}}
              returnKeyType="send"
              onSubmitEditing={this.postMessage}
              onChangeText={(message) => this.setState({message})}
              rightIcon={{
                name: 'send',
                color: commonBlue,
                onPress: this.postMessage,
              }}
            />
          ) : (
            <View
              style={{
                backgroundColor: commonBackground,
                justifyContent: 'center',
                alignItems: 'center',
                padding: 10,
              }}>
              <Text style={{color: commonGrey}}>Read Only</Text>
            </View>
          )}
        </View>

        <RBSheet
          height={80}
          ref={(ref) => (this.sheet = ref)}
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
            onPress={this.removeMessage}
            titleStyle={{color: flatRed, fontSize: 20}}
            icon={{name: 'delete', color: flatRed}}
          />
        </RBSheet>
      </View>
    );
  }
}

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
})(Home);
