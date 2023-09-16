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
import {connect} from 'react-redux';
import {withRouter, RouteComponentProps} from 'react-router-dom';
import BackIcon from '@iconify-icons/ic/arrow-back';

import {TouchableIcon} from '../components';

import {StoreState} from '../../shared/global';
import {Class, registerCurrentClass} from '../../shared/global/actions/classes';
import {Result} from '../../shared/global/actions/quiz';

import {resultUrl} from '../../shared/utils/urls';
import {commonBlue} from '../../shared/styles/colors';
import {ContainerStyles, TextStyles} from '../../shared/styles/styles';

interface Props extends RouteComponentProps<{classId: string; quizId: string}> {
  token: string | null;
  currentClass: Class | null;
  profile: {
    name: string;
    username: string;
    avatar: string;
  };
  isOwner: boolean;
  classes: Class[];
  registerCurrentClass: typeof registerCurrentClass;
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
    const {classId} = this.props.match.params;
    const {classes} = this.props;

    const classFound = classes.find((cls) => cls.id === classId);

    if (classFound) {
      this.props.registerCurrentClass(classFound);
    } else {
      this.props.history.replace('/*');
    }

    this.fetchResult();
  }

  fetchResult = () => {
    const {match, token} = this.props;
    axios
      .get<Result>(
        `${resultUrl}/${match.params.classId}/${match.params.quizId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .then((res) => this.setState({result: res.data, loading: false}))
      .catch(() => this.setState({errored: true, loading: false}));
  };

  renderContent = () => {
    const {loading, errored, result} = this.state;
    const {quizId} = this.props.match.params;
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
          Your Score
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
          leftComponent={
            <TouchableIcon
              icon={BackIcon}
              size={26}
              onPress={this.props.history.goBack}
              color="#fff"
            />
          }
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
    classes: state.classes.classes,
  };
};

export default withRouter(
  connect(mapStateToProps, {registerCurrentClass})(ShowScore),
);
