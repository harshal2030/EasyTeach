import React from 'react';
import axios from 'axios';
import {
  ScrollView,
  Platform,
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {ButtonGroup, Button} from 'react-native-elements';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import RBSheet from 'react-native-raw-bottom-sheet';
import SnackBar from 'react-native-snackbar';
import {ImageOrVideo} from 'react-native-image-crop-picker';

import {PhotoPicker} from '../common';

import {
  commonGrey,
  flatRed,
  greyWithAlpha,
} from '../../../shared/styles/colors';
import {mediaUrl, questionUrl} from '../../../shared/utils/urls';

interface Props {
  queNo: number;
  totalQues: number;
  question: {
    question: string;
    options: string[];
    attachments: string;
    queId: string;
  };
  token: string;
  quizId: string;
  classId: string;
  onLoadNextPress: () => void;
  showPrevButton: boolean;
  onPrevPress: () => void;
}

interface State {
  photo: {
    uri: string;
    type: string;
  };
  loading: boolean;
}

class QuestionCard extends React.Component<Props, State> {
  sheet: RBSheet | null = null;
  constructor(props: Props) {
    super(props);

    this.state = {
      photo: {
        uri: props.question.attachments
          ? `${mediaUrl}/que/${props.question.attachments}`
          : 'none',
        type: 'image/png',
      },
      loading: false,
    };
  }

  onUpdatePress = () => {
    const {photo} = this.state;
    const {question, options, attachments, queId} = this.props.question;
    const {classId, quizId, token} = this.props;
    const data = new FormData();

    data.append(
      'info',
      JSON.stringify({
        question,
        options,
      }),
    );

    if (
      photo.uri !== 'none' &&
      photo.uri !== `${mediaUrl}/que/${attachments}`
    ) {
      data.append('media', {
        // @ts-ignore
        name: 'photo.jpeg',
        type: photo.type,
        uri:
          Platform.OS === 'android'
            ? photo.uri
            : photo.uri.replace('file://', ''),
      });
    }

    this.setState({loading: true});
    axios
      .put(`${questionUrl}/${classId}/${quizId}/${queId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        this.setState({loading: false});
        SnackBar.show({
          text: 'Question updated successfully.',
          duration: SnackBar.LENGTH_LONG,
        });
      })
      .catch(() => {
        this.setState({loading: false});
        SnackBar.show({
          text: 'Unable to update question at the moment.',
          duration: SnackBar.LENGTH_LONG,
          backgroundColor: flatRed,
        });
      });
  };

  onImage = (image: ImageOrVideo) => {
    this.sheet!.close();
    this.setState({
      photo: {
        uri: image.path,
        type: image.mime,
      },
    });
  };

  onImageError = () => {
    this.sheet!.close();
    SnackBar.show({
      text: 'Unable to pick image.',
      duration: SnackBar.LENGTH_SHORT,
    });
  };

  render() {
    const {queNo, totalQues, question} = this.props;
    return (
      <>
        <ScrollView>
          <Text style={{color: commonGrey}}>
            Question {queNo} of {totalQues}
          </Text>
          <Text style={styles.queText}>{question.question}</Text>

          <ImageBackground
            source={{uri: this.state.photo.uri}}
            style={styles.imageStyle}>
            <TouchableOpacity
              style={styles.imageOverlay}
              onPress={() => this.sheet!.open()}>
              <MaterialIcons name="camera-alt" color="#000" size={28} />
            </TouchableOpacity>
          </ImageBackground>

          <ButtonGroup
            buttons={question.options}
            disabled={true}
            buttonContainerStyle={styles.buttonContainerStyle}
            buttonStyle={styles.buttonStyle}
            textStyle={styles.textStyle}
            onPress={() => null}
            vertical
            selectedIndex={null}
          />

          <Button
            title="Update"
            containerStyle={styles.updateButton}
            loading={this.state.loading}
            onPress={this.onUpdatePress}
          />

          <PhotoPicker
            sheetRef={(ref) => (this.sheet = ref)}
            onCameraImage={this.onImage}
            onPickerImage={this.onImage}
            onCameraError={this.onImageError}
            onPickerError={this.onImageError}
            pickerProps={{cropping: true}}
            cameraProps={{cropping: true}}
          />

          {this.props.showPrevButton && (
            <Button
              containerStyle={styles.updateButton}
              title="Load previous questions"
              onPress={this.props.onPrevPress}
            />
          )}

          {queNo === 10 && (
            <Button
              containerStyle={styles.updateButton}
              title="Load next 10 question"
              onPress={this.props.onLoadNextPress}
            />
          )}
        </ScrollView>

        <View>
          <Text>Swipe left/right to change question</Text>
        </View>
      </>
    );
  }
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: '100%',
    justifyContent: 'space-between',
    flexDirection: 'row',
    padding: 20,
    backgroundColor: greyWithAlpha(0.2),
  },
  buttonContainerStyle: {
    flex: 1,
    height: '100%',
  },
  buttonStyle: {
    padding: 10,
  },
  textStyle: {
    fontSize: 18,
    fontWeight: '600',
  },
  queText: {
    fontSize: 20,
    fontWeight: '600',
  },
  imageOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: greyWithAlpha(0.4),
  },
  imageStyle: {
    height: 100,
    width: '100%',
    margin: 10,
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#000',
  },
  updateButton: {
    width: '95%',
    alignSelf: 'center',
    marginTop: 20,
  },
});

export {QuestionCard};
