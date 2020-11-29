import React from 'react';
import axios from 'axios';
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
import {commonBlue} from '../styles/colors';

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
};

interface State {
  currentIndex: number;
  questions: Questions[];
  loading: boolean;
  errored: boolean;
}

class Quiz extends React.Component<Props, State> {
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
    this.fetchQues();
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
          return this.props.navigation.navigate('ShowScore', {
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
    const {
      buttonContainer,
      buttonContainerStyle,
      textStyle,
      buttonStyle,
    } = styles;

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
      <>
        <View style={buttonContainer}>
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

        <ScrollView style={[ContainerStyles.padder, {width: '100%'}]}>
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
      </>
    );
  };

  render() {
    return (
      <View style={ContainerStyles.parent}>
        <Header
          centerComponent={{
            text: 'Quiz',
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
