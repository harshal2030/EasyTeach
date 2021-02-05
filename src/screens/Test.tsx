import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import Modal from 'react-native-modal';
import {StackNavigationProp} from '@react-navigation/stack';
import {CompositeNavigationProp} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {connect} from 'react-redux';

import {Card} from '../components/common';
import {CommonTest, QuizInfo} from '../components/main';

import {StoreState} from '../global';
import {Class} from '../global/actions/classes';
import {QuizRes, fetchQuiz} from '../global/actions/quiz';
import {
  RootStackParamList,
  DrawerParamList,
  BottomTabTestParamList,
} from '../navigators/types';
import {commonBackground, greyWithAlpha} from '../styles/colors';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabTestParamList, 'TestHome'>,
  CompositeNavigationProp<
    DrawerNavigationProp<DrawerParamList>,
    StackNavigationProp<RootStackParamList>
  >
>;

interface Props {
  token: string | null;
  navigation: NavigationProp;
  profile: {name: string; username: string; avatar: string};
  currentClass: Class | null;
  quizErrored: boolean;
  quizLoading: boolean;
  quizzes: QuizRes[];
  fetchQuiz(token: string, classId: string, quizType?: string): void;
}

interface State {
  modalVisible: boolean;
  quiz: QuizRes | null;
}

class Test extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      modalVisible: false,
      quiz: null,
    };
  }

  componentDidMount() {
    if (this.props.currentClass) {
      this.props.fetchQuiz(this.props.token!, this.props.currentClass.id);
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.currentClass!.id !== this.props.currentClass!.id) {
      this.props.fetchQuiz(this.props.token!, this.props.currentClass!.id);
    }
  }

  renderItem = ({item}: {item: QuizRes}) => {
    return (
      <Card
        title={item.title}
        containerStyle={{margin: 10}}
        onPress={() => this.setState({modalVisible: true, quiz: item})}
        expiresOn={new Date(item.timePeriod[1].value)}
        collapseComponent={
          <View style={styles.collapseContainer}>
            <Pressable
              style={styles.collapseButton}
              onPress={() =>
                this.props.navigation.navigate('CreateTest', {
                  quizId: item.quizId,
                })
              }>
              <Text style={styles.collapseText}>Edit</Text>
            </Pressable>
            <Pressable
              style={styles.collapseButton}
              onPress={() =>
                this.props.navigation.navigate('EditQuestion', {
                  quizId: item.quizId,
                })
              }>
              <Text style={styles.collapseText}>Edit Questions</Text>
            </Pressable>
          </View>
        }
      />
    );
  };

  render() {
    const {
      navigation,
      profile,
      currentClass,
      quizLoading,
      quizErrored,
      quizzes,
    } = this.props;

    return (
      <>
        <CommonTest
          navigation={navigation}
          dataLoading={quizLoading}
          dataErrored={quizErrored}
          data={quizzes}
          headerText="Live"
          renderItem={this.renderItem}
          currentClassOwner={currentClass!.owner.username}
          user={profile.username}
        />
        {currentClass!.owner.username === profile.username && (
          <View
            style={{
              padding: 3,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: commonBackground,
            }}>
            <Text style={{fontSize: 16, fontWeight: '800'}}>
              Scheduled tests are also shown here for owners
            </Text>
          </View>
        )}

        <Modal
          isVisible={this.state.modalVisible}
          style={{margin: 0}}
          hideModalContentWhileAnimating
          onBackButtonPress={() => this.setState({modalVisible: false})}>
          <QuizInfo
            quiz={this.state.quiz!}
            onButtonPress={() => {
              this.setState({modalVisible: false});
              this.props.navigation.navigate('Quiz', {
                quizId: this.state.quiz!.quizId,
                title: this.state.quiz!.title,
              });
            }}
            onBackPress={() => this.setState({modalVisible: false})}
          />
        </Modal>
      </>
    );
  }
}

const styles = StyleSheet.create({
  collapseContainer: {
    marginLeft: 30,
    flexDirection: 'row',
  },
  collapseButton: {
    marginHorizontal: 5,
    padding: 3,
    marginTop: 5,
    borderWidth: 1,
    borderColor: greyWithAlpha(0.8),
    backgroundColor: greyWithAlpha(0.2),
  },
  collapseText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#003',
  },
});

const mapStateToProps = (state: StoreState) => {
  return {
    token: state.token,
    profile: state.profile,
    currentClass: state.currentClass,
    quizLoading: state.quizLoading,
    quizErrored: state.quizErrored,
    quizzes: state.quizzes,
  };
};

export default connect(mapStateToProps, {fetchQuiz})(Test);
