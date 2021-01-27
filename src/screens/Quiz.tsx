import React from 'react';
import axios from 'axios';
import * as ScreenCapture from 'expo-screen-capture';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {Header, Button, ButtonGroup} from 'react-native-elements';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {connect} from 'react-redux';

import {StoreState} from '../global';
import {Class} from '../global/actions/classes';

import {RootStackParamList} from '../navigators/types';
import {ContainerStyles} from '../styles/styles';
import {quizUrl} from '../utils/urls';
import {commonBlue, commonGrey, greyWithAlpha} from '../styles/colors';

interface Props {
  navigation: StackNavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'Quiz'>;
  token: string | null;
  currentClass: Class | null;
}

type Questions = {
  question: string;
  options: string[];
  queId: string;
  selected: number | null;
  score: number;
};

interface State {
  currentIndex: number;
  questions: Questions[];
  loading: boolean;
  errored: boolean;
}

class Quiz extends React.Component<Props, State> {
  private _unSub: (() => void) | undefined;
  constructor(props: Props) {
    super(props);

    this.state = {
      currentIndex: 0,
      questions: [],
      loading: true,
      errored: false,
    };
  }

  componentDidMount() {
    ScreenCapture.preventScreenCaptureAsync('quiz');
    this.fetchQues();

    this._unSub = this.props.navigation.addListener('blur', () => {
      ScreenCapture.allowScreenCaptureAsync('quiz');
    });
  }

  componentWillUnmount() {
    this._unSub!();
  }

  fetchQues = () => {
    const {quizId} = this.props.route.params;
    const {id} = this.props.currentClass!;

    axios
      .get<{questions: Questions[]; totalScore: number; quizId: string}>(
        `${quizUrl}/que/${id}/${quizId}`,
        {
          headers: {
            Authorization: `Bearer ${this.props.token!}`,
          },
        },
      )
      .then((res) => {
        this.setState({loading: false, questions: res.data.questions});
      })
      .catch((e) => {
        this.setState({errored: true, loading: false});
        if (e.response) {
          if (e.response.status === 400) {
            Alert.alert('Oops!', e.response.data.error, [
              {
                text: 'Ok',
                onPress: () => this.props.navigation.goBack(),
              },
            ]);
          }
        }
      });
  };

  updateSelected = (i: number) => {
    const {currentIndex, questions} = this.state;
    const temp = [...questions];
    temp[currentIndex].selected = i;
    this.setState({questions: temp});
  };

  postResponse = () => {
    const {currentClass, route, token} = this.props;
    const marked = this.state.questions.map((val) => {
      return {
        queId: val.queId,
        response: val.selected ? val.options[val.selected] : val.selected,
      };
    });

    axios
      .post<{releaseScore: boolean}>(
        `${quizUrl}/${currentClass!.id}/${route.params.quizId}`,
        {response: marked},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .then((res) => {
        if (res.data.releaseScore) {
          return this.props.navigation.replace('ShowScore', {
            quizId: route.params.quizId,
            title: route.params.title,
            questions: this.state.questions.length,
          });
        }

        Alert.alert('Success', 'Your response has been recorded', [
          {
            text: 'Ok',
            onPress: () => this.props.navigation.goBack(),
          },
        ]);
      })
      .catch(() => {
        Alert.alert(
          'Oops!',
          "We're unable to record your response, please try again later",
        );
      });
  };

  renderContent = () => {
    const {loading, errored, questions, currentIndex} = this.state;
    const {buttonContainerStyle, textStyle, buttonStyle} = styles;

    if (errored) {
      return (
        <Text>
          We're having trouble in fetching resources. Please try again later
        </Text>
      );
    }

    if (loading) {
      return <ActivityIndicator size="large" color={commonBlue} animating />;
    }

    if (questions.length === 0) {
      return <Text>No questions on this test</Text>;
    }

    return (
      <ScrollView style={[ContainerStyles.padder, {width: '100%'}]}>
        <Text style={{color: commonGrey}}>
          Question {currentIndex + 1} of {questions.length},{' '}
          {questions[currentIndex].score} marks
        </Text>

        <Text style={{fontSize: 18, fontWeight: '500'}}>
          {questions[currentIndex].question}
        </Text>
        <ButtonGroup
          buttons={questions[currentIndex].options}
          onPress={this.updateSelected}
          buttonContainerStyle={buttonContainerStyle}
          buttonStyle={buttonStyle}
          textStyle={textStyle}
          containerStyle={{marginBottom: 100}}
          vertical
          selectedIndex={this.state.questions[currentIndex].selected}
        />
      </ScrollView>
    );
  };

  render() {
    const {questions, currentIndex} = this.state;

    return (
      <View style={ContainerStyles.parent}>
        <Header
          centerComponent={{
            text: this.props.route.params.title,
            style: {fontSize: 24, color: '#fff', fontWeight: '600'},
          }}
          leftComponent={{
            icon: 'arrow-back',
            color: '#ffff',
            size: 26,
            onPress: () => this.props.navigation.goBack(),
          }}
        />

        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          {this.renderContent()}
        </View>

        <Text style={{marginLeft: 10}}>
          You have answered{' '}
          {questions.filter((que) => que.selected !== undefined).length} of{' '}
          {questions.length}
        </Text>
        <View style={styles.buttonContainer}>
          <Button
            title="Previous"
            disabled={currentIndex === 0}
            onPress={() => this.setState({currentIndex: currentIndex - 1})}
          />
          <Button title="Submit" onPress={this.postResponse} />
          <Button
            title="Next"
            disabled={currentIndex === questions.length - 1}
            onPress={() => this.setState({currentIndex: currentIndex + 1})}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: '100%',
    justifyContent: 'space-between',
    flexDirection: 'row',
    padding: 20,
    backgroundColor: greyWithAlpha(0.2),
  },
  buttonContainerStyle: {
    flex: 1,
    height: '100%',
  },
  buttonStyle: {
    padding: 10,
  },
  textStyle: {
    fontSize: 18,
    fontWeight: '600',
  },
});

const mapStateToProps = (state: StoreState) => {
  return {
    token: state.token,
    currentClass: state.currentClass,
  };
};

export default connect(mapStateToProps)(Quiz);
