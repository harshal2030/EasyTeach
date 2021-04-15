import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert, // FIXME: use dialogs, not alert.
} from 'react-native';
import Modal from 'react-native-modal';
import {withRouter, RouteComponentProps} from 'react-router-dom';
import {MuiPickersUtilsProvider, DateTimePicker} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import {Header, Input, Text, Button, Icon} from 'react-native-elements';
import axios from 'axios';
import {connect} from 'react-redux';
import {toast} from 'react-toastify';

import {Chip, CheckBox} from '../../shared/components/common';
import {ImportExcel} from '../../shared/components/main';

import {StoreState} from '../../shared/global';
import {Class} from '../../shared/global/actions/classes';
import {
  QuizRes,
  addQuiz,
  fetchQuiz,
  removeQuiz,
} from '../../shared/global/actions/quiz';

import {TextStyles, ContainerStyles} from '../../shared/styles/styles';
import {commonBlue, commonGrey, flatRed} from '../../shared/styles/colors';
import {quizUrl} from '../../shared/utils/urls';
import {excelExtPattern} from '../../shared/utils/regexPatterns';

type Props = RouteComponentProps & {
  token: string | null;
  currentClass: Class | null;
  addQuiz: typeof addQuiz;
  fetchQuiz(token: string, classId: string): void;
  removeQuiz: typeof removeQuiz;
};

interface State {
  releaseScore: boolean;
  randomQue: boolean;
  randomOp: boolean;
  description: string;
  title: string;
  questions: string;
  timeRange: [Date, Date];
  loading: boolean;
  errored: boolean;
  APILoading: boolean;
  excelSheet: File | null;
  excelModal: boolean;
  datePicker: boolean;
  type: 0 | 1;
}

