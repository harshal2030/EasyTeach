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

import {StoreState} from '../../shared/global';
import {Class} from '../../shared/global/actions/classes';
import {QuizRes, fetchQuiz} from '../../shared/global/actions/quiz';
import {
  RootStackParamList,
  DrawerParamList,
  BottomTabTestParamList,
} from '../navigators/types';
import {commonBackground, greyWithAlpha} from '../../shared/styles/colors';

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
  currentClass: Class | null;
  quizErrored: boolean;
  quizLoading: boolean;
  quizzes: QuizRes[];
  fetchQuiz(token: string, classId: string, quizType?: string): void;
  isOwner: boolean;
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

  fetchQuiz = () => {
    this.props.fetchQuiz(this.props.token!, this.props.currentClass!.id);
  };

  componentDidMount() {
    if (this.props.currentClass) {
      this.fetchQuiz();
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.currentClass!.id !== this.props.currentClass!.id) {
      this.fetchQuiz();
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
          this.props.isOwner ? (
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
          ) : null
        }
      />
    );
  };

  render() {
    const {navigation, isOwner, quizLoading, quizErrored, quizzes} = this.props;

    return (
      <>
        <CommonTest
          navigation={navigation}
          dataLoading={quizLoading}
          dataErrored={quizErrored}
          data={quizzes}
          onRefreshPress={this.fetchQuiz}
          headerText="Live"
          renderItem={this.renderItem}
          isOwner={this.props.isOwner}
        />
        {isOwner && (
          <View style={styles.footerTextContainer}>
            <Text style={styles.footerText}>
              Scheduled tests are also shown here for owners
            </Text>
          </View>
        )}

        <Modal
          isVisible={this.state.modalVisible}
          style={styles.modalStyle}
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
    borderRadius: 2,
  },
  collapseText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#003',
  },
  footerTextContainer: {
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: commonBackground,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalStyle: {
    margin: 0,
  },
});

const mapStateToProps = (state: StoreState) => {
  return {
    token: state.token,
    currentClass: state.currentClass,
    quizLoading: state.quizLoading.live,
    quizErrored: state.quizErrored.live,
    quizzes: state.quizzes.live,
    isOwner: state.currentClass!.owner.username === state.profile.username,
  };
};

export default connect(mapStateToProps, {fetchQuiz})(Test);
