import React from 'react';
import axios from 'axios';
import {
  View,
  ScrollView,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  ImageBackground as FastImage,
  Dimensions,
  ScaledSize,
} from 'react-native';
import {withRouter, RouteComponentProps, Link} from 'react-router-dom';
import {Header, Button, Input} from 'react-native-elements';
import {connect} from 'react-redux';
import Modal from 'react-native-modal';
import Dialog from 'react-native-dialog';
import {toast} from 'react-toastify';
import playIcon from '@iconify-icons/ic/baseline-play-circle-outline';
import deleteIcon from '@iconify-icons/ic/baseline-delete-outline';
import infoIcon from '@iconify-icons/mdi/information-circle-outline';
import backIcon from '@iconify-icons/ic/arrow-back';
import refreshCw from '@iconify-icons/feather/refresh-ccw';
import uploadIcon from '@iconify-icons/ic/baseline-file-upload';

import {TouchableIcon} from '../components/TouchableIcon';
import {Video} from '../components/Video';

import {StoreState} from '../../shared/global';
import {Class, registerCurrentClass} from '../../shared/global/actions/classes';

import {
  commonBlue,
  commonGrey,
  greyWithAlpha,
  flatRed,
} from '../../shared/styles/colors';
import {fileUrl, vidTrackerUrl} from '../../shared/utils/urls';
import {ContainerStyles} from '../../shared/styles/styles';
import {videoExtPattern} from '../../shared/utils/regexPatterns';

type Props = RouteComponentProps<{classId: string; moduleId: string}> & {
  currentClass: Class;
  token: string;
  isOwner: boolean;
  premiumAllowed: boolean;
  classes: Class[];
  registerCurrentClass: typeof registerCurrentClass;
};

