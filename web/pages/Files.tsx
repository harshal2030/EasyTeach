import React from 'react';
import axios from 'axios';
import {
  View,
  ScrollView,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
  ImageBackground as FastImage,
} from 'react-native';
import {withRouter, RouteComponentProps} from 'react-router-dom';
import {Header, FAB, Button, Input} from 'react-native-elements';
import {connect} from 'react-redux';
import Modal from 'react-native-modal';
import Dialog from 'react-native-dialog';
import {toast} from 'react-toastify';
import playIcon from '@iconify-icons/ic/baseline-play-circle-outline';
import deleteIcon from '@iconify-icons/ic/baseline-delete-outline';
import infoIcon from '@iconify-icons/mdi/information-circle-outline';

import {TouchableIcon} from '../components/TouchableIcon';
import {StoreState} from '../../shared/global';
import {Class, registerCurrentClass} from '../../shared/global/actions/classes';

import {
  commonBlue,
  commonGrey,
  greyWithAlpha,
  flatRed,
} from '../../shared/styles/colors';
import {fileUrl} from '../../shared/utils/urls';
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
  videoUri: File;
  videoModal: boolean;
  videoTitle: string;
  files: FileRes[];
  loading: boolean;
  errored: boolean;
  fileId: string;
  videoPreview: string;
  alertVisible: boolean;
  alertInfo: {
    title: string;
    description: string;
    buttons: {text: string; onPress(): void}[];
  };
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

    this.state = {
      videoUri: null,
      videoPreview: '',
      videoModal: false,
      videoTitle: '',
      files: [],
      loading: true,
      errored: false,
      fileId: '',
      alertInfo: {
        title: '',
        description: '',
        buttons: [],
      },
      alertVisible: false,
    };
  }

  componentDidMount() {
    const {classId} = this.props.match.params;
    const {classes} = this.props;

    const classFound = classes.find((cls) => cls.id === classId);
    document.cookie = 'username=harshal; SameSite=none';

    if (classFound) {
      this.props.registerCurrentClass(classFound);
    } else {
      if (classes.length !== 0) {
        this.props.history.replace('/*');
      }
    }

    if (!this.props.premiumAllowed) {
      this.props.history.replace('/*');
    }

    this.getModules();
  }

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
        onErrorTitle: 'Uploading errored. Please try again later',
      },
      type: 'multipart',
      field: 'file',
      parameters: {
        title: this.state.videoTitle,
      },
    })
      .then(() => {
        this.setState({videoModal: false, videoTitle: ''});
        toast('Your upload has begun. please do not close this tab');
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
            }}
            style={styles.image}>
            <TouchableIcon icon={playIcon} size={40} color="#fff" />
          </FastImage>
        </TouchableWithoutFeedback>
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          {this.props.isOwner && (
            <View style={{flexDirection: 'row'}}>
              <TouchableIcon
                icon={infoIcon}
                color="#000"
                size={25}
                onPress={() => null} // TODO: add route
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
      <FlatList
        data={files}
        keyExtractor={(item) => item.id}
        renderItem={this.renderItem}
        removeClippedSubviews
        ListFooterComponent={<View style={{height: 100}} />}
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
            onPress: this.props.history.goBack,
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

        {this.props.isOwner && (
          <>
            <input
              type="file"
              accept="video/*"
              style={{display: 'none'}}
              ref={(ref) => (this.upload = ref)}
              onChange={this.onFileChange}
            />
            <FAB
              placement="right"
              upperCase
              title="Add Video"
              icon={{name: 'plus', type: 'octicon', color: '#fff'}}
              color={commonBlue}
              onPress={() => this.upload!.click()}
            />
          </>
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
    premiumAllowed: state.currentClass?.planId !== 'free',
    classes: state.classes,
  };
};

export default withRouter(
  connect(mapStateToProps, {registerCurrentClass})(Files),
);
