import React from 'react';
import axios from 'axios';
import {StackNavigationProp} from '@react-navigation/stack';
import {connect} from 'react-redux';
import {CompositeNavigationProp} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';

import {CommonTest} from '../components/main';
import {Card} from '../components/common';

import {StoreState} from '../global';
import {Class} from '../global/actions/classes';
import {QuizRes} from '../global/actions/quiz';

import {quizUrl} from '../utils/urls';
import {
  RootStackParamList,
  DrawerParamList,
  BottomTabTestParamList,
} from '../navigators/types';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabTestParamList, 'TestHome'>,
  CompositeNavigationProp<
    DrawerNavigationProp<DrawerParamList>,
    StackNavigationProp<RootStackParamList>
  >
>;

interface Props {
  token: string | null;
  currentClass: Class | null;
  profile: {
    name: string;
    username: string;
    avatar: string;
  };
  navigation: NavigationProp;
  isOwner: boolean;
}

interface State {
  loading: boolean;
  errored: boolean;
  data: QuizRes[];
}

class Scored extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loading: true,
      errored: false,
      data: [],
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.currentClass?.id !== this.props.currentClass?.id) {
      this.fetchData();
    }
  }

  fetchData = () => {
    axios
      .get<{scored: QuizRes[]}>(`${quizUrl}/${this.props.currentClass!.id}`, {
        headers: {
          Authorization: `Bearer ${this.props.token}`,
        },
        params: {
          return: 'scored',
        },
      })
      .then((res) => {
        this.setState({
          data: res.data.scored,
          loading: false,
        });
      })
      .catch(() => {
        this.setState({
          loading: false,
          errored: true,
        });
      });
  };

  renderItem = ({item}: {item: QuizRes}) => {
    return (
      <Card
        title={item.title}
        containerStyle={{margin: 10}}
        expiresOn={new Date(item.timePeriod[1].value)}
        onPress={() =>
          this.props.navigation.navigate('ShowScore', {
            quizId: item.quizId,
            title: item.title,
            questions: item.questions,
          })
        }
      />
    );
  };

  render() {
    const {navigation} = this.props;
    const {loading, errored, data} = this.state;
    return (
      <CommonTest
        navigation={navigation}
        dataLoading={loading}
        dataErrored={errored}
        data={data}
        headerText="Scored"
        isOwner={this.props.isOwner}
        renderItem={this.renderItem}
      />
    );
  }
}

const mapStateToProps = (state: StoreState) => {
  return {
    token: state.token,
    profile: state.profile,
    currentClass: state.currentClass,
    isOwner: state.currentClass!.owner.username === state.profile.username,
  };
};

export default connect(mapStateToProps)(Scored);
