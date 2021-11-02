import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  ActivityIndicator,
  Platform,
  Linking,
  ActionSheetIOS,
} from 'react-native';
import Modal from 'react-native-modal';
import {Header, Button, Icon} from 'react-native-elements';
import Octicons from 'react-native-vector-icons/Octicons';
import {connect} from 'react-redux';
import SnackBar from 'react-native-snackbar';
import DocumentPicker from 'react-native-document-picker';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CompositeNavigationProp} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import AndroidPicker from 'react-native-android-dialog-picker';
import Share from 'react-native-share';

import {HeaderBadge} from '../../shared/components/common';
import {Card} from '../../shared/components/common';
import {QuizInfo, ImportExcel} from '../../shared/components/main';

import {StoreState} from '../../shared/global';
import {Class} from '../../shared/global/actions/classes';
import {
  fetchQuiz,
  QuizPayload,
  QuizRes,
} from '../../shared/global/actions/quiz';
import {RootStackParamList, DrawerParamList} from '../navigators/types';
import {
  commonBackground,
  commonBlue,
  flatRed,
  commonGrey,
} from '../../shared/styles/colors';
import {ContainerStyles} from '../../shared/styles/styles';
import {resultUrl} from '../../shared/utils/urls';

type NavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DrawerParamList, 'Test'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface Props {
  token: string | null;
  navigation: NavigationProp;
  currentClass: Class | null;
  quizzes: QuizPayload;
  fetchQuiz(token: string, classId: string, updating?: boolean): void;
  isOwner: boolean;
  unread: number;
}

interface State {
  modalVisible: boolean;
  quiz: QuizRes | null;
  excelModal: boolean;
}

