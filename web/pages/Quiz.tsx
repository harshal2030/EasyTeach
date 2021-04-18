import React from 'react';
import axios from 'axios';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  AppState,
  AppStateStatus,
  Image as FastImage,
} from 'react-native';
import {withRouter, RouteComponentProps} from 'react-router';
import {Header, Button, ButtonGroup} from 'react-native-elements';
import {connect} from 'react-redux';
import LightBox from 'react-native-lightbox-v2';
import Dialog from 'react-native-dialog';

import {StoreState} from '../../shared/global';
import {Class, registerCurrentClass} from '../../shared/global/actions/classes';

import {ContainerStyles} from '../../shared/styles/styles';
import {mediaUrl, quizUrl} from '../../shared/utils/urls';
import {
  commonBlue,
  commonGrey,
  greyWithAlpha,
} from '../../shared/styles/colors';

type Props = RouteComponentProps<{classId: string; quizId: string}> & {
  token: string | null;
  currentClass: Class | null;
  classes: Class[];
  registerCurrentClass: typeof registerCurrentClass;
};

type Questions = {
  question: string;
  options: string[];
  queId: string;
  selected: number | null;
  score: number;
  attachments: string | undefined;
};

interface State {
  currentIndex: number;
  questions: Questions[];
  loading: boolean;
  errored: boolean;
  alertVisible: boolean;
  alertTitle: string;
  alertDesc: string;
  alertButtons: {text: string; onPress(): void}[];
}

class Quiz extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      currentIndex: 0,
      questions: [],
      loading: true,
      errored: false,
      alertVisible: false,
      alertTitle: '',
      alertDesc: '',
      alertButtons: [],
    };
  }

  Alert = (
    title: string,
    desc: string,
    buttons?: {text: string; onPress(): void}[],
  ) => {
    const alertButtons = buttons
      ? buttons
      : [{text: 'Ok', onPress: () => this.setState({alertVisible: false})}];

    this.setState({
      alertVisible: true,
      alertTitle: title,
      alertDesc: desc,
      alertButtons,
    });
  };

  componentDidMount() {
    const {classId} = this.props.match.params;
    const {classes} = this.props;

    const classFound = classes.find((cls) => cls.id === classId);

    if (classFound) {
      this.props.registerCurrentClass(classFound);
    } else {
      this.props.history.replace('/*');
    }
    AppState.addEventListener('change', this.appStateHandler);
    this.fetchQues();
  }

  appStateHandler = (state: AppStateStatus) => {
    if (state === 'background' || state === 'inactive') {
      this.setState({currentIndex: 0});
      this.fetchQues();
    }
  };

  componentWillUnmount() {
    AppState.removeEventListener('change', this.appStateHandler);
  }

  fetchQues = () => {
    const {quizId} = this.props.match.params;
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
        res.data.questions.forEach((ques) => {
          if (ques.attachments) {
            FastImage.prefetch(`${mediaUrl}/que/${ques.attachments}`);
          }
        });
      })
      .catch((e) => {
        this.setState({errored: true, loading: false});
        if (e.response) {
          if (e.response.status === 400) {
            this.Alert('Oops!', e.response.data.error, [
              {
                text: 'Ok',
                onPress: () => {
                  this.setState({alertVisible: false});
                  this.props.history.goBack();
                },
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
    const {currentClass, token} = this.props;
    const {quizId} = this.props.match.params;
    const marked = this.state.questions.map((val) => {
      let response: string | null;
      if (val.selected === null || val.selected === undefined) {
        response = null;
      } else {
        response = val.options[val.selected];
      }

      return {
        queId: val.queId,
        response,
      };
    });

    axios
      .post<{releaseScore: boolean}>(
        `${quizUrl}/${currentClass!.id}/${quizId}`,
        {response: marked},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .then((res) => {
        if (res.data.releaseScore) {
          return this.props.history.replace(
            `/result/${this.props.match.params.classId}/${this.props.match.params.quizId}`,
          );
        }

        this.Alert('Success', 'Your response has been recorded', [
          {
            text: 'Ok',
            onPress: () => {
              this.setState({alertVisible: false});
              this.props.history.push(
                `/classes/home/${this.props.currentClass?.id}`,
              );
            },
          },
        ]);
      })
      .catch(() => {
        this.Alert(
          'Oops!',
          "We're unable to record your response, please try again later",
        );
      });
  };

  confirmSubmit = () => {
    const onProgress = () => {
      this.Alert('Confirm', 'Are you sure to submit the test?', [
        {
          text: 'Cancel',
          onPress: () => this.setState({alertVisible: false}),
        },
        {
          text: 'Ok',
          onPress: this.postResponse,
        },
      ]);
    };

    this.Alert(
      'Warning!',
      'Once you submit the test, you cannot resubmit it.',
      [
        {
          text: 'Cancel',
          onPress: () => this.setState({alertVisible: false}),
        },
        {
          text: 'Ok',
          onPress: onProgress,
        },
      ],
    );
  };

  ZoomImage = () => {
    const {currentIndex, questions} = this.state;
    return (
      <FastImage
        source={{uri: `${mediaUrl}/que/${questions[currentIndex].attachments}`}}
        style={{width: '100%', height: '100%'}}
        resizeMode="contain"
      />
    );
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

        <Text style={styles.questionText}>
          {questions[currentIndex].question}
        </Text>

        {questions[currentIndex].attachments && (
          <>
            <Text style={styles.imageText}>*click to enlarge</Text>
            <LightBox renderContent={this.ZoomImage}>
              <FastImage
                source={{
                  uri: `${mediaUrl}/que/${questions[currentIndex].attachments}`,
                }}
                style={styles.imageStyle}
              />
            </LightBox>
          </>
        )}
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
    const {
      questions,
      currentIndex,
      alertButtons,
      alertDesc,
      alertTitle,
      alertVisible,
    } = this.state;

    return (
      <View style={ContainerStyles.parent}>
        <Header
          centerComponent={{
            text: 'Test',
            style: {fontSize: 24, color: '#fff', fontWeight: '600'},
          }}
          leftComponent={{
            icon: 'arrow-back',
            color: '#ffff',
            size: 26,
            onPress: () => this.props.history.goBack(),
          }}
        />

        <View style={ContainerStyles.centerElements}>
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
          <Button title="Submit" onPress={this.confirmSubmit} />
          <Button
            title="Next"
            disabled={currentIndex === questions.length - 1}
            onPress={() => this.setState({currentIndex: currentIndex + 1})}
          />
        </View>

        <Dialog.Container visible={alertVisible}>
          <Dialog.Title>{alertTitle}</Dialog.Title>
          <Dialog.Description>{alertDesc}</Dialog.Description>
          {alertButtons.map((button) => {
            return (
              <Dialog.Button label={button.text} onPress={button.onPress} />
            );
          })}
        </Dialog.Container>
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
  imageStyle: {
    height: 100,
    width: undefined,
    flex: 1,
    margin: 5,
    marginTop: 0,
  },
  imageText: {
    fontSize: 12,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

const mapStateToProps = (state: StoreState) => {
  return {
    token: state.token,
    currentClass: state.currentClass,
    classes: state.classes,
  };
};

export default withRouter(
  connect(mapStateToProps, {registerCurrentClass})(Quiz),
);
