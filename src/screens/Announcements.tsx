import React from 'react';
import {View, Text, ActivityIndicator, FlatList} from 'react-native';
import {Header, Button} from 'react-native-elements';
import {connect} from 'react-redux';
import {CompositeNavigationProp} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {StackNavigationProp} from '@react-navigation/stack';

import {MsgCard} from '../components/common';

import {StoreState} from '../global';
import {Class} from '../global/actions/classes';
import {fetchMsgs, Msg} from '../global/actions/msgs';

import {ContainerStyles} from '../styles/styles';
import {
  RootStackParamList,
  DrawerParamList,
  BottomTabHomeParamList,
} from '../navigators/types';
import {commonBlue} from '../styles/colors';
import {mediaUrl} from '../utils/urls';

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
  msgs: Msg[];
  msgErrored: boolean;
  msgLoading: boolean;
}

class Home extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    if (this.props.currentClass) {
      this.props.fetchMsgs(this.props.token!, this.props.currentClass.id);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const {currentClass} = this.props;

    const prevClassId = prevProps.currentClass
      ? prevProps.currentClass.id
      : null;

    const currentClassId = currentClass ? currentClass.id : null;
    if (currentClassId !== prevClassId) {
      this.props.fetchMsgs(this.props.token!, currentClassId!);
    }
  }

  renderContent = () => {
    const {props} = this;

    if (props.classHasErrored) {
      return (
        <Text>
          We're having trouble in connecting to service. Please consider
          checking your network or try again
        </Text>
      );
    }

    if (props.classIsLoading) {
      return <ActivityIndicator color={commonBlue} animating size="large" />;
    }

    if (props.classes.length === 0) {
      return (
        <>
          <Text>
            Looks like it's your first time. Begin with Joining or Creating a
            class
          </Text>
          <Button
            title="Create or Join class"
            onPress={() => props.navigation.navigate('JoinClass')}
          />
        </>
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
              createdAt={item.createdAt}
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

export default connect(mapStateToProps, {fetchMsgs})(Home);
