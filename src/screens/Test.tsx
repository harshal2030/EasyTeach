import React from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import {CompositeNavigationProp} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {connect} from 'react-redux';

import {CommonTest} from '../components/main';

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

class Test extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    if (this.props.currentClass) {
      this.props.fetchQuiz(this.props.token!, this.props.currentClass.id);
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.currentClass?.id !== this.props.currentClass?.id) {
      this.props.fetchQuiz(this.props.token!, this.props.currentClass!.id);
    }
  }

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
      <CommonTest
        navigation={navigation}
        dataLoading={quizLoading}
        dataErrored={quizErrored}
        data={quizzes}
        headerText="Live"
        currentClassOwner={currentClass!.owner.name}
        user={profile.username}
      />
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
