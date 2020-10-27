import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {Header, Button, ButtonGroup} from 'react-native-elements';
import {connect} from 'react-redux';
import {StackNavigationProp} from '@react-navigation/stack';

import {StoreState} from '../global';
import {RootStackParamList} from '../navigators/types';

interface Props {
  questions: {
    question: string;
    options: string[];
    queId: string;
    selected: number | null;
  }[];
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
      questions: this.props.questions,
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

    const {questions} = this.props;
    const {currentIndex} = this.state;
    return (
      <View>
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

        <ScrollView style={{padding: 20}}>
          <Text style={{fontSize: 18, fontWeight: '500'}}>
            {questions[currentIndex].question}
          </Text>
          <ButtonGroup
            buttons={questions[currentIndex].options}
            onPress={this.updateSelected}
            buttonContainerStyle={buttonContainerStyle}
            buttonStyle={buttonStyle}
            textStyle={textStyle}
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

const mapStateToProps = (state: StoreState) => {
  return {
    questions: state.questions,
  };
};

export default connect(mapStateToProps)(Quiz);
