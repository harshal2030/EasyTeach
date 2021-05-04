import React from 'react';
import axios from 'axios';
import {
  View,
  ScrollView,
  Alert,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {Header, FAB, Button, Input} from 'react-native-elements';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import Picker from 'react-native-image-crop-picker';
import Upload from 'react-native-background-upload';
import FastImage from 'react-native-fast-image';
import {VideoPlayer} from '../components/main/VideoPlayer';
import {connect} from 'react-redux';
import Modal from 'react-native-modal';
import SnackBar from 'react-native-snackbar';
import AD from 'react-native-vector-icons/AntDesign';

import {StoreState} from '../../shared/global';
import {Class} from '../../shared/global/actions/classes';

import {RootStackParamList} from '../navigators/types';
import {commonBlue, commonGrey} from '../../shared/styles/colors';
import {fileUrl} from '../../shared/utils/urls';
import {flatRed} from '../../shared/styles/colors';
import {ContainerStyles} from '../../shared/styles/styles';

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
  files: FileRes[];
  loading: boolean;
  errored: boolean;
};

type FileRes = {
  id: string;
  title: string;
  moduleId: string;
  filename: string;
  preview: string | null;
  createdAt: Date;
};

class Files extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      videoUri: null,
      videoModal: false,
      videoTitle: '',
      files: [],
      loading: true,
      errored: false,
    };
  }

  componentDidMount() {
    this.getModules();
  }

  getModules = async () => {
    try {
      const res = await axios.get<FileRes[]>(
        `${fileUrl}/${this.props.currentClass.id}/${this.props.route.params.moduleId}`,
        {
          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
        },
      );

      this.setState({files: res.data, loading: false});
    } catch (e) {
      this.setState({errored: true, loading: false});
    }
  };

  onVideoPress = () => {
    Picker.openPicker({
      mediaType: 'video',
    })
      .then((res) => this.setState({videoUri: res.path, videoModal: true}))
      .catch((e) => console.log(e));
  };

  uploadVideo = () => {
    if (this.state.videoTitle.trim().length === 0) {
      return Alert.alert('', 'Please enter the video title to upload');
    }

    const path = this.state.videoUri!.replace('file://', '');

    Upload.startUpload({
      url: `${fileUrl}/${this.props.currentClass.id}/${this.props.route.params.moduleId}`,
      path,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.props.token}`,
      },
      notification: {
        enabled: true,
        onProgressTitle: 'Uploading ....',
        onCompleteTitle: 'Uploaded successfully',
        onErrorTitle: 'Uploading errored. Please try again later',
      },
      type: 'multipart',
      field: 'file',
      parameters: {
        title: this.state.videoTitle,
      },
    })
      .then(() => {
        this.setState({videoModal: false});
        SnackBar.show({
          text: 'Uploading in background.',
          duration: SnackBar.LENGTH_LONG,
        });
      })
      .catch(() => {
        this.setState({videoModal: false});
        SnackBar.show({
          text: 'Unable to upload your module. Please try again later.',
          backgroundColor: flatRed,
          textColor: '#ffff',
          duration: SnackBar.LENGTH_LONG,
        });
      });
  };

  renderItem = ({item}: {item: FileRes}) => {
    return (
      <View style={styles.itemContainer}>
        <FastImage
          source={{
            uri: `${fileUrl}/preview/${this.props.currentClass.id}/${item.preview}`,
            headers: {Authorization: `Bearer ${this.props.token}`},
          }}
          style={styles.image}>
          <AD
            name="playcircleo"
            size={40}
            color="#ffff"
            onPress={() => {
              this.props.navigation.navigate('Video', {
                url: `${fileUrl}/${this.props.currentClass.id}/${item.moduleId}/${item.filename}`,
                title: item.title,
              });
            }}
          />
        </FastImage>
        <Text style={styles.itemTitle}>{item.title}</Text>
      </View>
    );
  };

  renderContent = () => {
    const {errored, loading, files} = this.state;

    if (errored) {
      return (
        <View style={ContainerStyles.centerElements}>
          <Text>Something went wrong! Please try again later</Text>
        </View>
      );
    }

    if (loading) {
      return (
        <View style={ContainerStyles.centerElements}>
          <ActivityIndicator animating color={commonBlue} size="large" />
        </View>
      );
    }

    return (
      <FlatList
        data={files}
        keyExtractor={(item) => item.id}
        renderItem={this.renderItem}
        removeClippedSubviews
      />
    );
  };

  render() {
    return (
      <View style={ContainerStyles.parent}>
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

        <Modal
          isVisible={this.state.videoModal}
          propagateSwipe
          useNativeDriver
          style={{backgroundColor: '#ffff', padding: 10}}
          onBackButtonPress={() => this.setState({videoModal: false})}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <VideoPlayer
              source={{uri: this.state.videoUri!}}
              style={{height: 400, width: '100%'}}
            />
            <Input
              placeholder="Title"
              value={this.state.videoTitle}
              onChangeText={(videoTitle) => this.setState({videoTitle})}
            />
            <Button title="Upload Video" onPress={this.uploadVideo} />
          </ScrollView>
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

const styles = StyleSheet.create({
  image: {
    height: 200,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  itemContainer: {
    marginHorizontal: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: commonGrey,
    padding: 10,
    borderRadius: 4,
  },
  itemTitle: {
    fontWeight: '900',
    fontSize: 20,
    marginTop: 10,
  },
});

const mapStateToProps = (state: StoreState) => {
  return {
    currentClass: state.currentClass!,
    token: state.token!,
  };
};

export default connect(mapStateToProps)(Files);