class CreateTest extends React.Component<Props, State> {
  quizId: string | null = null;
  upload: HTMLInputElement | null = null;

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
      datePicker: false,
      randomQue: false,
      description: '',
      title: '',
      questions: '1',
      timeRange: [today, tomorrow],
      loading: false,
      errored: false,
      APILoading: false,
      excelSheet: null,
      excelModal: false, // FIXME: set true when query not present
      type: 0,
    };
  }

  componentDidMount() {
    this.quizId = new URLSearchParams(this.props.location.search).get('quizId');
    this.getQuizDetail();
  }

  getQuizDetail = () => {
    if (this.quizId) {
      this.setState({loading: true});
      axios
        .get<QuizRes>(
          `${quizUrl}/${this.props.currentClass!.id}/${this.quizId}`,
          {
            headers: {
              Authorization: `Bearer ${this.props.token}`,
            },
          },
        )
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

  // TODO: Improve code quality for validation
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
    const {currentClass, token} = this.props;

    const start = timeRange[0].getTime();
    const stop = timeRange[1].getTime();

    const ques = parseInt(questions, 10);

    if (ques <= 0) {
      return toast.error('You must at least have one question in test.');
    }

    if (title.trim().length <= 0) {
      return toast.error('Please enter the title');
    }

    if (start > stop) {
      return toast.error('Invalid time range.');
    }

    this.setState({APILoading: true});
    axios
      .put<QuizRes>(
        `${quizUrl}/${currentClass!.id}/${this.quizId}`,
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
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .then((res) => {
        if (res.status === 200) {
          this.props.fetchQuiz(token!, currentClass!.id);
          this.setState({APILoading: false});
          this.props.history.goBack();
        }
      })
      .catch(() => {
        this.setState({APILoading: false});
        toast.error('Unable to update quiz, Please try again later');
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
      excelSheet,
    } = this.state;

    const start = timeRange[0].getTime(),
      stop = timeRange[1].getTime();

    const ques = parseInt(questions, 10);

    if (ques <= 0) {
      toast.error('You must at least have one question in test.');
    }

    if (title.trim().length <= 0) {
      return toast.error('Please enter the title');
    }

    if (start > stop) {
      toast.error('Invalid time range');
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

    data.append('sheet', excelSheet!, excelSheet!.name);

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
          return this.props.history.goBack();
        }
        throw new Error();
      })
      .catch(() => {
        this.setState({APILoading: false});
        toast.error('Unable to create Test. Please try again later.');
      });
  };

  quizRequest = () => {
    if (this.quizId) {
      this.updateQuiz();
    } else {
      this.postQuiz();
    }
  };

  deleteQuiz = () => {
    const deleteReq = () => {
      const {currentClass} = this.props;

      this.setState({APILoading: true});
      axios
        .delete(`${quizUrl}/${currentClass!.id}/${this.quizId}`, {
          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
        })
        .then(() => {
          this.props.removeQuiz(this.quizId!);
          this.setState({APILoading: false});
          this.props.history.goBack();
        })
        .catch(() => {
          this.setState({APILoading: false});
          toast.error('Unable to delete Test. Please try again later.');
        });
    };

    Alert.alert(
      'Confirm',
      'All related information will get deleted. Are you sure to delete this test?',
      [
        {
          text: 'Cancel',
        },
        {
          text: 'Yes',
          onPress: deleteReq,
        },
      ],
    );
  };

  handleSheet = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (!excelExtPattern.test(e.target.files[0].name)) {
        return toast.error('Please upload a valid excel file');
      }

      this.setState({excelSheet: e.target.files[0], excelModal: false});
    }
  };

  handleDate = (date: Date | null) => {
    if (date) {
      const temp: [Date, Date] = [...this.state.timeRange];
      temp[this.state.type] = date;
      this.setState({timeRange: temp});
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
      timeRange,
      loading,
      errored,
      APILoading,
      excelSheet,
    } = this.state;

    if (errored) {
      return (
        <View style={ContainerStyles.centerElements}>
          <Text>
            We're having trouble in fetching content for you. Please try again
            later.
          </Text>
        </View>
      );
    }

    if (loading) {
      return (
        <View style={ContainerStyles.centerElements}>
          <ActivityIndicator size="large" animating color={commonBlue} />
        </View>
      );
    }

    return (
      <View style={ContainerStyles.parent}>
        <Header
          centerComponent={{
            text: this.quizId ? 'Edit Test' : 'Create Test',
            style: {fontSize: 24, color: '#fff', fontWeight: '600'},
          }}
          leftComponent={{
            icon: 'arrow-back',
            color: '#ffff',
            size: 26,
            onPress: () => this.props.history.goBack(),
            disabled: APILoading,
          }}
        />

        <ScrollView
          style={ContainerStyles.padder}
          keyboardShouldPersistTaps="handled">
          {!this.quizId && (
            <>
              <Text h4 h4Style={TextStyles.h4Style}>
                Question Sheet
              </Text>
              <Chip
                text={excelSheet ? excelSheet.name : ''}
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

          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <div style={{display: 'none'}}>
              <DateTimePicker
                value={timeRange[this.state.type]}
                open={this.state.datePicker}
                onClose={() => this.setState({datePicker: false})}
                onAccept={() => this.setState({datePicker: false})}
                onChange={this.handleDate}
              />
            </div>
          </MuiPickersUtilsProvider>
          <Text h4 h4Style={TextStyles.h4Style}>
            Time Range
          </Text>
          <View style={styles.timeRangeParent}>
            <TouchableOpacity
              style={styles.timeRangeChild}
              onPress={() =>
                this.setState({datePicker: !this.state.datePicker, type: 0})
              }>
              <Text style={styles.timeRangeText}>
                {timeRange[0].toString()}
              </Text>
              <Text style={{color: commonGrey}}>Start Accepting Response</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.timeRangeChild}
              onPress={() =>
                this.setState({datePicker: !this.state.datePicker, type: 1})
              }>
              <Text style={styles.timeRangeText}>
                {timeRange[1].toString()}
              </Text>
              <Text style={{color: commonGrey}}>Stop Accepting Response</Text>
            </TouchableOpacity>
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

          <Button
            title={this.quizId ? 'Save' : 'Create Test'}
            containerStyle={[
              styles.buttonStyle,
              {marginBottom: this.quizId ? 0 : 30},
            ]}
            onPress={this.quizRequest}
            loading={APILoading}
          />

          {this.quizId && (
            <Button
              title="Delete"
              containerStyle={[styles.buttonStyle, {marginBottom: 50}]}
              buttonStyle={{backgroundColor: flatRed}}
              onPress={this.deleteQuiz}
              loading={APILoading}
            />
          )}
        </ScrollView>

        <Modal
          isVisible={this.state.excelModal}
          animationIn="slideInUp"
          animationOut="slideOutUp"
          hideModalContentWhileAnimating
          onBackButtonPress={() => this.setState({excelModal: false})}
          // eslint-disable-next-line react-native/no-inline-styles
          style={{margin: 0}}>
          <input
            type="file"
            name="excel-file"
            onChange={this.handleSheet}
            style={{display: 'none'}}
            id="excel-file"
            ref={(ref) => (this.upload = ref)}
          />
          <ImportExcel
            onBackPress={() => this.setState({excelModal: false})}
            onImportPress={() => this.upload!.click()}
          />
        </Modal>
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
    marginVertical: 10,
    flex: 1,
    marginHorizontal: 5,
  },
});

const mapStateToProps = (state: StoreState) => {
  return {
    token: state.token,
    currentClass: state.currentClass,
  };
};

export default withRouter(
  connect(mapStateToProps, {addQuiz, removeQuiz, fetchQuiz})(CreateTest),
);
