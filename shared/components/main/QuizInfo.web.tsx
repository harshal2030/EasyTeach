import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Header, Text, Button} from 'react-native-elements';
import BackIcon from '@iconify-icons/ic/arrow-back';

import {TouchableIcon} from '../../../web/components';

import {QuizRes} from '../../global/actions/quiz';
import {ContainerStyles} from '../../styles/styles';
import {commonGrey, flatRed} from '../../styles/colors';

interface Props {
  quiz: QuizRes;
  onBackPress(): void;
  onButtonPress(): void;
}

class QuizInfo extends React.PureComponent<Props> {
  render() {
    const {quiz} = this.props;
    return (
      <View style={ContainerStyles.parent}>
        <Header
          centerComponent={{
            text: 'About',
            style: {fontSize: 24, color: '#fff', fontWeight: '600'},
          }}
          leftComponent={
            <TouchableIcon
              icon={BackIcon}
              size={26}
              color="#fff"
              onPress={this.props.onBackPress}
            />
          }
        />

        <ScrollView style={ContainerStyles.padder}>
          <Text style={styles.headingStyle}>{quiz.title}</Text>
          <Text style={styles.normalText}>{quiz.description}</Text>

          <Text style={styles.expireText}>Expires On:</Text>
          <Text style={styles.timeRangeText}>
            {new Date(quiz.timePeriod[1].value).toString()}
          </Text>

          <Text style={{fontSize: 18}}>
            {`Things to note:
Screenshots on your phone are disabled while your Test is going on.`}
          </Text>
          {!this.props.quiz.allowBlur && (
            <Text style={{color: flatRed, fontSize: 19}}>
              Note: Changing screen will lock test for you.
            </Text>
          )}

          <Button
            title="Everything's OK! Move On"
            containerStyle={styles.buttonStyle}
            onPress={this.props.onButtonPress}
          />
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headingStyle: {
    fontSize: 24,
    fontWeight: '800',
  },
  normalText: {
    fontSize: 16,
  },
  unitStyle: {
    marginVertical: 10,
  },
  expireText: {
    fontSize: 20,
    fontWeight: '800',
    color: commonGrey,
    marginTop: 20,
    marginBottom: 8,
  },
  buttonStyle: {
    marginVertical: 20,
    marginBottom: 20,
  },
  timeRangeText: {
    fontSize: 18,
    textDecorationColor: commonGrey,
    textDecorationStyle: 'solid',
    textDecorationLine: 'underline',
    marginBottom: 20,
  },
});

export {QuizInfo};