type State = {
  videoUri: File | null;
  videoModal: boolean;
  videoTitle: string;
  files: FileRes[];
  loading: boolean;
  errored: boolean;
  fileId: string;
  videoPreview: string;
  alertVisible: boolean;
  screenWidth: number;
  alertInfo: {
    title: string;
    description: string;
    buttons: {text: string; onPress(): void}[];
  };
  videoToShow: string | null;
  videoId: string | null;
  uploaded: number;
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
  upload: HTMLInputElement | null = null;

  constructor(props: Props) {
    super(props);
    const fileName = new URLSearchParams(this.props.location.search).get('v');
    const videoId = new URLSearchParams(this.props.location.search).get('i');

    this.state = {
      videoUri: null,
      videoPreview: '',
      videoModal: false,
      videoTitle: '',
      files: [],
      screenWidth: Dimensions.get('window').width,
      loading: true,
      errored: false,
      fileId: '',
      alertInfo: {
        title: '',
        description: '',
        buttons: [],
      },
      alertVisible: false,
      videoToShow: fileName ? fileName : null,
      videoId,
      uploaded: 0,
    };
  }

  componentDidMount() {
    const {classId, moduleId} = this.props.match.params;
    const {classes} = this.props;

    const classFound = classes.find((cls) => cls.id === classId);

    if (classFound) {
      this.props.registerCurrentClass(classFound);
    } else {
      this.props.history.replace('/*');
    }

    if (!this.props.premiumAllowed) {
      this.props.history.replace('/*');
    }

    axios
      .get(`${fileUrl}/cookie/${classId}/${moduleId}`, {
        headers: {
          Authorization: `Bearer ${this.props.token}`,
        },
        withCredentials: true,
      })
      .then(() => null)
      .catch(() => null);

    Dimensions.addEventListener('change', this.onWidthChange);

    this.getModules();
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.location.search !== this.props.location.search) {
      this.changeVideo();
    }
  }

  componentWillUnmount() {
    Dimensions.removeEventListener('change', this.onWidthChange);
  }

  changeVideo = () => {
    this.setState({
      videoToShow: new URLSearchParams(this.props.location.search).get('v'),
      videoId: new URLSearchParams(this.props.location.search).get('i'),
    });
  };

  onWidthChange = ({window}: {window: ScaledSize}) => {
    this.setState({screenWidth: window.width});
  };

  getModules = async () => {
    try {
      this.setState({loading: true});
      const res = await axios.get<FileRes[]>(
        `${fileUrl}/${this.props.currentClass.id}/${this.props.match.params.moduleId}`,
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

  Alert = (
    title: string,
    description: string,
    buttons?: {text: string; onPress: () => void}[],
  ) => {
    const buttonsToDisplay = buttons
      ? buttons
      : [{text: 'Ok', onPress: () => this.setState({alertVisible: false})}];

    this.setState({
      alertInfo: {
        title,
        description,
        buttons: buttonsToDisplay,
      },
      alertVisible: true,
    });
  };

  confirmDelete = (fileId: string) => {
    this.Alert('Confirm', 'Are you sure to delete this video?', [
      {
        text: 'Cancel',
        onPress: () => this.setState({alertVisible: false}),
      },
      {
        text: 'Yes',
        onPress: () => this.deleteVideo(fileId),
      },
    ]);
  };

  deleteVideo = async (fileId: string) => {
    try {
      this.setState({alertVisible: false});
      await axios.delete(
        `${fileUrl}/${this.props.currentClass.id}/${this.props.match.params.moduleId}/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
        },
      );

      const newFiles = this.state.files.filter((file) => file.id !== fileId);
      this.setState({files: newFiles});
    } catch (e) {
      toast.error('Unable to delete video. Please try again later');
    }
  };

  uploadVideo = () => {
    if (this.state.videoTitle.trim().length === 0) {
      toast.error('Please enter video title to upload');
      return;
    }

    const data = new FormData();
    data.append('title', this.state.videoTitle);
    data.append('file', this.state.videoUri!, this.state.videoUri!.name);

    axios
      .post(
        `${fileUrl}/${this.props.currentClass.id}/${this.props.match.params.moduleId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
          onUploadProgress: (e) => {
            const temp = (e.loaded / e.total) * 100;
            const uploaded = Math.round((temp + Number.EPSILON) * 100) / 100;
            this.setState({uploaded});
          },
        },
      )
      .then(() => {
        this.setState({videoModal: false, videoTitle: ''});
        toast.success('Video uploaded successfully');
      })
      .catch(() => {
        this.setState({videoModal: false, videoTitle: ''});
        toast.error('Unable to upload your module. Please try again later.');
      });
  };

  onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!videoExtPattern.test(file.name)) {
        toast.error('Video format is not supported');
      }

      this.setState({
        videoUri: file,
        videoPreview: URL.createObjectURL(file),
        videoModal: true,
      });
    }
  };

  renderItem = ({item}: {item: FileRes}) => {
    return (
      <View style={styles.itemContainer}>
        <Link
          to={`/files/${this.props.currentClass.id}/${this.props.match.params.moduleId}/?v=${item.filename}&i=${item.id}`}>
          <FastImage
            source={{
              uri: `${fileUrl}/preview/${this.props.currentClass.id}/${item.preview}`,
            }}
            style={styles.image}>
            <TouchableIcon icon={playIcon} size={40} color="#fff" />
          </FastImage>
        </Link>
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          {this.props.isOwner && (
            <View style={{flexDirection: 'row'}}>
              <TouchableIcon
                icon={infoIcon}
                color="#000"
                size={25}
                onPress={() =>
                  this.props.history.push(
                    `/info/${this.props.currentClass.id}/${this.props.match.params.moduleId}/${item.id}`,
                  )
                }
              />
              <TouchableIcon
                icon={deleteIcon}
                color={flatRed}
                size={25}
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
      <View
        style={{
          flexDirection: this.state.screenWidth < 970 ? 'column' : 'row',
        }}>
        <View style={{flex: 1}}>
          {this.state.videoToShow ? (
            <Video
              url={`${fileUrl}/${this.props.currentClass.id}/${this.props.match.params.moduleId}/${this.state.videoToShow}`}
              trackerUrl={`${vidTrackerUrl}/${this.props.currentClass.id}/${this.props.match.params.moduleId}/${this.state.videoId}`}
              token={this.props.token}
              start={new Date()}
            />
          ) : (
            <Text>Select a video to watch</Text>
          )}
        </View>
        <FlatList
          data={files}
          keyExtractor={(item) => item.id}
          renderItem={this.renderItem}
          style={{maxWidth: 400}}
          contentContainerStyle={{width: 400}}
          removeClippedSubviews
          ListFooterComponent={<View style={{height: 20}} />}
        />
      </View>
    );
  };

  render() {
    return (
      <View style={[ContainerStyles.parent, {backgroundColor: '#fff'}]}>
        <Header
          centerComponent={{
            text: 'Videos',
            style: {fontSize: 24, color: '#ffff', fontWeight: '600'},
          }}
          leftComponent={
            <TouchableIcon
              icon={backIcon}
              size={26}
              color="#fff"
              onPress={() =>
                this.props.history.push(
                  `/classes/modules/${this.props.match.params.classId}`,
                )
              }
            />
          }
          rightComponent={
            <View
              style={{
                flexDirection: 'row-reverse',
                width: 100,
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <TouchableIcon
                icon={refreshCw}
                size={23}
                color="#fff"
                onPress={this.getModules}
              />
              <TouchableIcon
                icon={uploadIcon}
                size={34}
                color="#fff"
                onPress={() => this.upload!.click()}
              />
            </View>
          }
          rightContainerStyle={{justifyContent: 'center'}}
        />

        {this.renderContent()}

        <Modal
          isVisible={this.state.videoModal}
          propagateSwipe
          useNativeDriver
          style={{backgroundColor: '#ffff', padding: 10}}
          onBackdropPress={() => this.setState({videoModal: false})}
          onBackButtonPress={() => this.setState({videoModal: false})}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <video height="400" width="100%" controls>
              <source src={this.state.videoPreview} />
            </video>
            <Input
              placeholder="Title"
              value={this.state.videoTitle}
              onChangeText={(videoTitle) => this.setState({videoTitle})}
            />
            <Button title="Upload Video" onPress={this.uploadVideo} />
            {this.state.uploaded ? (
              <Text>
                {this.state.uploaded}% uploaded. Do not close this tab
              </Text>
            ) : null}
          </ScrollView>
        </Modal>

        <Dialog.Container visible={this.state.alertVisible}>
          <Dialog.Title>{this.state.alertInfo.title}</Dialog.Title>
          <Dialog.Description>
            {this.state.alertInfo.description}
          </Dialog.Description>
          {this.state.alertInfo.buttons.map((button, i) => {
            return (
              <Dialog.Button
                key={i}
                label={button.text}
                onPress={button.onPress}
              />
            );
          })}
        </Dialog.Container>

        <input
          type="file"
          accept="video/*"
          style={{display: 'none'}}
          ref={(ref) => (this.upload = ref)}
          onChange={this.onFileChange}
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
    premiumAllowed: state.currentClass?.planId !== 'free',
    classes: state.classes,
  };
};

export default withRouter(
  connect(mapStateToProps, {registerCurrentClass})(Files),
);
