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
  AppState,
  AppStateStatus,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {Header, Button, ButtonGroup} from 'react-native-elements';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {connect} from 'react-redux';
import LightBox from 'react-native-lightbox-v2';
// import PhotoView from 'react-native-photo-view-ex';

import {StoreState} from '../../shared/global';
import {Class, registerCurrentClass} from '../../shared/global/actions/classes';

import {RootStackParamList} from '../navigators/types';
import {ContainerStyles} from '../../shared/styles/styles';
import {mediaUrl, quizUrl} from '../../shared/utils/urls';
import {
  commonBlue,
  commonGrey,
  greyWithAlpha,
} from '../../shared/styles/colors';

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'Quiz'>;
  token: string | null;
  currentClass: Class | null;
  classIsLoading: boolean;
  classes: Class[];
  registerCurrentClass: typeof registerCurrentClass;
}

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
  quizTitle: string;
  allowBlur: boolean;
  blurred: boolean;
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
      quizTitle: '',
      allowBlur: true,
      blurred: false,
    };
  }

  componentDidMount() {
    AppState.addEventListener('change', this.appStateHandler);
    ScreenCapture.preventScreenCaptureAsync('quiz');
    this.fetchQues();

    this._unSub = this.props.navigation.addListener('blur', () => {
      ScreenCapture.allowScreenCaptureAsync('quiz');
      AppState.removeEventListener('change', this.appStateHandler);
    });
  }

  handleCurrentClass = () => {
    if (
      this.props.route.params.classId &&
      !this.props.classIsLoading &&
      this.props.route.params.classId !== this.props.currentClass?.id &&
      this.props.navigation.isFocused()
    ) {
      const {classId} = this.props.route.params;
      const classFound = this.props.classes.find((cls) => cls.id === classId);

      if (classFound) {
        this.props.registerCurrentClass(classFound);
      }
    }
  };

  componentDidUpdate() {
    this.handleCurrentClass();
  }

  appStateHandler = (state: AppStateStatus) => {
    if (state === 'active' && !this.state.allowBlur && this.state.blurred) {
      Alert.alert(
        'Test locked',
        'You have changed screen while giving test, which is violation of test rules. Hence, test is locked for you',
        [
          {
            text: 'Ok',
            onPress: this.goBack,
          },
        ],
      );
      return;
    }

    if (state === 'background' || state === 'inactive') {
      if (!this.state.allowBlur) {
        this.postBlur();
        this.setState({blurred: true});
      }

      this.setState({currentIndex: 0});
      this.fetchQues();
    }
  };

  componentWillUnmount() {
    this._unSub!();
    ScreenCapture.allowScreenCaptureAsync('quiz');
    AppState.removeEventListener('change', this.appStateHandler);
  }

  goBack = () => {
    if (this.props.navigation.canGoBack()) {
      this.props.navigation.goBack();
    } else {
      this.props.navigation.replace('Drawer');
    }
  };

  postBlur = () => {
    axios
      .post(
        `${quizUrl}/blur/${this.props.currentClass!.id}/${
          this.props.route.params.quizId
        }`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
        },
      )
      .then(() => null)
      .catch(() => null);
  };

  fetchQues = () => {
    const {quizId} = this.props.route.params;
    const id = this.props.currentClass?.id || this.props.route.params.classId;

    axios
      .get<{
        questions: Questions[];
        totalScore: number;
        quizId: string;
        quizTitle: string;
        allowBlur: boolean;
      }>(`${quizUrl}/que/${id}/${quizId}`, {
        headers: {
          Authorization: `Bearer ${this.props.token!}`,
        },
      })
      .then((res) => {
        this.setState({
          loading: false,
          questions: res.data.questions,
          quizTitle: res.data.quizTitle,
          allowBlur: res.data.allowBlur,
        });
        const images = res.data.questions
          .filter((que) => (que.attachments ? true : false))
          .map((q) => ({
            uri: `${mediaUrl}/que/${q.attachments}`,
          }));

        FastImage.preload(images);
      })
      .catch((e) => {
        this.setState({errored: true, loading: false});
        if (e.response) {
          if (e.response.status === 400) {
            Alert.alert('Oops!', e.response.data.error, [
              {
                text: 'Ok',
                onPress: this.goBack,
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
            title: this.state.quizTitle,
            questions: this.state.questions.length,
          });
        }

        Alert.alert('Success', 'Your response has been recorded', [
          {
            text: 'Ok',
            onPress: this.goBack,
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

  confirmSubmit = () => {
    const onProgress = () => {
      Alert.alert('Confirm', 'Are you sure to submit the test?', [
        {
          text: 'Cancel',
        },
        {
          text: 'Ok',
          onPress: this.postResponse,
        },
      ]);
    };

    Alert.alert(
      'Warning!',
      'Once you submit the test, you cannot resubmit it.',
      [
        {
          text: 'Cancel',
        },
        {
          text: 'Ok',
          onPress: onProgress,
        },
      ],
    );
  };

  // ZoomImage = () => {
  //   const {currentIndex, questions} = this.state;
  //   return (
  //     <PhotoView
  //       source={{uri: `${mediaUrl}/que/${questions[currentIndex].attachments}`}}
  //       style={{width: '100%', height: '100%'}}
  //       resizeMode="contain"
  //       maximumZoomScale={5}
  //     />
  //   );
  // };

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
            <LightBox>
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
    const {questions, currentIndex} = this.state;

    return (
      <View style={ContainerStyles.parent}>
        <Header
          centerComponent={{
            text: this.state.quizTitle,
            style: {fontSize: 24, color: '#fff', fontWeight: '600'},
          }}
          leftComponent={{
            icon: 'arrow-back',
            color: '#ffff',
            size: 26,
            onPress: this.goBack,
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
    classes: state.classes.classes,
    classIsLoading: state.classes.loading,
  };
};

export default connect(mapStateToProps, {registerCurrentClass})(Quiz);
