import React from 'react';
import axios from 'axios';
import {
  View,
  ImageBackground,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {ButtonGroup} from 'react-native-elements';
import CameraAlt from '@iconify-icons/ic/round-camera-alt';

import {TouchableIcon} from '../components';

import {commonBackground, greyWithAlpha} from '../../shared/styles/colors';
import {staticImageExtPattern} from '../../shared/utils/regexPatterns';
import {mediaUrl, questionUrl} from '../../shared/utils/urls';

type Questions = {
  question: string;
  options: string[];
  queId: string;
  score: number;
  attachments: string | undefined;
};

type Props = {
  question: Questions;
  onInvalidFile(): void;
  onUploadSuccess(): void;
  onUploadFail(): void;
  classId: string;
  quizId: string;
  token: string;
};

type State = {
  image: File | null;
  previewImage: string;
};

class QuestionCard extends React.Component<Props, State> {
  upload: HTMLInputElement | null = null;
  constructor(props: Props) {
    super(props);

    this.state = {
      image: null,
      previewImage: props.question.attachments
        ? `${mediaUrl}/que/${this.props.question.attachments}`
        : '',
    };
  }

  onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!staticImageExtPattern.test(file.name)) {
        return this.props.onInvalidFile();
      }

      this.setState({previewImage: URL.createObjectURL(file)});

      const {question, options, queId} = this.props.question;
      const {classId, quizId, token} = this.props;
      const data = new FormData();

      data.append(
        'info',
        JSON.stringify({
          question,
          options,
        }),
      );

      data.append('media', file, file.name);

      axios
        .put(`${questionUrl}/${classId}/${quizId}/${queId}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(this.props.onUploadSuccess)
        .catch(this.props.onUploadFail);
    }
  };

  render() {
    return (
      <View style={styles.queContainer}>
        <input
          type="file"
          accept="image/*"
          onChange={this.onFile}
          style={{display: 'none'}}
          ref={(ref) => (this.upload = ref)}
        />
        <Text style={styles.queText}>{this.props.question.question}</Text>

        <ImageBackground
          source={{uri: this.state.previewImage}}
          style={styles.imageStyle}>
          <TouchableOpacity
            style={styles.imageOverlay}
            onPress={() => this.upload!.click()}>
            <TouchableIcon icon={CameraAlt} size={28} color="#000" />
          </TouchableOpacity>
        </ImageBackground>

        <ButtonGroup
          buttons={this.props.question.options}
          disabled={true}
          containerStyle={styles.buttonContainerStyle}
          buttonStyle={styles.buttonStyle}
          textStyle={styles.textStyle}
          onPress={() => null}
          vertical
          selectedIndex={null}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  queContainer: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 2,
    margin: 5,
    backgroundColor: commonBackground,
  },
  queText: {
    fontSize: 20,
    fontWeight: '600',
  },
  buttonContainerStyle: {
    marginRight: 0,
    marginLeft: 0,
  },
  buttonStyle: {
    padding: 10,
  },
  textStyle: {
    fontSize: 18,
    fontWeight: '600',
  },
  imageStyle: {
    height: 100,
    width: '100%',
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#000',
  },
  imageOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: greyWithAlpha(0.4),
  },
});

export default QuestionCard;
