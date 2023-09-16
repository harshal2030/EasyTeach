import React from 'react';
import axios from 'axios';
import {View, Text, FlatList, ActivityIndicator} from 'react-native';
import {Header, ListItem, Button} from 'react-native-elements';
import {withRouter, RouteComponentProps} from 'react-router-dom';
import {connect} from 'react-redux';
import backIcon from '@iconify-icons/ic/arrow-back';
import refreshCw from '@iconify-icons/feather/refresh-ccw';

import {TouchableIcon} from '../components';
import {Avatar} from '../../shared/components/common';

import {StoreState} from '../../shared/global';
import {Class, registerCurrentClass} from '../../shared/global/actions/classes';

import {vidTrackerUrl, mediaUrl} from '../../shared/utils/urls';
import {ContainerStyles} from '../../shared/styles/styles';
import {commonBlue} from '../../shared/styles/colors';
import {getDateAndMonth} from '../../shared/utils/functions';

type Props = RouteComponentProps<{
  classId: string;
  moduleId: string;
  videoId: string;
}> & {
  currentClass: Class;
  token: string;
  premiumAllowed: boolean;
  registerCurrentClass: typeof registerCurrentClass;
  classes: Class[];
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
    const {classId} = this.props.match.params;
    const {classes} = this.props;

    const classFound = classes.find((cls) => cls.id === classId);

    if (classFound) {
      this.props.registerCurrentClass(classFound);
    } else {
      this.props.history.replace('/*');
    }
    if (this.props.premiumAllowed) {
      this.getInfo();
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (
      prevProps.currentClass?.id === this.props.currentClass?.id &&
      this.props.premiumAllowed !== prevProps.premiumAllowed
    ) {
      this.getInfo();
      return;
    }

    if (prevProps.currentClass?.id !== this.props.currentClass?.id) {
      this.getInfo();
    }
  }

  getInfo = () => {
    this.setState({loading: true});
    const {id} = this.props.currentClass;
    const {moduleId, videoId} = this.props.match.params;

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

  renderListFooter = () => {
    if (this.state.info.length !== 0) {
      return (
        <View style={{padding: 50}}>
          <a
            target="_blank"
            style={{textDecoration: 'none'}}
            href={`${vidTrackerUrl}/file/${this.props.match.params.classId}/${this.props.match.params.moduleId}/${this.props.match.params.videoId}`}>
            <Button title="Download Full Report" />
          </a>
        </View>
      );
    }
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
        ListFooterComponent={this.renderListFooter()}
      />
    );
  };

  render() {
    return (
      <View style={ContainerStyles.parent}>
        <Header
          centerComponent={{
            text: 'Watchers',
            style: {fontSize: 24, color: '#ffff', fontWeight: '600'},
          }}
          leftComponent={
            <TouchableIcon
              icon={backIcon}
              size={26}
              color="#fff"
              onPress={this.props.history.goBack}
            />
          }
          rightComponent={
            <TouchableIcon
              icon={refreshCw}
              size={23}
              color="#fff"
              onPress={this.getInfo}
            />
          }
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
    premiumAllowed: state.currentClass?.planId !== 'free',
    classes: state.classes.classes,
  };
};

export default withRouter(
  connect(mapStateToProps, {
    registerCurrentClass,
  })(Info),
);
