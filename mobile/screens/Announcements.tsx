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
import SnackBar from 'react-native-snackbar';
import {CompositeNavigationProp} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {StackNavigationProp} from '@react-navigation/stack';
import Share from 'react-native-share';
import * as Analytics from 'expo-firebase-analytics';

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
  classHasErrored: boolean;
  classes: Class[];
  classIsLoading: boolean;
  token: string | null;
  fetchMsgs(token: string, classId: string, endReached?: boolean): void;
  addMsg: typeof addMsg;
  msgs: MsgPayload;
  registerCurrentClass: typeof registerCurrentClass;
  isOwner: boolean;
  navigation: NavigationProp;
  unread: number;
};

interface State {
  message: string;
}

class Home extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      message: '',
    };
  }

  componentDidMount() {
    if (this.props.currentClass) {
      this.props.fetchMsgs(this.props.token!, this.props.currentClass!.id);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const {currentClass} = this.props;

    const prevClassId = prevProps.currentClass
      ? prevProps.currentClass.id
      : null;

    const currentClassId = currentClass ? currentClass.id : null;
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
      .then(() => {
        this.setState({message: ''});
      })
      .catch(() => {
        this.setState({message: ''});
        SnackBar.show({
          text: 'Unable to send message at the moment. Please try again later',
          backgroundColor: flatRed,
          textColor: '#fff',
          duration: SnackBar.LENGTH_LONG,
        });
      });
  };

  shareCode = async () => {
    try {
      await Share.open({
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

  renderListItem = ({item}: {item: Msg}) => {
    return (
      <MsgCard
        avatarUrl={`${mediaUrl}/avatar/${item.user.avatar}`}
        name={item.user.name}
        username={item.user.username}
        message={item.message}
        createdAt={new Date(item.createdAt)}
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

    if (props.classHasErrored) {
      return (
        <View style={ContainerStyles.centerElements}>
          <Text>
            We're having trouble in connecting to service. Please consider
            checking your network or try again
          </Text>
        </View>
      );
    }

    if (props.classIsLoading) {
      return (
        <View style={ContainerStyles.centerElements}>
          <ActivityIndicator color={commonBlue} animating size="large" />
        </View>
      );
    }

    if (props.classes.length === 0) {
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
    classHasErrored: state.classHasErrored,
    classIsLoading: state.classIsLoading,
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
})(Home);
