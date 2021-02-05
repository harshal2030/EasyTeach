import React from 'react';
import axios from 'axios';
import {View, Text, ActivityIndicator} from 'react-native';
import {Header} from 'react-native-elements';
import {connect} from 'react-redux';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';

import {StoreState} from '../global';
import {Class} from '../global/actions/classes';

import {RootStackParamList} from '../navigators/types';
import {questionUrl} from '../utils/urls';
import {ContainerStyles} from '../styles/styles';
import {commonBlue} from '../styles/colors';

interface Props {
  navigation: StackNavigationProp<RootStackParamList, 'EditQuestion'>;
  route: RouteProp<RootStackParamList, 'EditQuestion'>;
  currentClass: Class;
  token: string;
}

type Questions = {
  question: string;
  options: string[];
  queId: string;
  score: number;
};

interface State {
  loading: boolean;
  errored: boolean;
  questions: Questions[];
  page: number;
}

class EditQuestion extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      questions: [],
      loading: true,
      errored: false,
      page: 0,
    };
  }

  componentDidMount() {
    this.fetchQues();
  }

  fetchQues = () => {
    const {currentClass, route, token} = this.props;
    axios
      .get<Questions[]>(
        `${questionUrl}/${currentClass.id}/${route.params.quizId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .then((res) => this.setState({questions: res.data, loading: false}))
      .catch(() => this.setState({loading: false, errored: true}));
  };

  renderContent = () => {
    const {errored, loading} = this.state;

    if (errored) {
      return (
        <View style={ContainerStyles.centerElements}>
          <Text>
            We're having trouble in connecting to service. Please consider
            checking your network or try again
          </Text>
        </View>
      );
    }

    if (loading) {
      return (
        <View style={ContainerStyles.centerElements}>
          <ActivityIndicator color={commonBlue} animating size="large" />
        </View>
      );
    }

    return (
      <View style={{flex: 1}}>
        <View key="1" style={{backgroundColor: 'red'}}>
          <Text>1</Text>
        </View>
        <View key="2">
          <Text>2</Text>
        </View>
      </View>
    );
  };

  render() {
    return (
      <View style={{flex: 1}}>
        <Header
          centerComponent={{
            text: 'Edit Questions',
            style: {fontSize: 24, color: '#fff', fontWeight: '600'},
          }}
          leftComponent={{
            icon: 'arrow-back',
            color: '#ffff',
            size: 26,
            onPress: () => this.props.navigation.goBack(),
          }}
        />

        {this.renderContent()}
      </View>
    );
  }
}

const mapStateToProps = (state: StoreState) => {
  return {
    token: state.token!,
    currentClass: state.currentClass!,
  };
};

export default connect(mapStateToProps)(EditQuestion);
