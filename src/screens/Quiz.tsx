import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {Header, Button, ButtonGroup} from 'react-native-elements';
import {StackNavigationProp} from '@react-navigation/stack';

import {RootStackParamList} from '../navigators/types';
import {ContainerStyles} from '../styles/styles';

interface Props {
  navigation: StackNavigationProp<RootStackParamList>;
}

interface State {
  currentIndex: number;
  questions: {
    question: string;
    options: string[];
    queId: string;
    selected: number | null;
  }[];
}

class Quiz extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      currentIndex: 0,
      questions: [
        {
          queId: '1',
          question:
            'This is question one fasdfasdfasdfasdfasdfasdfasdfasdfasdfasf.',
          options: ['op1', 'op2', 'op3', 'op4'],
          selected: null,
        },
        {
          queId: '2',
          question: 'This is question two.',
          options: ['tw1', 'tw2', 'tw3', 'tw4'],
          selected: null,
        },
        {
          queId: '3',
          question: 'This is question three.',
          options: ['th1', 'th2', 'th3', 'th4'],
          selected: null,
        },
        {
          queId: '4',
          question: 'This is question four.',
          options: ['fo1', 'fo2', 'fo3', 'fo4'],
          selected: null,
        },
        {
          queId: '5',
          question: 'This is question five.',
          options: ['fi1', 'fi2', 'fi3', 'fi4'],
          selected: null,
        },
        {
          queId: '6',
          question: 'This is question six.',
          options: ['si1', 'si2', 'si3', 'si4'],
          selected: null,
        },
      ],
    };
  }

  updateSelected = (i: number) => {
    const {currentIndex, questions} = this.state;
    const temp = [...questions];
    temp[currentIndex].selected = i;
    this.setState({questions: temp});
  };

  render() {
    const {
      buttonContainer,
      buttonContainerStyle,
      buttonStyle,
      textStyle,
    } = styles;

    const {currentIndex, questions} = this.state;
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

        <View style={buttonContainer}>
          <Button
            title="Previous"
            disabled={currentIndex === 0}
            onPress={() => this.setState({currentIndex: currentIndex - 1})}
          />
          <Button title="Submit" />
          <Button
            title="Next"
            disabled={currentIndex === questions.length - 1}
            onPress={() => this.setState({currentIndex: currentIndex + 1})}
          />
        </View>

        <ScrollView style={ContainerStyles.padder}>
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

export default Quiz;
