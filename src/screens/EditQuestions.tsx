import React from 'react';
import axios from 'axios';
import {View, Platform} from 'react-native';
import {Button, Header} from 'react-native-elements';
import {connect} from 'react-redux';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {ImageOrVideo} from 'react-native-image-crop-picker';
import RBSheet from 'react-native-raw-bottom-sheet';
import SnackBar from 'react-native-snackbar';

import {PhotoPicker} from '../components/common';

import {StoreState} from '../global';
import {Class} from '../global/actions/classes';
import {RootStackParamList} from '../navigators/types';
import {questionUrl} from '../utils/urls';

interface Props {
  navigation: StackNavigationProp<RootStackParamList, 'EditQuestions'>;
  route: RouteProp<RootStackParamList, 'EditQuestions'>;
  currentClass: Class;
  token: string;
}

interface State {
  photo: {
    uri: string;
    type: string;
  };
}

class EditQuestion extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      photo: {
        uri: '',
        type: '',
      },
    };
  }

  componentDidMount() {
    const url = `${questionUrl}/${this.props.currentClass.id}/${this.props.route.params.quizId}`;
    axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${this.props.token}`,
        },
      })
      .then((res) => console.log(res.data))
      .catch((e) => {
        console.log(e);
      });
  }

  sheet: RBSheet | null = null;
  update = () => {
    this.sheet?.open();
    const {photo} = this.state;
    const data = new FormData();
    data.append('image', {
      // @ts-ignore
      name: 'image.png',
      type: this.state.photo.uri,
      uri:
        Platform.OS === 'android'
          ? photo.uri
          : photo.uri.replace('file://', ''),
    });

    const url = `${questionUrl}/${this.props.currentClass.id}/quizId/queId`;
    console.log(url);

    axios
      .put(url, data, {
        headers: {
          Authorization: `Bearer ${this.props.token}`,
        },
      })
      .then((res) => console.log(res.status))
      .catch((e) => console.log(e, e.response));
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
    SnackBar.show({
      text: 'Unable to pick image.',
      duration: SnackBar.LENGTH_SHORT,
    });
    this.sheet!.close();
  };

  render() {
    return (
      <View>
        <Header
          centerComponent={{
            text: 'Edit Question',
            style: {fontSize: 24, color: '#fff', fontWeight: '600'},
          }}
          leftComponent={{
            icon: 'arrow-back',
            color: '#ffff',
            size: 26,
            onPress: () => this.props.navigation.goBack(),
          }}
        />
        <Button title="Send Req" onPress={this.update} />

        <PhotoPicker
          sheetRef={(ref) => (this.sheet = ref)}
          onCameraImage={this.onImage}
          onPickerImage={this.onImage}
          onCameraError={this.onImageError}
          onPickerError={this.onImageError}
        />
      </View>
    );
  }
}

const mapStateToProps = (state: StoreState) => {
  return {
    currentClass: state.currentClass!,
    token: state.token!,
  };
};

export default connect(mapStateToProps)(EditQuestion);
