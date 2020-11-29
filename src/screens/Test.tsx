import React from 'react';
import Octicons from 'react-native-vector-icons/Octicons';
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
        rightComponent={
          <Octicons
            name="gear"
            size={16}
            onPress={() =>
              this.props.navigation.navigate('CreateTest', {
                quizId: item.quizId,
              })
            }
          />
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
          currentClassOwner={currentClass!.owner.name}
          user={profile.username}
        />

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
