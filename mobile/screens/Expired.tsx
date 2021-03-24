import React from 'react';
import {View, Pressable, Text, StyleSheet} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {connect} from 'react-redux';
import {CompositeNavigationProp} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import SnackBar from 'react-native-snackbar';

import {CommonTest} from '../components/main';
import {Card} from '../components/common';

import {StoreState} from '../../shared/global';
import {Class} from '../../shared/global/actions/classes';
import {QuizRes, fetchQuiz} from '../../shared/global/actions/quiz';

import {
  RootStackParamList,
  DrawerParamList,
  BottomTabTestParamList,
} from '../navigators/types';
import {flatRed, greyWithAlpha} from '../../shared/styles/colors';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabTestParamList, 'TestHome'>,
  CompositeNavigationProp<
    DrawerNavigationProp<DrawerParamList>,
    StackNavigationProp<RootStackParamList>
  >
>;

interface Props {
  token: string | null;
  currentClass: Class | null;
  navigation: NavigationProp;
  isOwner: boolean;
  fetchQuiz(token: string, classId: string, quizType?: string): void;
  quizzes: QuizRes[];
  errored: boolean;
  loading: boolean;
}

class Expired extends React.Component<Props> {
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

  fetchQuiz = () => {
    this.props.fetchQuiz(
      this.props.token!,
      this.props.currentClass!.id,
      'expired',
    );
  };

  renderItem = ({item}: {item: QuizRes}) => {
    return (
      <Card
        title={item.title}
        containerStyle={{margin: 10}}
        expiresOn={new Date(item.timePeriod[1].value)}
        onPress={() =>
          SnackBar.show({
            text: 'This test has expired.',
            duration: SnackBar.LENGTH_SHORT,
            backgroundColor: flatRed,
          })
        }
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
    const {navigation, loading, errored} = this.props;
    return (
      <CommonTest
        navigation={navigation}
        dataLoading={loading}
        onRefreshPress={this.fetchQuiz}
        dataErrored={errored}
        renderItem={this.renderItem}
        data={this.props.quizzes}
        headerText="Expired"
        isOwner={this.props.isOwner}
      />
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
});

const mapStateToProps = (state: StoreState) => {
  return {
    token: state.token,
    currentClass: state.currentClass,
    isOwner: state.currentClass!.owner.username === state.profile.username,
    quizzes: state.quizzes.expired,
    errored: state.quizErrored.expired,
    loading: state.quizLoading.expired,
  };
};

export default connect(mapStateToProps, {fetchQuiz})(Expired);
