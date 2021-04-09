import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SectionList,
  ActivityIndicator,
} from 'react-native';
import Modal from 'react-native-modal';
import {Header, Button} from 'react-native-elements';
import Octicons from 'react-native-vector-icons/Octicons';
import {connect} from 'react-redux';
import SnackBar from 'react-native-snackbar';
import DocumentPicker from 'react-native-document-picker';
import {StackNavigationProp} from '@react-navigation/stack';
import {CompositeNavigationProp} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';

import {Card} from '../components/common';
import {QuizInfo, ImportExcel} from '../components/main';

import {StoreState} from '../../shared/global';
import {Class} from '../../shared/global/actions/classes';
import {QuizRes, fetchQuiz, ObQuizRes} from '../../shared/global/actions/quiz';
import {RootStackParamList, DrawerParamList} from '../navigators/types';
import {
  commonBackground,
  commonBlue,
  flatRed,
  greyWithAlpha,
  commonGrey,
} from '../../shared/styles/colors';
import {ContainerStyles} from '../../shared/styles/styles';

type NavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DrawerParamList, 'Test'>,
  StackNavigationProp<RootStackParamList>
>;

interface Props {
  token: string | null;
  navigation: NavigationProp;
  currentClass: Class | null;
  quizErrored: boolean;
  quizLoading: boolean;
  quizzes: ObQuizRes;
  fetchQuiz(token: string, classId: string, quizType?: string): void;
  isOwner: boolean;
}

interface State {
  modalVisible: boolean;
  quiz: QuizRes | null;
  excelModal: boolean;
}

class Test extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      modalVisible: false,
      quiz: null,
      excelModal: false,
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

  onCardPress = (title: string, quiz: QuizRes) => {
    if (title === 'Live') {
      this.setState({modalVisible: true, quiz});
    }

    if (title === 'Expired') {
      SnackBar.show({
        text: 'This test has expired',
        backgroundColor: flatRed,
        duration: SnackBar.LENGTH_SHORT,
      });
    }

    if (title === 'Scored') {
      this.props.navigation.navigate('ShowScore', {
        quizId: quiz.quizId,
        title: quiz.title,
        questions: quiz.questions,
      });
    }
  };

  ImportSheet = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.xls, DocumentPicker.types.xlsx],
      });

      this.setState({excelModal: false});
      this.props.navigation.navigate('CreateTest', {
        file: {
          name: res.name,
          type: res.type,
          uri: res.uri,
        },
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

  renderItem = ({
    item,
    section: {title},
  }: {
    item: QuizRes;
    section: {title: string};
  }) => {
    return (
      <Card
        title={item.title}
        containerStyle={{margin: 10}}
        onPress={() => this.onCardPress(title, item)}
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

  renderSectionHeader = ({
    section: {title, data},
  }: {
    section: {title: string; data: QuizRes[]};
  }) => {
    if (data.length !== 0) {
      return <Text style={styles.sectionHeader}>{title}</Text>;
    }

    return null;
  };

  renderContent = () => {
    const {quizLoading, quizErrored, quizzes} = this.props;
    const data = [
      {
        title: 'Live',
        data: quizzes.live,
      },
      {
        title: 'Expired',
        data: quizzes.expired,
      },
      {
        title: 'Scored',
        data: quizzes.scored,
      },
    ];

    if (quizErrored) {
      return (
        <View style={ContainerStyles.centerElements}>
          <Text style={{padding: 10}}>
            We're having trouble in fetching test. Please try again later.
          </Text>
        </View>
      );
    }

    if (quizLoading) {
      return (
        <View style={ContainerStyles.centerElements}>
          <ActivityIndicator animating size="large" color={commonBlue} />
        </View>
      );
    }

    if (
      quizzes.live.length === 0 &&
      quizzes.expired.length === 0 &&
      quizzes.scored.length === 0
    ) {
      return (
        <View style={ContainerStyles.centerElements}>
          <Text>Nothing to show here right now</Text>
        </View>
      );
    }

    return (
      <SectionList
        sections={data}
        renderItem={this.renderItem}
        keyExtractor={(item) => item.quizId}
        renderSectionHeader={this.renderSectionHeader}
        style={{marginBottom: 30, paddingBottom: 30}}
        stickySectionHeadersEnabled
      />
    );
  };

  render() {
    return (
      <View style={[ContainerStyles.parent, {backgroundColor: '#fff'}]}>
        <Header
          centerComponent={{
            text: 'Tests',
            style: {fontSize: 24, color: '#ffff', fontWeight: '600'},
          }}
          leftComponent={{
            icon: 'menu',
            color: '#ffff',
            size: 26,
            onPress: () => this.props.navigation.openDrawer(),
          }}
        />
        {this.renderContent()}
        {this.props.isOwner && (
          <View style={styles.footerTextContainer}>
            <Text style={styles.footerText}>
              Scheduled tests are shown under live for owners
            </Text>
          </View>
        )}

        {this.props.isOwner && (
          <Button
            icon={<Octicons name="plus" size={26} color={commonBlue} />}
            containerStyle={styles.FABContainer}
            // eslint-disable-next-line react-native/no-inline-styles
            buttonStyle={{backgroundColor: '#ffff'}}
            onPress={() => this.setState({excelModal: true})}
          />
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

        <Modal
          isVisible={this.state.excelModal}
          animationIn="slideInLeft"
          animationOut="slideOutLeft"
          hideModalContentWhileAnimating
          onBackButtonPress={() => this.setState({excelModal: false})}
          // eslint-disable-next-line react-native/no-inline-styles
          style={{margin: 0}}>
          <ImportExcel
            onBackPress={() => this.setState({excelModal: false})}
            onImportPress={this.ImportSheet}
          />
        </Modal>
      </View>
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
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  footerText: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalStyle: {
    margin: 0,
  },
  FABContainer: {
    position: 'absolute',
    height: 60,
    width: 60,
    bottom: 50,
    right: 20,
    padding: 10,
    backgroundColor: '#ffff',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: commonGrey,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  sectionHeader: {
    fontSize: 23,
    padding: 5,
    fontWeight: '600',
    backgroundColor: '#fff',
    borderBottomWidth: 2,
    borderBottomColor: commonGrey,
  },
});

const mapStateToProps = (state: StoreState) => {
  return {
    token: state.token,
    currentClass: state.currentClass,
    quizLoading: state.quizLoading,
    quizErrored: state.quizErrored,
    quizzes: state.quizzes,
    isOwner: state.currentClass!.owner.username === state.profile.username,
  };
};

export default connect(mapStateToProps, {fetchQuiz})(Test);
