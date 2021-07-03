import React from 'react';
import axios from 'axios';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  ScrollView,
} from 'react-native';
import {withRouter, RouteComponentProps} from 'react-router-dom';
import {toast} from 'react-toastify';
import {Header, Button, Input} from 'react-native-elements';
import {connect} from 'react-redux';
import Megaphone from '../../shared/images/Megaphone.svg';
import MegaText from '../../shared/images/announcement.svg';
import MenuIcon from '@iconify-icons/ic/baseline-menu';
import SendIcon from '@iconify-icons/ic/baseline-send';

import {TouchableIcon} from '../components';
import {MsgCard} from '../../shared/components/common';

import {StoreState} from '../../shared/global';
import {Class, registerCurrentClass} from '../../shared/global/actions/classes';
import {fetchMsgs, Msg, addMsg} from '../../shared/global/actions/msgs';

import {ContainerStyles} from '../../shared/styles/styles';
import {
  commonBackground,
  commonBlue,
  commonGrey,
} from '../../shared/styles/colors';
import {mediaUrl, msgUrl} from '../../shared/utils/urls';
import {socket} from '../socket';

type WSMsg = Msg & {
  classId: string;
};

type Props = RouteComponentProps<{classId: string}> & {
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
  registerCurrentClass: typeof registerCurrentClass;
  isOwner: boolean;
  onLeftTopPress: () => void;
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

  openSocket = () => {
    socket.on('message', (data: {type: string; payload: WSMsg}) => {
      if (data.payload.classId === this.props.currentClass?.id) {
        this.props.addMsg(data.payload);
      }
    });
  };

  componentDidMount() {
    const {classId} = this.props.match.params;
    const {classes} = this.props;

    const classFound = classes.find((cls) => cls.id === classId);

    if (classFound) {
      this.props.registerCurrentClass(classFound);
    } else {
      if (classes.length !== 0) {
        this.props.history.replace('/*');
      }
    }

    if (this.props.currentClass) {
      this.openSocket();
      this.props.fetchMsgs(this.props.token!, this.props.currentClass!.id);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const {classId} = this.props.match.params;
    const {classes} = this.props;

    const hasClassChanged = prevProps.match.params.classId !== classId;

    if (hasClassChanged) {
      const classFound = classes.find((cls) => cls.id === classId);
      if (classFound) {
        this.props.registerCurrentClass(classFound);
      } else {
        this.props.history.replace('/*');
      }
    }

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
      .then(() => null)
      .catch(() =>
        toast.error('Unable to message at the moment. Please try again later'),
      );
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
            onPress={() => this.props.history.push('/joinclass')}
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
          leftComponent={
            <TouchableIcon
              icon={MenuIcon}
              size={26}
              onPress={this.props.onLeftTopPress}
              color="#fff"
            />
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
              rightIcon={
                <TouchableIcon
                  icon={SendIcon}
                  onPress={this.postMessage}
                  color={commonBlue}
                  size={28}
                />
              }
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

export default withRouter(
  connect(mapStateToProps, {fetchMsgs, addMsg, registerCurrentClass})(Home),
);
