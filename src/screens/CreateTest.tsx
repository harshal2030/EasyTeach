import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  InteractionManager,
} from 'react-native';
import {Header, Input, Text, Button, CheckBox} from 'react-native-elements';
import {StackNavigationProp} from '@react-navigation/stack';
import SnackBar from 'react-native-snackbar';
import Modal from 'react-native-modal';
import DocumentPicker from 'react-native-document-picker';
import DateTimePicker, {Event} from '@react-native-community/datetimepicker';
import axios from 'axios';
import {connect} from 'react-redux';
import {ImportExcel} from '../components/main';
import {RootStackParamList, QuizRes} from '../navigators/types';
import {Chip} from '../components/common';

import {StoreState} from '../global';
import {Class} from '../global/actions/classes';
import {TextStyles, ContainerStyles} from '../styles/styles';
import {commonBackground, commonGrey} from '../styles/colors';
import {quizUrl} from '../utils/urls';

type NavigationProp = StackNavigationProp<RootStackParamList, 'CreateTest'>;

interface Props {
  navigation: NavigationProp;
  token: string | null;
  currentClass: Class | null;
}

interface State {
  modalVisible: boolean;
  file: {
    name: string;
    type: string;
    uri: string;
  };
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
}

const CheckBoxComponent = (props: {
  checked: boolean;
  title: string;
  desc?: string;
  onPress(): any;
}) => {
  return (
    <>
      <CheckBox
        checked={props.checked}
        title={props.title}
        textStyle={styles.checkBoxText}
        onPress={props.onPress}
        iconRight
        containerStyle={styles.checkBoxContainer}
      />
      <Text style={styles.checkBoxDesc}>{props.desc}</Text>
    </>
  );
};

class CreateTest extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const today = new Date();
    today.setSeconds(0, 0);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setSeconds(0, 0);

    this.state = {
      modalVisible: false,
      file: {
        name: '',
        type: '',
        uri: '',
      },
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
    };
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() =>
      this.setState({modalVisible: true}),
    );
  }

  quizRequest = () => {
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

    axios
      .post<QuizRes>(
        `${quizUrl}/${this.props.currentClass!.id}`,
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
            Authorization: `Bearer ${this.props.token!}`,
          },
        },
      )
      .then((res) => {
        if (res.status === 201) {
          // @ts-ignore
          return this.props.navigation.navigate('Drawer', {
            screen: 'Test',
            params: {
              screen: 'TestHome',
              params: res.data,
            },
          });
        }
        throw new Error();
      })
      .catch(() =>
        SnackBar.show({
          text: 'Unable to create Test. Please try again later.',
          duration: SnackBar.LENGTH_SHORT,
        }),
      );
  };

  ImportSheet = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      this.setState({
        file: {name: res.name, type: res.type, uri: res.uri},
        modalVisible: false,
      });
    } catch (e) {
      if (!DocumentPicker.isCancel(e)) {
        SnackBar.show({
          text: 'Unable to get the sheet.',
          duration: SnackBar.LENGTH_SHORT,
        });
      }
    }
  };

  handleDate = (e: Event, dateTime?: Date) => {
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
      file,
      showPicker,
      timeRange,
      type,
      mode,
    } = this.state;

    return (
      <View style={ContainerStyles.parent}>
        <Header
          centerComponent={{
            text: 'Create Test',
            style: {fontSize: 24, color: '#fff', fontWeight: '600'},
          }}
          leftComponent={{
            icon: 'arrow-back',
            color: '#ffff',
            size: 26,
            onPress: () => this.setState({modalVisible: true}),
          }}
        />

        <ScrollView
          style={ContainerStyles.padder}
          keyboardShouldPersistTaps="handled">
          <Text h4 h4Style={TextStyles.h4Style}>
            Question Sheet
          </Text>
          <Chip
            text={file.name}
            onCrossPress={() =>
              this.setState({
                file: {name: '', type: '', uri: ''},
                modalVisible: true,
              })
            }
          />

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

          <CheckBoxComponent
            checked={releaseScore}
            onPress={() => this.setState({releaseScore: !releaseScore})}
            title="Show Score"
            desc="You can change it later, used to show score after test completion"
          />

          <CheckBoxComponent
            checked={randomQue}
            title="Randomize Question"
            onPress={() => this.setState({randomQue: !randomQue})}
            desc="Randomize questions order, it will select questions randomly if specified No. of Question is less than that of Question Sheet"
          />

          <CheckBoxComponent
            checked={randomOp}
            title="Randomize Options"
            onPress={() => this.setState({randomOp: !randomOp})}
            desc="Randomize order of options specified in question sheet"
          />

          <Button
            title="Create Test"
            containerStyle={styles.buttonStyle}
            onPress={this.quizRequest}
          />
        </ScrollView>

        <Modal
          isVisible={this.state.modalVisible}
          animationIn="slideInLeft"
          animationOut="slideOutLeft"
          onBackButtonPress={() => this.props.navigation.goBack()}
          // eslint-disable-next-line react-native/no-inline-styles
          style={{margin: 0}}>
          <ImportExcel
            onBackPress={() => this.props.navigation.goBack()}
            onImportPress={this.ImportSheet}
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
    marginVertical: 30,
  },
  checkBoxText: {
    ...TextStyles.h4Style,
    marginLeft: 0,
  },
  checkBoxContainer: {
    backgroundColor: commonBackground,
    padding: 0,
    marginLeft: 0,
  },
  checkBoxDesc: {
    color: commonGrey,
    marginLeft: 5,
    fontSize: 12,
  },
});

const mapStateToProps = (state: StoreState) => {
  return {
    token: state.token,
    currentClass: state.currentClass,
  };
};

export default connect(mapStateToProps)(CreateTest);
