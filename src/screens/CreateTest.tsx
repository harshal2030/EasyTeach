import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import {Header, Input, Text, Button, Icon} from 'react-native-elements';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import SnackBar from 'react-native-snackbar';
import DateTimePicker, {Event} from '@react-native-community/datetimepicker';
import axios from 'axios';
import {connect} from 'react-redux';

import {RootStackParamList} from '../navigators/types';
import {Chip, CheckBox} from '../components/common';

import {StoreState} from '../global';
import {Class} from '../global/actions/classes';
import {QuizRes, addQuiz, updateQuiz, removeQuiz} from '../global/actions/quiz';

import {TextStyles, ContainerStyles} from '../styles/styles';
import {commonBlue, commonGrey, flatRed} from '../styles/colors';
import {quizUrl} from '../utils/urls';

type NavigationProp = StackNavigationProp<RootStackParamList, 'CreateTest'>;
type RouteProps = RouteProp<RootStackParamList, 'CreateTest'>;

interface Props {
  navigation: NavigationProp;
  token: string | null;
  currentClass: Class | null;
  route: RouteProps;
  addQuiz: typeof addQuiz;
  updateQuiz: typeof updateQuiz;
  removeQuiz: typeof removeQuiz;
}

interface State {
  releaseScore: boolean;
  randomQue: boolean;
  randomOp: boolean;
  description: string;
  title: string;
  questions: string;
  type: 0 | 1;
  mode: 'date' | 'time';
  showPicker: boolean;
  timeRange: [Date, Date];
  loading: boolean;
  errored: boolean;
  APILoading: boolean;
}

