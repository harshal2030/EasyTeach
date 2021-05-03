import React from 'react';
import {View, Text} from 'react-native';
import {Header, FAB, Button, Input} from 'react-native-elements';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import Picker from 'react-native-image-crop-picker';
import Upload from 'react-native-background-upload';
import {VideoPlayer} from '../components/main/VideoPlayer';
import {connect} from 'react-redux';
import Modal from 'react-native-modal';

import {StoreState} from '../../shared/global';
import {Class} from '../../shared/global/actions/classes';

import {RootStackParamList} from '../navigators/types';
import {commonBlue} from '../../shared/styles/colors';
import {fileUrl} from '../../shared/utils/urls';

type navigation = StackNavigationProp<RootStackParamList, 'Files'>;

type Props = {
  navigation: navigation;
  currentClass: Class;
  route: RouteProp<RootStackParamList, 'Files'>;
  token: string;
};

type State = {
  videoUri: string | null;
  videoModal: boolean;
  videoTitle: string;
};

class Files extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      videoUri: null,
      videoModal: false,
      videoTitle: '',
    };
  }

  onVideoPress = () => {
    Picker.openPicker({
      mediaType: 'video',
    })
      .then((res) => this.setState({videoUri: res.path, videoModal: true}))
      .catch((e) => console.log(e));
  };

  uploadVideo = (path: string) => {
    Upload.startUpload({
      url: `${fileUrl}/${this.props.currentClass.id}/${this.props.route.params.moduleId}`,
      path,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.props.token}`,
      },
      notification: {
        enabled: true,
      },
      type: 'multipart',
      field: 'file',
      parameters: {
        title: 'Large File',
      },
    }).then((id) => {
      console.log(id);
    });
  };

  render() {
    return (
      <View style={{flex: 1}}>
        <Header
          centerComponent={{
            text: 'Files',
            style: {fontSize: 24, color: '#ffff', fontWeight: '600'},
          }}
          leftComponent={{
            icon: 'arrow-back',
            color: '#ffff',
            size: 26,
            onPress: this.props.navigation.goBack,
          }}
          rightComponent={{
            icon: 'refresh-ccw',
            type: 'feather',
            size: 20,
            color: '#ffff',
          }}
          rightContainerStyle={{justifyContent: 'center'}}
        />

        <Text>Hello files</Text>

        <Modal isVisible={this.state.videoModal}>
          <VideoPlayer
            source={{uri: this.state.videoUri!}}
            style={{height: 400, width: '100%'}}
          />
          <Input
            placeholder="Title"
            value={this.state.videoTitle}
            onChangeText={(videoTitle) => this.setState({videoTitle})}
          />
          <Button title="Upload Video" />
        </Modal>

        <FAB
          placement="right"
          upperCase
          title="Add Video"
          onPress={this.onVideoPress}
          icon={{name: 'plus', type: 'octicon', color: '#fff'}}
          color={commonBlue}
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

export default connect(mapStateToProps)(Files);
