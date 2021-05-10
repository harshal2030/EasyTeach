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
  TouchableWithoutFeedback,
} from 'react-native';
import {Header, FAB, Button, Input, Icon} from 'react-native-elements';
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
import {
  commonBlue,
  commonGrey,
  greyWithAlpha,
} from '../../shared/styles/colors';
import {fileUrl, vidTrackerUrl} from '../../shared/utils/urls';
import {flatRed} from '../../shared/styles/colors';
import {ContainerStyles} from '../../shared/styles/styles';

type navigation = StackNavigationProp<RootStackParamList, 'Files'>;

type Props = {
  navigation: navigation;
  currentClass: Class;
  route: RouteProp<RootStackParamList, 'Files'>;
  token: string;
  isOwner: boolean;
};

type State = {
  videoUri: string | null;
  videoModal: boolean;
  videoTitle: string;
  files: FileRes[];
  loading: boolean;
  errored: boolean;
  fileId: string;
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
      fileId: '',
    };
  }

  componentDidMount() {
    this.getModules();
  }

  getModules = async () => {
    try {
      this.setState({loading: true});
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
      .catch(() => null);
  };

  getInfo = () => {
    axios
      .get(
        `${vidTrackerUrl}/${this.props.currentClass.id}/${this.props.route.params.moduleId}/${this.state.fileId}`,
        {
          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
        },
      )
      .then((res) => console.log(res.data))
      .catch((e) => console.log(e));
  };

  confirmDelete = (fileId: string) => {
    Alert.alert('Confirm', 'Are you sure to delete this video?', [
      {
        text: 'Cancel',
      },
      {
        text: 'Yes',
        onPress: () => this.deleteVideo(fileId),
      },
    ]);
  };

  deleteVideo = async (fileId: string) => {
    try {
      await axios.delete(
        `${fileUrl}/${this.props.currentClass.id}/${this.props.route.params.moduleId}/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
        },
      );

      const newFiles = this.state.files.filter(
        (file) => file.id !== this.state.fileId,
      );
      this.setState({files: newFiles});
    } catch (e) {
      SnackBar.show({
        text: 'Unable to delete video. Please try again later',
        backgroundColor: flatRed,
        textColor: '#fff',
        duration: SnackBar.LENGTH_LONG,
      });
    }
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
      .then((id) => {
        this.setState({videoModal: false});
        SnackBar.show({
          text: 'Uploading in background.',
          duration: SnackBar.LENGTH_LONG,
        });

        Upload.addListener('completed', id, (data) => {
          const temp = JSON.parse(data.responseBody);

          this.setState({files: [temp, ...this.state.files]});
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
        <TouchableWithoutFeedback
          onPress={() => {
            this.props.navigation.navigate('Video', {
              url: `${fileUrl}/${this.props.currentClass.id}/${item.moduleId}/${item.filename}`,
              title: item.title,
              id: item.id,
              moduleId: item.moduleId,
            });
          }}>
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
                  id: item.id,
                  moduleId: item.moduleId,
                });
              }}
            />
          </FastImage>
        </TouchableWithoutFeedback>
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          {this.props.isOwner && (
            <View style={{flexDirection: 'row'}}>
              <Icon
                name="information-outline"
                color="#000"
                type="material-community"
                onPress={() =>
                  this.props.navigation.navigate('Info', {
                    videoId: item.id,
                    moduleId: this.props.route.params.moduleId,
                    title: item.title,
                  })
                }
              />
              <Icon
                name="delete-outline"
                color={flatRed}
                type="material-community"
                onPress={() => this.confirmDelete(item.id)}
              />
            </View>
          )}
        </View>
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

    if (files.length === 0) {
      return (
        <View style={ContainerStyles.centerElements}>
          <Text>Nothing to show here right now</Text>
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
      <View style={[ContainerStyles.parent]}>
        <Header
          centerComponent={{
            text: 'Videos',
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
            onPress: this.getModules,
          }}
          rightContainerStyle={{justifyContent: 'center'}}
        />
        {this.renderContent()}

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

        {this.props.isOwner && (
          <FAB
            placement="right"
            upperCase
            title="Add Video"
            onPress={this.onVideoPress}
            icon={{name: 'plus', type: 'octicon', color: '#fff'}}
            color={commonBlue}
          />
        )}
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
    borderWidth: 1,
    borderColor: greyWithAlpha(0.2),
  },
  itemContainer: {
    marginHorizontal: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: commonGrey,
    padding: 10,
    borderRadius: 4,
  },
  itemTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 5,
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
    isOwner: state.currentClass!.owner.username === state.profile.username,
  };
};

export default connect(mapStateToProps)(Files);