class CreateTest extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const today = new Date();
    today.setSeconds(0, 0);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setSeconds(0, 0);

    this.state = {
      releaseScore: true,
      randomOp: false,
      randomQue: false,
      description: '',
      title: '',
      questions: '1',
      type: 0,
      mode: 'date',
      showPicker: false,
      timeRange: [today, tomorrow],
      loading: false,
      errored: false,
      APILoading: false,
    };
  }

  componentDidMount() {
    this.getQuizDetail();
  }

  getQuizDetail = () => {
    const {quizId} = this.props.route.params;
    if (quizId) {
      this.setState({loading: true});
      axios
        .get<QuizRes>(`${quizUrl}/${this.props.currentClass!.id}/${quizId}`, {
          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
        })
        .then((res) => {
          const {
            title,
            description,
            releaseScore,
            randomOp,
            randomQue,
            questions,
            timePeriod,
          } = res.data;
          this.setState({
            title,
            description,
            releaseScore,
            randomOp,
            randomQue,
            questions: questions.toString(),
            timeRange: [
              new Date(timePeriod[0].value),
              new Date(timePeriod[1].value),
            ],
            loading: false,
          });
        })
        .catch(() => {
          this.setState({errored: true, loading: false});
        });
    }
  };

  updateQuiz = () => {
    const {
      questions,
      title,
      description,
      timeRange,
      releaseScore,
      randomQue,
      randomOp,
    } = this.state;
    const {currentClass, route} = this.props;

    const start = timeRange[0].getTime(),
      stop = timeRange[1].getTime();

    const ques = parseInt(questions, 10);

    if (ques <= 0) {
      return SnackBar.show({
        text: 'You must at least have one question in test.',
        duration: SnackBar.LENGTH_SHORT,
        backgroundColor: flatRed,
      });
    }

    if (title.trim().length <= 0) {
      return SnackBar.show({
        text: "What's the title?",
        duration: SnackBar.LENGTH_SHORT,
      });
    }

    if (start > stop) {
      return SnackBar.show({
        text: 'Invalid time range.',
        duration: SnackBar.LENGTH_SHORT,
      });
    }

    this.setState({APILoading: true});
    axios
      .put<QuizRes>(
        `${quizUrl}/${currentClass!.id}/${route.params.quizId}`,
        {
          questions: ques,
          title,
          description,
          timePeriod: timeRange,
          releaseScore,
          randomQue,
          randomOp,
        },
        {
          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
        },
      )
      .then((res) => {
        if (res.status === 200) {
          this.props.updateQuiz(res.data);
          this.setState({APILoading: false});
          this.props.navigation.goBack();
        }
      })
      .catch(() => {
        this.setState({APILoading: false});
        SnackBar.show({
          text: 'Unable to update quiz, Please try again later',
          duration: SnackBar.LENGTH_SHORT,
          backgroundColor: flatRed,
        });
      });
  };

  postQuiz = () => {
    const {
      questions,
      title,
      description,
      timeRange,
      releaseScore,
      randomQue,
      randomOp,
    } = this.state;

    const start = timeRange[0].getTime(),
      stop = timeRange[1].getTime();

    const ques = parseInt(questions, 10);

    if (ques <= 0) {
      return SnackBar.show({
        text: 'You must at least have one question in test.',
        duration: SnackBar.LENGTH_SHORT,
      });
    }

    if (title.trim().length <= 0) {
      return SnackBar.show({
        text: "What's the title?",
        duration: SnackBar.LENGTH_SHORT,
      });
    }

    if (start > stop) {
      return SnackBar.show({
        text: 'Invalid time range.',
        duration: SnackBar.LENGTH_SHORT,
      });
    }

    const data = new FormData();

    data.append(
      'info',
      JSON.stringify({
        questions: ques,
        title,
        description,
        timePeriod: timeRange,
        releaseScore,
        randomQue,
        randomOp,
      }),
    );

    const {file} = this.props.route.params;

    data.append('sheet', {
      // @ts-ignore
      name: file!.name || 'sheet.xlsx',
      type: file!.type,
      uri:
        Platform.OS === 'android'
          ? file!.uri
          : file!.uri.replace('file://', ''),
    });

    this.setState({APILoading: true});
    axios
      .post<QuizRes>(`${quizUrl}/${this.props.currentClass!.id}`, data, {
        headers: {
          Authorization: `Bearer ${this.props.token!}`,
        },
      })
      .then((res) => {
        this.setState({APILoading: false});
        if (res.status === 201) {
          this.props.addQuiz(res.data);
          return this.props.navigation.goBack();
        }
        throw new Error();
      })
      .catch(() => {
        this.setState({APILoading: false});
        SnackBar.show({
          text: 'Unable to create Test. Please try again later.',
          duration: SnackBar.LENGTH_SHORT,
          backgroundColor: flatRed,
        });
      });
  };

  quizRequest = () => {
    if (this.props.route.params.quizId) {
      this.updateQuiz();
    } else {
      this.postQuiz();
    }
  };

  deleteQuiz = () => {
    const deleteReq = () => {
      const {currentClass, route} = this.props;

      this.setState({APILoading: true});
      axios
        .delete(`${quizUrl}/${currentClass!.id}/${route.params.quizId}`, {
          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
        })
        .then(() => {
          this.props.removeQuiz(route.params.quizId!);
          this.setState({APILoading: false});
          this.props.navigation.goBack();
        })
        .catch((e) => {
          console.log(e);
          this.setState({APILoading: false});
          SnackBar.show({
            text: 'Unable to delete Test. Please try again later.',
            duration: SnackBar.LENGTH_SHORT,
            backgroundColor: flatRed,
          });
        });
    };

    Alert.alert('Confirm', 'Are you sure to delete this test', [
      {
        text: 'Cancel',
      },
      {
        text: 'Yes',
        onPress: deleteReq,
      },
    ]);
  };

  handleDate = (_e: Event, dateTime?: Date) => {
    const {timeRange, mode, type} = this.state;
    const temp: [Date, Date] = [...timeRange];

    if (!dateTime) {
      return this.setState({showPicker: false});
    }

    if (mode === 'date') {
      temp[type] = dateTime;
      temp[type].setSeconds(0, 0);
      this.setState({
        showPicker: true,
        timeRange: temp,
        mode: 'time',
      });
    }

    if (mode === 'time') {
      temp[type].setHours(dateTime.getHours(), dateTime.getMinutes());
      temp[type].setSeconds(0, 0);
      this.setState({mode: 'date', timeRange: temp, showPicker: false});
    }
  };

  render() {
    const {
      questions,
      title,
      description,
      releaseScore,
      randomOp,
      randomQue,
      showPicker,
      timeRange,
      type,
      mode,
      loading,
      errored,
      APILoading,
    } = this.state;

    if (errored) {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text>
            We're having trouble in fetching content for you. Please try again
            later.
          </Text>
        </View>
      );
    }

    if (loading) {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" animating color={commonBlue} />
        </View>
      );
    }

    return (
      <View style={ContainerStyles.parent}>
        <Header
          centerComponent={{
            text: this.props.route.params.quizId ? 'Edit Test' : 'Create Test',
            style: {fontSize: 24, color: '#fff', fontWeight: '600'},
          }}
          leftComponent={{
            icon: 'arrow-back',
            color: '#ffff',
            size: 26,
            onPress: () => this.props.navigation.goBack(),
            disabled: APILoading,
          }}
        />

        <ScrollView
          style={ContainerStyles.padder}
          keyboardShouldPersistTaps="handled">
          {!this.props.route.params.quizId && (
            <>
              <Text h4 h4Style={TextStyles.h4Style}>
                Question Sheet
              </Text>
              <Chip
                text={this.props.route.params.file!.name}
                rightIcon={
                  <Icon name="microsoft-excel" type="material-community" />
                }
              />
            </>
          )}

          <Input
            label="No. of questions"
            value={questions}
            errorMessage="How many questions to be included from given set"
            errorStyle={{color: commonGrey}}
            keyboardType="number-pad"
            onChangeText={(text) => this.setState({questions: text})}
          />

          <Input
            label="Title"
            value={title}
            onChangeText={(text) => this.setState({title: text})}
          />

          <Input
            label="Description"
            value={description}
            inputStyle={{maxHeight: 100}}
            multiline
            onChangeText={(text) => this.setState({description: text})}
          />

          <Text h4 h4Style={TextStyles.h4Style}>
            Time Range
          </Text>
          <View style={styles.timeRangeParent}>
            <TouchableOpacity
              style={styles.timeRangeChild}
              onPress={() => this.setState({type: 0, showPicker: true})}>
              <Text style={styles.timeRangeText}>
                {timeRange[0].toString()}
              </Text>
              <Text style={{color: commonGrey}}>Start Accepting Response</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.timeRangeChild}
              onPress={() => this.setState({type: 1, showPicker: true})}>
              <Text style={styles.timeRangeText}>
                {timeRange[1].toString()}
              </Text>
              <Text style={{color: commonGrey}}>Stop Accepting Response</Text>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={timeRange[type]}
                mode={mode}
                onChange={this.handleDate}
              />
            )}
          </View>

          <CheckBox
            checked={releaseScore}
            onPress={() => this.setState({releaseScore: !releaseScore})}
            title="Show Score"
            desc="You can change it later, used to show score after test completion"
          />

          <CheckBox
            checked={randomQue}
            title="Randomize Question"
            onPress={() => this.setState({randomQue: !randomQue})}
            desc="Randomize questions order, it will select questions randomly if specified No. of Question is less than that of Question Sheet"
          />

          <CheckBox
            checked={randomOp}
            title="Randomize Options"
            onPress={() => this.setState({randomOp: !randomOp})}
            desc="Randomize order of options specified in question sheet"
          />

          <View style={{flexDirection: 'row'}}>
            <Button
              title={this.props.route.params.quizId ? 'Save' : 'Create Test'}
              containerStyle={styles.buttonStyle}
              onPress={this.quizRequest}
              loading={APILoading}
            />

            {this.props.route.params.quizId && (
              <Button
                title="Delete"
                containerStyle={styles.buttonStyle}
                buttonStyle={{backgroundColor: flatRed}}
                onPress={this.deleteQuiz}
                loading={APILoading}
              />
            )}
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  timeRangeParent: {
    justifyContent: 'space-between',
    padding: 10,
    marginLeft: 5,
  },
  timeRangeText: {
    fontSize: 16,
    textDecorationColor: commonGrey,
    textDecorationStyle: 'solid',
    textDecorationLine: 'underline',
  },
  timeRangeChild: {
    marginVertical: 8,
  },
  buttonStyle: {
    marginVertical: 30,
    flex: 1,
    marginHorizontal: 10,
  },
});

const mapStateToProps = (state: StoreState) => {
  return {
    token: state.token,
    currentClass: state.currentClass,
  };
};

export default connect(mapStateToProps, {addQuiz, removeQuiz, updateQuiz})(
  CreateTest,
);
