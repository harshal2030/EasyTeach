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
  }[];
  navigation: StackNavigationProp<RootStackParamList>;
}

const Quiz = (props: Props) => {
  const [currentIndex, setCurrentIndex] = React.useState<number>(0);
  const {buttonContainer} = styles;

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
          onPress: () => props.navigation.goBack(),
        }}
      />

      <View style={buttonContainer}>
        <Button
          title="Previous"
          disabled={currentIndex === 0}
          onPress={() => setCurrentIndex(currentIndex - 1)}
        />
        <Button title="Submit" />
        <Button
          title="Next"
          disabled={currentIndex === props.questions.length - 1}
          onPress={() => setCurrentIndex(currentIndex + 1)}
        />
      </View>

      <ScrollView style={{padding: 20}}>
        <Text style={{fontSize: 16, fontWeight: '500'}}>
          {props.questions[currentIndex].question}
        </Text>
        <ButtonGroup
          buttons={props.questions[currentIndex].options}
          onPress={() => console.log('pressed')}
          buttonContainerStyle={{
            flex: 1,
            height: '100%',
          }}
          buttonStyle={{
            padding: 10,
          }}
          textStyle={{
            fontSize: 18,
            fontWeight: '600',
          }}
          vertical
          selectedIndex={0}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: '100%',
    justifyContent: 'space-between',
    flexDirection: 'row',
    padding: 20,
  },
});

const mapStateToProps = (state: StoreState) => {
  return {
    questions: state.questions,
  };
};

export default connect(mapStateToProps)(Quiz);
