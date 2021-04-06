import React from 'react';
import axios from 'axios';
import {View, ScrollView, Platform, Alert} from 'react-native';
import {Header, Input} from 'react-native-elements';
import {CompositeNavigationProp} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {StackNavigationProp} from '@react-navigation/stack';
import {connect} from 'react-redux';
import {ImageOrVideo} from 'react-native-image-crop-picker';
import ClipBoard from '@react-native-community/clipboard';
import SnackBar from 'react-native-snackbar';
import RBSheet from 'react-native-raw-bottom-sheet';

import {CommonSetting} from '../components/main';
import {CheckBox, PhotoPicker} from '../components/common';

import {StoreState} from '../../shared/global';
import {
  Class,
  updateClasses,
  registerCurrentClass,
  removeClass,
} from '../../shared/global/actions/classes';
import {RootStackParamList, DrawerParamList} from '../navigators/types';
import {ContainerStyles} from '../../shared/styles/styles';
import {mediaUrl, classUrl} from '../../shared/utils/urls';

type NavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DrawerParamList, 'Manage'>,
  StackNavigationProp<RootStackParamList>
>;

interface Props {
  navigation: NavigationProp;
  currentClass: Class | null;
  token: string | null;
  updateClasses: typeof updateClasses;
  registerCurrentClass: typeof registerCurrentClass;
  removeClass: typeof removeClass;
}

interface State {
  name: string;
  about: string;
  subject: string;
  lockJoin: boolean;
  photo: {
    uri: string;
    type: string;
  };
  loading: boolean;
}

class ManageClass extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const {name, photo, about, subject, lockJoin} = this.props.currentClass!;

    this.state = {
      name,
      about,
      subject,
      lockJoin,
      photo: {
        uri: `${mediaUrl}/class/avatar/${photo}`,
        type: 'image/png',
      },
      loading: false,
    };
  }

  sheet: RBSheet | null = null;

  onClassChange = () => {
    const {name, about, subject, lockJoin, photo} = this.props.currentClass!;
    this.setState({
      name,
      about,
      subject,
      lockJoin,
      photo: {
        uri: `${mediaUrl}/class/avatar/${photo}`,
        type: 'image/png',
      },
    });
  };

  componentDidUpdate(prevProps: Props) {
    if (this.props.currentClass) {
      if (prevProps.currentClass!.id !== this.props.currentClass!.id) {
        this.onClassChange();
      }
    }
  }

  setStringToClip = (text: string) => {
    ClipBoard.setString(text);
    SnackBar.show({
      text: 'Copied to ClipBoard',
      duration: SnackBar.LENGTH_SHORT,
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
    SnackBar.show({
      text: 'Unable to pick image.',
      duration: SnackBar.LENGTH_SHORT,
    });
    this.sheet!.close();
  };

  updateClass = () => {
    this.setState({loading: true});
    const {name, subject, about, photo, lockJoin} = this.state;
    const reqBody = new FormData();

    reqBody.append(
      'info',
      JSON.stringify({
        name,
        subject,
        about,
        lockJoin,
      }),
    );

    if (photo.uri !== 'none') {
      reqBody.append('classPhoto', {
        // @ts-ignore
        name: 'photo.jpeg',
        type: photo.type,
        uri:
          Platform.OS === 'android'
            ? photo.uri
            : photo.uri.replace('file://', ''),
      });
    }

    axios
      .put<Class>(`${classUrl}/${this.props.currentClass!.id}`, reqBody, {
        headers: {
          Authorization: `Bearer ${this.props.token}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        this.setState({loading: false});
        if (res.status !== 200) {
          throw new Error();
        }
        this.props.updateClasses(res.data);
        this.props.registerCurrentClass(res.data);
        this.props.navigation.goBack();
      })
      .catch((e) => {
        this.setState({loading: false});
        if (e.response) {
          if (e.response.status === 400) {
            return Alert.alert('Oops!', e.response.data.error);
          }
        }

        SnackBar.show({
          text: 'Unable to update class at the moment. Please try again later',
          duration: SnackBar.LENGTH_LONG,
        });
      });
  };

  render() {
    const {name, about, subject, lockJoin, photo, loading} = this.state;
    const {joinCode} = this.props.currentClass!;
    return (
      <View style={ContainerStyles.parent}>
        <Header
          centerComponent={{
            text: 'Manage',
            style: {fontSize: 24, color: '#fff', fontWeight: '600'},
          }}
          leftComponent={{
            icon: 'menu',
            color: '#ffff',
            size: 26,
            onPress: () => this.props.navigation.openDrawer(),
          }}
        />

        <ScrollView keyboardShouldPersistTaps="handled">
          <CommonSetting
            buttonProps={{title: 'Save', containerStyle: {marginVertical: 15}}}
            imageSource={{
              uri: photo.uri,
            }}
            buttonLoading={loading}
            onButtonPress={this.updateClass}
            onImagePress={() => this.sheet!.open()}>
            <Input
              value={name}
              disabled={loading}
              label="Name"
              onChangeText={(text) => this.setState({name: text})}
            />
            <Input
              value={about}
              label="About"
              disabled={loading}
              numberOfLines={3}
              multiline
              onChangeText={(text) => this.setState({about: text})}
            />
            <Input
              value={subject}
              label="Subject"
              disabled={loading}
              onChangeText={(text) => this.setState({subject: text})}
            />
            <Input
              value={joinCode}
              label="Join Code"
              rightIcon={{
                name: 'content-copy',
                type: 'material',
                onPress: () => this.setStringToClip(joinCode),
              }}
              disabled
            />
            <CheckBox
              checked={lockJoin}
              title="Lock Join"
              onPress={() => this.setState({lockJoin: !lockJoin})}
              desc="Enabling this would not allow anyone to join the class."
            />
          </CommonSetting>
        </ScrollView>

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
    currentClass: state.currentClass,
    token: state.token,
  };
};

export default connect(mapStateToProps, {
  updateClasses,
  registerCurrentClass,
  removeClass,
})(ManageClass);
