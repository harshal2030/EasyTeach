import React from 'react';
import axios from 'axios';
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Linking,
} from 'react-native';
import {Header, Button} from 'react-native-elements';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {connect} from 'react-redux';

import {StoreState} from '../../shared/global';
import {Class} from '../../shared/global/actions/classes';
import {Result} from '../../shared/global/actions/quiz';

import {resultUrl} from '../../shared/utils/urls';
import {RootStackParamList} from '../navigators/types';
import {commonBlue} from '../../shared/styles/colors';
import {ContainerStyles, TextStyles} from '../../shared/styles/styles';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ShowScore'
>;
type Route = RouteProp<RootStackParamList, 'ShowScore'>;
interface Props {
  navigation: NavigationProp;
  token: string | null;
  currentClass: Class | null;
  route: Route;
  profile: {
    name: string;
    username: string;
    avatar: string;
  };
  isOwner: boolean;
}

interface State {
  result: Result;
  loading: boolean;
  errored: boolean;
}

class ShowScore extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      result: {
        totalQues: 0,
        totalScore: 0,
        incorrect: 0,
        correct: 0,
        userScored: 0,
        notAnswered: 0,
      },
      loading: true,
      errored: false,
    };
  }

  componentDidMount() {
    this.fetchResult();
  }

  fetchResult = () => {
    const {currentClass, route, token} = this.props;
    axios
      .get<Result>(`${resultUrl}/${currentClass!.id}/${route.params.quizId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => this.setState({result: res.data, loading: false}))
      .catch(() => this.setState({errored: true, loading: false}));
  };

  renderContent = () => {
    const {loading, errored, result} = this.state;
    const {title, quizId} = this.props.route.params;
    const {currentClass} = this.props;

    if (errored) {
      return (
        <Text>
          We're having tough times in fetching resources. please try again later
        </Text>
      );
    }

    if (loading) {
      return <ActivityIndicator size="large" animating color={commonBlue} />;
    }

    return (
      <ScrollView style={[ContainerStyles.padder, {width: '100%'}]}>
        <Text
          style={[
            TextStyles.headingStyle,
            {
              borderBottomWidth: 1,
              borderBottomColor: '#000',
            },
          ]}>
          {title}
        </Text>

        <View style={styles.scoreInfoContainer}>
          <Text style={styles.textStyle}>
            Total Questions: {result.totalQues}
          </Text>
          <Text style={styles.textStyle}>Max. Score: {result.totalScore}</Text>
          <Text style={styles.textStyle}>Your Score: {result.userScored}</Text>
          <Text style={styles.textStyle}>Correct: {result.correct}</Text>
          <Text style={styles.textStyle}>Incorrect: {result.incorrect}</Text>
          <Text style={styles.textStyle}>
            Not Answered: {result.notAnswered}
          </Text>
        </View>

        {this.props.isOwner && (
          <Button
            title="Download class result sheet"
            onPress={() =>
              Linking.openURL(`${resultUrl}/file/${currentClass!.id}/${quizId}`)
            }
          />
        )}
      </ScrollView>
    );
  };

  render() {
    return (
      <View style={ContainerStyles.parent}>
        <Header
          centerComponent={{
            text: 'Test Score',
            style: {fontSize: 24, color: '#fff', fontWeight: '600'},
          }}
          leftComponent={{
            icon: 'arrow-back',
            color: '#ffff',
            size: 26,
            onPress: () => this.props.navigation.goBack(),
          }}
        />

        <View style={ContainerStyles.centerElements}>
          {this.renderContent()}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  scoreInfoContainer: {
    marginTop: 20,
  },
  textStyle: {
    fontSize: 18,
  },
});

const mapStateToProps = (state: StoreState) => {
  let isOwner: boolean = false;
  if (state.currentClass) {
    isOwner = state.currentClass.owner.username === state.profile.username;
  }
  return {
    token: state.token,
    currentClass: state.currentClass,
    profile: state.profile,
    isOwner,
  };
};

export default connect(mapStateToProps)(ShowScore);
