import React from 'react';
import axios from 'axios';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  ScrollView,
} from 'react-native';
import {Header, Button, Input} from 'react-native-elements';
import {connect} from 'react-redux';
import Share from 'react-native-share';

import {MsgCard} from '../components/common';
import Megaphone from '../images/Megaphone.svg';
import MegaText from '../images/announcement.svg';

import {StoreState} from '../global';
import {Class} from '../global/actions/classes';
import {fetchMsgs, Msg, addMsg} from '../global/actions/msgs';

import {ContainerStyles} from '../styles/styles';
import {
  commonBackground,
  commonBlue,
  commonGrey,
} from '../../shared/styles/colors';
import {mediaUrl, msgUrl} from '../../shared/utils/urls';

interface Props {
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
  fetchMsgs(token: string, classId: string): void;
  addMsg: typeof addMsg;
  msgs: Msg[];
  msgErrored: boolean;
  msgLoading: boolean;
  isOwner: boolean;
  onJoinPress: () => void;
  onLeftTopPress: () => void;
  onSendError: (e: any) => void;
}

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

  postMessage = () => {
    if (this.state.message.trim().length === 0) {
      return;
    }

    this.setState({message: ''});
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
      .then((res) => this.props.addMsg(res.data))
      .catch(this.props.onSendError);
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

  shareCode = () => {
    Share.open({
      title: 'Join my class on EasyTeach',
      message: `Join my class on EasyTeach, through this code: ${
        this.props.currentClass!.joinCode
      }. Download app from https://play.google.com/store/apps/details?id=com.hcodes.easyteach`,
    })
      .then(() => null)
      .catch(() => null);
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
            onPress={this.props.onJoinPress}
          />
        </View>
      );
    }

    if (props.msgErrored) {
      return (
        <View style={ContainerStyles.centerElements}>
          <Text>
            We're having trouble in fetching Announcements for you. Please try
            again later
          </Text>
        </View>
      );
    }

    if (props.msgLoading) {
      return (
        <View style={ContainerStyles.centerElements}>
          <ActivityIndicator color={commonBlue} animating size="large" />
        </View>
      );
    }

    if (props.msgs.length === 0) {
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
        data={this.props.msgs}
        keyExtractor={(_item, i) => i.toString()}
        inverted
        renderItem={this.renderListItem}
      />
    );
  };

  render() {
    return (
      <View style={[ContainerStyles.parent, {backgroundColor: '#fff'}]}>
        <Header
          centerComponent={{
            text: this.props.currentClass
              ? this.props.currentClass!.name
              : 'Home',
            style: {fontSize: 24, color: '#fff', fontWeight: '600'},
          }}
          leftComponent={{
            icon: 'menu',
            color: '#ffff',
            size: 26,
            onPress: this.props.onLeftTopPress,
          }}
        />
        <View
          style={{
            flex: 1,
          }}>
          {this.renderContent()}

          {this.props.isOwner ? (
            <Input
              placeholder="Type here..."
              value={this.state.message}
              multiline
              errorStyle={{height: 0}}
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
    msgs: state.msgs,
    msgErrored: state.msgErrored,
    msgLoading: state.msgLoading,
    isOwner,
  };
};

export default connect(mapStateToProps, {fetchMsgs, addMsg})(Home);