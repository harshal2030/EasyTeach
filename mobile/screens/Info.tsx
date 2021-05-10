import React from 'react';
import axios from 'axios';
import {View, Text, FlatList, ActivityIndicator} from 'react-native';
import {Header, ListItem} from 'react-native-elements';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {connect} from 'react-redux';

import {Avatar} from '../../shared/components/common';

import {StoreState} from '../../shared/global';
import {Class} from '../../shared/global/actions/classes';

import {RootStackParamList} from '../navigators/types';
import {vidTrackerUrl, mediaUrl} from '../../shared/utils/urls';
import {ContainerStyles} from '../../shared/styles/styles';
import {commonBlue} from '../../shared/styles/colors';
import {getDateAndMonth} from '../../shared/utils/functions';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Info'>;
  route: RouteProp<RootStackParamList, 'Info'>;
  currentClass: Class;
  token: string;
};

type Res = {
  createdAt: string;
  start: string;
  stop: string;
  user: {
    username: string;
    name: string;
    avatar: string;
  };
  videoId: string;
};

type State = {
  loading: boolean;
  errored: boolean;
  info: Res[];
};

class Info extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loading: true,
      errored: false,
      info: [],
    };
  }

  componentDidMount() {
    this.getInfo();
  }

  getInfo = () => {
    this.setState({loading: true});
    const {id} = this.props.currentClass;
    const {moduleId, videoId} = this.props.route.params;

    axios
      .get<Res[]>(`${vidTrackerUrl}/${id}/${moduleId}/${videoId}`, {
        headers: {
          Authorization: `Bearer ${this.props.token}`,
        },
      })
      .then((res) => this.setState({loading: false, info: res.data}))
      .catch(() => this.setState({loading: false, errored: true}));
  };

  renderItem = ({item}: {item: Res}) => {
    const _createdAt = new Date(item.createdAt);
    const createdAt = new Date(
      _createdAt.getFullYear(),
      _createdAt.getMonth(),
      _createdAt.getDate(),
    );
    const today = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate(),
    );
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    let date: string;

    if (createdAt.getTime() === today.getTime()) {
      date = 'today';
    } else if (yesterday.getTime() === createdAt.getTime()) {
      date = 'yesterday';
    } else {
      date = `on ${getDateAndMonth(createdAt)}`;
    }

    const timeSpent =
      (new Date(item.stop).getTime() - new Date(item.start).getTime()) /
      (1000 * 60);

    return (
      <ListItem>
        <Avatar source={{uri: `${mediaUrl}/avatar/${item.user.avatar}`}} />

        <ListItem.Content>
          <ListItem.Title>{item.user.name}</ListItem.Title>
          <ListItem.Subtitle>
            Spent {Math.round(timeSpent)} min {date}
          </ListItem.Subtitle>
        </ListItem.Content>
      </ListItem>
    );
  };

  renderContent = () => {
    const {loading, errored, info} = this.state;

    if (errored) {
      return (
        <View style={ContainerStyles.centerElements}>
          <Text>Something went wrong! Please try again later.</Text>
        </View>
      );
    }

    if (loading) {
      return (
        <View style={ContainerStyles.centerElements}>
          <ActivityIndicator animating size="large" color={commonBlue} />
        </View>
      );
    }

    if (info.length === 0) {
      return (
        <View style={ContainerStyles.centerElements}>
          <Text>Nothing to show here right now!</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={info}
        keyExtractor={(_, i) => i.toString()}
        renderItem={this.renderItem}
      />
    );
  };

  render() {
    return (
      <View style={ContainerStyles.parent}>
        <Header
          centerComponent={{
            text: `Watchers - ${this.props.route.params.title}`,
            style: {fontSize: 24, color: '#ffff', fontWeight: '600'},
          }}
          leftComponent={{
            icon: 'arrow-back',
            color: '#ffff',
            size: 26,
            onPress: this.props.navigation.goBack,
          }}
          rightComponent={{
            icon: 'refresh-ccw',
            type: 'feather',
            size: 20,
            color: '#ffff',
            onPress: this.getInfo,
          }}
          rightContainerStyle={{justifyContent: 'center'}}
        />
        {this.renderContent()}
      </View>
    );
  }
}

const mapStateToProps = (state: StoreState) => {
  return {
    currentClass: state.currentClass!,
    token: state.token!,
  };
};

export default connect(mapStateToProps)(Info);
