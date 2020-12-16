import React from 'react';
import axios from 'axios';
import {View, Text, ActivityIndicator, FlatList} from 'react-native';
import {Header, Button, Input} from 'react-native-elements';
import {connect} from 'react-redux';
import {CompositeNavigationProp} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {StackNavigationProp} from '@react-navigation/stack';

import {MsgCard} from '../components/common';

import {StoreState} from '../global';
import {Class} from '../global/actions/classes';
import {fetchMsgs, Msg, addMsg} from '../global/actions/msgs';

import {ContainerStyles} from '../styles/styles';
import {
  RootStackParamList,
  DrawerParamList,
  BottomTabHomeParamList,
} from '../navigators/types';
import {
  commonBackground,
  commonBlue,
  commonGrey,
  flatRed,
} from '../styles/colors';
import {mediaUrl, msgUrl} from '../utils/urls';
import Snackbar from 'react-native-snackbar';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabHomeParamList, 'People'>,
  CompositeNavigationProp<
    DrawerNavigationProp<DrawerParamList>,
    StackNavigationProp<RootStackParamList>
  >
>;

interface Props {
  profile: {
    name: string;
    username: string;
    avatar: string;
  };
  navigation: NavigationProp;
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
}

interface State {
  message: string;
}

class Home extends React.Component<Props, State> {
  isOwner: boolean = false;
  constructor(props: Props) {
    super(props);

    this.state = {
      message: '',
    };
  }

  componentDidMount() {
    if (this.props.currentClass) {
      this.props.fetchMsgs(this.props.token!, this.props.currentClass.id);
      this.isOwner =
        this.props.currentClass.owner.username === this.props.profile.username;
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
        this.props.fetchMsgs(this.props.token!, currentClassId!);
        this.isOwner =
          currentClass.owner.username === this.props.profile.username;
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
      .catch(() =>
        Snackbar.show({
          text: 'Unable to send your message. Please try again later',
          duration: Snackbar.LENGTH_LONG,
          backgroundColor: flatRed,
        }),
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
            onPress={() => props.navigation.navigate('JoinClass')}
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
        <View style={ContainerStyles.centerElements}>
          <Text>No Announcements yet.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={this.props.msgs}
        keyExtractor={(_item, i) => i.toString()}
        inverted
        renderItem={({item}) => {
          return (
            <MsgCard
              avatarUrl={`${mediaUrl}/avatar/${item.user.avatar}`}
              name={item.user.name}
              username={item.user.username}
              message={item.message}
              createdAt={new Date(item.createdAt)}
            />
          );
        }}
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
            onPress: () => this.props.navigation.openDrawer(),
          }}
        />
        <View
          style={{
            flex: 1,
          }}>
          {this.renderContent()}

          {this.isOwner ? (
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
  };
};

export default connect(mapStateToProps, {fetchMsgs, addMsg})(Home);
