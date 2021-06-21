import React, {useEffect, useState} from 'react';
import {View, ScrollView, StyleSheet, Text, Image} from 'react-native';
import {Header, Button} from 'react-native-elements';
import {useHistory, useParams} from 'react-router-dom';
import {connect} from 'react-redux';
import Modal from 'react-native-modal';
import LightBox from 'react-native-lightbox-v2';
import BackIcon from '@iconify-icons/ic/arrow-back';
import {toast} from 'react-toastify';

import {TouchableIcon} from '../components';
import {CreateQuestionCard} from '../components/CreateQuestionCard';

import {StoreState} from '../../shared/global/index.web';
import {Class, registerCurrentClass} from '../../shared/global/actions/classes';
import {
  Question,
  addQuestion,
  emptyQuestions,
} from '../../shared/global/actions/questions';

import {ContainerStyles} from '../../shared/styles/styles';
import {
  eucalyptusGreen,
  flatRed,
  greyWithAlpha,
} from '../../shared/styles/colors';

type Props = {
  classes: Class[];
  registerCurrentClass: typeof registerCurrentClass;
  questions: Question[];
  addQuestion: typeof addQuestion;
  emptyQuestions: typeof emptyQuestions;
};

type FullScreenImageProps = {
  url: string;
};

const FullScreenImage = (props: FullScreenImageProps) => {
  return (
    <Image
      source={{uri: props.url}}
      style={{height: '100%', width: '100%'}}
      resizeMode="contain"
    />
  );
};

const CreateSheet: React.FC<Props> = (props) => {
  const [modalVisible, setModalVisible] = useState(false);
  const history = useHistory();
  const params = useParams<{classId: string}>();

  useEffect(() => {
    const {classId} = params;
    const {classes} = props;

    const classFound = classes.find((cls) => cls.id === classId);

    if (classFound) {
      props.registerCurrentClass(classFound);
    } else {
      history.replace('/*');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.classId, props.classes]);

  const onContinuePress = () => {
    if (props.questions.length === 0) {
      toast.error('At least one question is required');
      return;
    }

    history.replace(`/createtest/${params.classId}`);
  };

  return (
    <View style={ContainerStyles.parent}>
      <Header
        centerComponent={{
          text: 'Create Questions',
          style: {fontSize: 24, color: '#fff', fontWeight: '600'},
        }}
        leftComponent={
          <TouchableIcon
            icon={BackIcon}
            color="#fff"
            size={26}
            onPress={history.goBack}
          />
        }
      />

      <Modal
        isVisible={modalVisible}
        propagateSwipe
        onBackdropPress={() => setModalVisible(false)}
        style={styles.modalStyle}>
        <ScrollView>
          {props.questions.map((que, i) => {
            return (
              <View key={i} style={styles.questionContainer}>
                <Text style={styles.question}>{`Q.${i + 1} ${
                  que.question
                }`}</Text>

                {que.image && (
                  <LightBox
                    renderContent={() => (
                      <FullScreenImage url={URL.createObjectURL(que.image)} />
                    )}>
                    <Image
                      source={{uri: URL.createObjectURL(que.image)}}
                      style={styles.questionImage}
                      resizeMode="contain"
                    />
                  </LightBox>
                )}

                <View style={styles.opContainer}>
                  {que.options.map((op, j) => {
                    console.log(op, que.correct);
                    const color = op === que.correct ? eucalyptusGreen : '#000';
                    return (
                      <Text key={j} style={{color}}>
                        {op}
                      </Text>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </Modal>

      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={styles.contentContainer}>
        <CreateQuestionCard onAddQuestionPress={props.addQuestion} />
      </ScrollView>

      <View style={styles.footerContainer}>
        <Button
          title="Continue"
          containerStyle={styles.footerButtons}
          buttonStyle={{backgroundColor: eucalyptusGreen}}
          onPress={onContinuePress}
        />

        <Button
          title={`Show Questions (${props.questions.length})`}
          containerStyle={styles.footerButtons}
          onPress={() => setModalVisible(true)}
        />
        <Button
          title="Cancel"
          type="outline"
          buttonStyle={{borderColor: flatRed}}
          titleStyle={{color: flatRed}}
          containerStyle={styles.footerButtons}
          onPress={() => {
            props.emptyQuestions();
            history.goBack();
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    padding: 20,
    backgroundColor: greyWithAlpha(0.1),
    flexDirection: 'row',
  },
  footerButtons: {
    marginHorizontal: 20,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  modalStyle: {
    backgroundColor: '#fff',
    padding: 20,
  },
  question: {
    fontWeight: '600',
    fontSize: 17,
  },
  questionImage: {
    height: 150,
    width: '100%',
    backgroundColor: greyWithAlpha(0.1),
  },
  opContainer: {
    marginTop: 10,
    marginLeft: 20,
  },
  questionContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    padding: 20,
    margin: 10,
  },
});

const mapStateToProps = (state: StoreState) => {
  return {
    classes: state.classes,
    token: state.token!,
    questions: state.questions,
  };
};

export default connect(mapStateToProps, {
  registerCurrentClass,
  addQuestion,
  emptyQuestions,
})(CreateSheet);
