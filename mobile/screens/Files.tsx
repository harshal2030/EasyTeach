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
import {Header, Button, Input, Icon, SpeedDial} from 'react-native-elements';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import ImagePicker from 'react-native-image-crop-picker';
import Upload from 'react-native-background-upload';
import FastImage from 'react-native-fast-image';
import {VideoPlayer} from '../components/main/VideoPlayer';
import {connect} from 'react-redux';
import Modal from 'react-native-modal';
import SnackBar from 'react-native-snackbar';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import AD from 'react-native-vector-icons/AntDesign';
import DocumentPicker from 'react-native-document-picker';
import fs from 'react-native-fs';
import PDFView from 'react-native-view-pdf';
import {Picker} from '@react-native-picker/picker';

import {StoreState} from '../../shared/global';
import {Class} from '../../shared/global/actions/classes';

import {RootStackParamList} from '../navigators/types';
import {
  commonBlue,
  commonGrey,
  greyWithAlpha,
  flatRed,
  eucalyptusGreen,
} from '../../shared/styles/colors';
import {fileUrl} from '../../shared/utils/urls';
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
  file: {
    uri: string;
    type: 'pdf' | 'video';
  } | null;
  videoModal: boolean;
  videoTitle: string;
  files: FileRes[];
  loading: boolean;
  errored: boolean;
  fileId: string;
  SDOpen: boolean;
  typeToShow: 'pdf' | 'video';
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
      file: null,
      videoModal: false,
      videoTitle: '',
      files: [],
      loading: true,
      errored: false,
      fileId: '',
      SDOpen: false,
      typeToShow: 'video',
    };
  }

  componentDidMount() {
    this.getModules();
  }

  getModules = async (t: string = 'video') => {
    try {
      this.setState({loading: true});
      const res = await axios.get<FileRes[]>(
        `${fileUrl}/${this.props.currentClass.id}/${this.props.route.params.moduleId}`,
        {
          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
          params: {t},
        },
      );

      this.setState({files: res.data, loading: false});
    } catch (e) {
      this.setState({errored: true, loading: false});
    }
  };

  onVideoPress = () => {
    ImagePicker.openPicker({
      mediaType: 'video',
    })
      .then((res) =>
        this.setState({
          file: {
            type: 'video',
            uri: res.path,
          },
          videoModal: true,
        }),
      )
      .catch(() => null);
  };

  importPDF = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      });

      const dest = `${fs.TemporaryDirectoryPath}/${Date.now()}.pdf`;

      await fs.copyFile(res.uri, dest);

      this.setState({file: {uri: dest, type: 'pdf'}, videoModal: true});
    } catch (e) {
      if (!DocumentPicker.isCancel(e)) {
        SnackBar.show({
          text: 'Unable to get the file.',
          duration: SnackBar.LENGTH_SHORT,
        });
      }
    }
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

      const newFiles = this.state.files.filter((file) => file.id !== fileId);
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

    const path = this.state.file!.uri.replace('file://', '');

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
        setTimeout(() => {
          SnackBar.show({
            text: 'Uploading in background.',
            duration: SnackBar.LENGTH_LONG,
          });
        }, 1000);
      })
      .catch(() => {
        this.setState({videoModal: false, videoTitle: ''});
        setTimeout(() => {
          SnackBar.show({
            text: 'Unable to upload your module. Please try again later.',
            backgroundColor: flatRed,
            textColor: '#ffff',
            duration: SnackBar.LENGTH_LONG,
          });
        }, 1000);
      });
  };

  renderItem = ({item}: {item: FileRes}) => {
    if (this.state.typeToShow === 'video') {
      return this.renderVideo(item);
    } else {
      return this.renderPdf(item);
    }
  };

  renderVideo = (item: FileRes) => {
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

  renderPdf = (item: FileRes) => {
    return (
      <View
        key={item.id}
        style={[
          styles.itemContainer,
          {justifyContent: 'center', alignItems: 'center'},
        ]}>
        <MCI name="file-pdf" size={100} color="#000" />
        <Text style={{fontSize: 18, fontWeight: '600'}}>{item.title}</Text>
        <View style={styles.pdfBoxFooterContainer}>
          <Button
            type="outline"
            title="OPEN"
            containerStyle={{marginHorizontal: 5}}
            titleStyle={{color: eucalyptusGreen}}
            buttonStyle={{borderColor: eucalyptusGreen}}
            onPress={() =>
              this.props.navigation.navigate('PDFViewer', {
                url: `${fileUrl}/${this.props.currentClass.id}/${item.moduleId}/${item.filename}`,
              })
            }
          />

          {this.props.isOwner && (
            <Button
              type="outline"
              title="DELETE"
              titleStyle={{color: flatRed}}
              buttonStyle={{borderColor: flatRed}}
              containerStyle={{marginHorizontal: 5}}
              onPress={() => this.confirmDelete(item.id)}
            />
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

  renderModalContent = () => {
    if (this.state.file) {
      if (this.state.file.type === 'video') {
        return (
          <VideoPlayer
            source={{uri: this.state.file!.uri}}
            style={{height: 400, width: '100%'}}
          />
        );
      } else {
        return (
          <PDFView
            resource={this.state.file!.uri}
            resourceType="file"
            style={{height: 400, width: '100%'}}
          />
        );
      }
    }
  };

  render() {
    return (
      <View style={[ContainerStyles.parent]}>
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
            onPress: () => this.getModules(),
          }}
          rightContainerStyle={{justifyContent: 'center'}}
        />
        <Picker
          selectedValue={this.state.typeToShow}
          mode="dialog"
          onValueChange={(val) => {
            this.getModules(val);
            this.setState({typeToShow: val});
          }}>
          <Picker.Item value="video" label="Videos" />
          <Picker.Item value="pdf" label="PDFs" />
        </Picker>
        {this.renderContent()}

        <Modal
          isVisible={this.state.videoModal}
          propagateSwipe
          useNativeDriver
          style={{backgroundColor: '#ffff', padding: 10}}
          onBackButtonPress={() => this.setState({videoModal: false})}>
          <ScrollView keyboardShouldPersistTaps="handled">
            {this.renderModalContent()}
            <Input
              placeholder="Title"
              value={this.state.videoTitle}
              onChangeText={(videoTitle) => this.setState({videoTitle})}
            />
            <Button title="Upload" onPress={this.uploadVideo} />
          </ScrollView>
        </Modal>

        {this.props.isOwner && (
          <SpeedDial
            isOpen={this.state.SDOpen}
            icon={{name: 'add', color: '#fff'}}
            color={commonBlue}
            onOpen={() => this.setState({SDOpen: !this.state.SDOpen})}
            onClose={() => this.setState({SDOpen: !this.state.SDOpen})}
            openIcon={{name: 'close', color: '#fff'}}>
            <SpeedDial.Action
              icon={{name: 'ondemand-video', color: '#fff'}}
              title="Video"
              color={commonBlue}
              onPress={this.onVideoPress}
            />
            <SpeedDial.Action
              icon={{
                name: 'file-pdf-box',
                type: 'material-community',
                color: '#fff',
              }}
              title="PDF"
              color={commonBlue}
              onPress={this.importPDF}
            />
          </SpeedDial>
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
  pdfBoxContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 160,
    width: '100%',
    borderWidth: 1,
    borderColor: '#000',
    marginHorizontal: 10,
    marginVertical: 1,
  },
  pdfBoxFooterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
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
