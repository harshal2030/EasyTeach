import React from 'react';
import {View, ScrollView, StyleSheet, TouchableOpacity} from 'react-native';
import {Header, Input, Text, Button, CheckBox} from 'react-native-elements';
import {StackNavigationProp} from '@react-navigation/stack';
import SnackBar from 'react-native-snackbar';
import Modal from 'react-native-modal';
import DocumentPicker from 'react-native-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

import {ImportExcel} from '../components/main';
import {RootStackParamList} from '../navigators/types';
import {Chip} from '../components/common';

import {TextStyles, ContainerStyles} from '../styles/styles';
import {commonBackground, commonGrey} from '../styles/colors';

type NavigationProp = StackNavigationProp<RootStackParamList, 'CreateTest'>;

interface Props {
  navigation: NavigationProp;
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
  startDatePicker: boolean;
  startTimePicker: boolean;
  stopDatePicker: boolean;
  stopTimePicker: boolean;
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

    this.state = {
      modalVisible: true,
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
      questions: '',
      startDatePicker: false,
      startTimePicker: false,
      stopDatePicker: false,
      stopTimePicker: false,
      timeRange: [today, new Date(today.getDate() + 1)],
    };
  }

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

  render() {
    const {
      questions,
      title,
      description,
      releaseScore,
      randomOp,
      randomQue,
      file,
      startDatePicker,
      startTimePicker,
      stopDatePicker,
      stopTimePicker,
      timeRange,
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

        <ScrollView style={ContainerStyles.padder}>
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
            <TouchableOpacity style={styles.timeRangeChild}>
              <Text style={styles.timeRangeText}>27-10-2020 9:30 AM</Text>
              <Text style={{color: commonGrey}}>Start Accepting Response</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.timeRangeChild}>
              <Text style={styles.timeRangeText}>28-10-2020 9:30 PM</Text>
              <Text style={{color: commonGrey}}>Stop Accepting Response</Text>
            </TouchableOpacity>
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

          <Button title="Create Test" containerStyle={styles.buttonStyle} />
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

export default CreateTest;