const Test: React.FC<Props> = (props) => {
  const [quizModal, setQuizModal] = useState<boolean>(false);
  const [quiz, setQuiz] = useState<QuizRes | null>(null);
  const [excelModal, setExcelModal] = useState<boolean>(false);

  useEffect(() => {
    if (props.currentClass) {
      props.fetchQuiz(props.token!, props.currentClass!.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.currentClass]);

  const shareTest = (quizId: string) => {
    Share.open({
      title: 'Open Test on EasyTeach',
      message: `Open test on EasyTeach through this link https://easyteach.inddex.co/quiz/${props.currentClass?.id}/${quizId}. Download app from https://play.google.com/store/apps/details?id=com.hcodes.easyteach`,
    })
      .then(() => null)
      .catch(() => null);
  };

  const importSheet = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.xls, DocumentPicker.types.xlsx],
        allowMultiSelection: false,
      });

      setExcelModal(false);
      props.navigation.navigate('CreateTest', {
        file: {
          name: res[0].name,
          type:
            res[0].type ||
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          uri: res[0].uri,
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

  const onGearPress = (quizId: string) => {
    const {navigation, currentClass} = props;
    if (Platform.OS === 'android') {
      AndroidPicker.show(
        {
          title: 'Choose Option',
          items: ['Edit Quiz', 'Download Result', 'Share test link'],
          cancelText: 'Cancel',
        },
        (index) => {
          if (index === 0) {
            navigation.navigate('CreateTest', {quizId});
            return;
          }

          if (index === 1) {
            Linking.openURL(`${resultUrl}/file/${currentClass!.id}/${quizId}`);
            return;
          }

          if (index === 2) {
            shareTest(quizId);
            return;
          }
        },
      );
    } else {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: 'Choose Option',
          options: [
            'Edit Quiz',
            'Download Result',
            'Share Test Link',
            'Cancel',
          ],
          cancelButtonIndex: 3,
        },
        (index) => {
          if (index === 0) {
            return navigation.navigate('CreateTest', {quizId});
          }

          if (index === 1) {
            return Linking.openURL(
              `${resultUrl}/file/${currentClass!.id}/${quizId}`,
            );
          }

          if (index === 2) {
            shareTest(quizId);
            return;
          }
        },
      );
    }
  };

  const onCardPress = (title: string, quiz: QuizRes) => {
    if (title === 'Live') {
      setQuizModal(true);
      setQuiz(quiz);
    }

    if (title === 'Expired') {
      SnackBar.show({
        text: 'This test has expired',
        backgroundColor: flatRed,
        duration: SnackBar.LENGTH_SHORT,
      });
    }

    if (title === 'Scored') {
      props.navigation.navigate('ShowScore', {
        quizId: quiz.quizId,
        title: quiz.title,
        questions: quiz.questions,
      });
    }
  };

  const renderItem = ({
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
        onPress={() => onCardPress(title, item)}
        expiresOn={new Date(item.timePeriod[1].value)}
        isOwner={props.isOwner}
        onGearPress={() => onGearPress(item.quizId)}
      />
    );
  };

  const renderSectionHeader = ({
    section: {title, data},
  }: {
    section: {title: string; data: QuizRes[]};
  }) => {
    if (data.length !== 0) {
      return <Text style={styles.sectionHeader}>{title}</Text>;
    }

    return null;
  };

  const renderContent = () => {
    const {loading, errored, quizzes} = props.quizzes;
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

    if (errored) {
      return (
        <View style={ContainerStyles.centerElements}>
          <Text style={{padding: 10}}>
            We're having trouble in fetching test. Please try again later.
          </Text>
        </View>
      );
    }

    if (loading) {
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
        renderItem={renderItem}
        keyExtractor={(item) => item.quizId}
        renderSectionHeader={renderSectionHeader}
        ListFooterComponent={<View style={{height: 80}} />}
        style={{marginBottom: 30, paddingBottom: 30}}
        stickySectionHeadersEnabled
      />
    );
  };

  const {unread} = props;
  return (
    <View style={[ContainerStyles.parent, {backgroundColor: '#fff'}]}>
      <Header
        centerComponent={{
          text: 'Tests',
          style: {fontSize: 24, color: '#ffff', fontWeight: '600'},
        }}
        leftComponent={
          <>
            <Icon
              name="menu"
              tvParallaxProperties
              size={26}
              onPress={props.navigation.openDrawer}
              color="#ffff"
            />
            {unread !== 0 ? <HeaderBadge /> : null}
          </>
        }
      />
      {renderContent()}
      {props.isOwner && (
        <View style={styles.footerTextContainer}>
          <Text style={styles.footerText}>
            Scheduled tests are shown under live for owners
          </Text>
        </View>
      )}

      {props.isOwner && (
        <Button
          icon={<Octicons name="plus" size={26} color={commonBlue} />}
          containerStyle={styles.FABContainer}
          // eslint-disable-next-line react-native/no-inline-styles
          buttonStyle={{backgroundColor: '#ffff'}}
          onPress={() => setExcelModal(true)}
        />
      )}
      <Modal
        isVisible={quizModal}
        style={styles.modalStyle}
        hideModalContentWhileAnimating
        onBackButtonPress={() => setQuizModal(false)}>
        <QuizInfo
          quiz={quiz!}
          onButtonPress={() => {
            setQuizModal(false);
            props.navigation.navigate('Quiz', {
              quizId: quiz!.quizId,
              title: quiz!.title,
            });
          }}
          onBackPress={() => setQuizModal(false)}
        />
      </Modal>

      <Modal
        isVisible={excelModal}
        animationIn="slideInLeft"
        animationOut="slideOutLeft"
        hideModalContentWhileAnimating
        onBackButtonPress={() => setExcelModal(false)}
        // eslint-disable-next-line react-native/no-inline-styles
        style={{margin: 0}}>
        <ImportExcel
          onBackPress={() => setExcelModal(false)}
          onImportPress={importSheet}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
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
    quizzes: state.quizzes[state.currentClass?.id || 'test'] || {
      loading: true,
      errored: false,
      quizzes: {
        live: [],
        expired: [],
        scored: [],
      },
    },
    isOwner: state.currentClass!.owner.username === state.profile.username,
    unread: state.unreads.totalUnread,
  };
};

export default connect(mapStateToProps, {fetchQuiz})(Test);
