import React from 'react';
import {
  ScrollView,
  Text,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {ButtonGroup} from 'react-native-elements';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import RBSheet from 'react-native-raw-bottom-sheet';
import SnackBar from 'react-native-snackbar';
import {ImageOrVideo} from 'react-native-image-crop-picker';

import {PhotoPicker} from '../common';

import {commonGrey, greyWithAlpha} from '../../styles/colors';

interface Props {
  queNo: number;
  totalQues: number;
  question: {
    question: string;
    options: string[];
    attachments: string;
  };
}

interface State {
  photo: {
    uri: string;
    type: string;
  };
}

class QuestionCard extends React.Component<Props, State> {
  sheet: RBSheet | null = null;
  constructor(props: Props) {
    super(props);

    this.state = {
      photo: {
        uri: 'none',
        type: 'image/png',
      },
    };
  }

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

        <PhotoPicker
          sheetRef={(ref) => (this.sheet = ref)}
          onCameraImage={this.onImage}
          onPickerImage={this.onImage}
          onCameraError={this.onImageError}
          onPickerError={this.onImageError}
          pickerProps={{cropping: true}}
          cameraProps={{cropping: true}}
        />
      </ScrollView>
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
});

export {QuestionCard};
