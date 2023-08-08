import React from 'react';
import axios from 'axios';
import {View, Platform} from 'react-native';
import {Header, Input} from 'react-native-elements';
import {ImageOrVideo} from 'react-native-image-crop-picker';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {connect} from 'react-redux';
import SnackBar from 'react-native-snackbar';
import RBSheet from 'react-native-raw-bottom-sheet';
import AsyncStorage from '@react-native-community/async-storage';

import {CommonSetting} from '../../shared/components/main';
import {PhotoPicker} from '../components/common';

import {StoreState} from '../../shared/global';
import {registerToken} from '../../shared/global/actions/token';
import {registerProfile} from '../../shared/global/actions/profile';
import {updateClassOwner} from '../../shared/global/actions/classes';

import {RootStackParamList} from '../navigators/types';
import {mediaUrl, root} from '../../shared/utils/urls';
import {flatRed} from '../../shared/styles/colors';

type NavigationProps = StackNavigationProp<RootStackParamList, 'EditProfile'>;

interface Props {
  navigation: NavigationProps;
  route: RouteProp<RootStackParamList, 'EditProfile'>;
  profile: {
    name: string;
    username: string;
    avatar: string;
  };
  token: string | null;
  registerToken: typeof registerToken;
  registerProfile: typeof registerProfile;
  updateClassOwner: typeof updateClassOwner;
}

interface State {
  name: string;
  username: string;
  avatar: {
    uri: string;
    type: string;
  };
  loading: boolean;
}

class EditProfile extends React.Component<Props, State> {
  sheet: RBSheet | null = null;

  constructor(props: Props) {
    super(props);

    const {name, username, avatar} = this.props.profile;

    this.state = {
      name,
      username,
      avatar: {
        uri: `${mediaUrl}/avatar/${avatar}`,
        type: '',
      },
      loading: false,
    };
  }

  storeNewToken = (token: string) => {
    AsyncStorage.setItem('token', token);
  };

  onImage = (image: ImageOrVideo) => {
    this.sheet!.close();
    this.setState({
      avatar: {
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

  updateProfile = () => {
    this.setState({loading: true});
    const {name, username, avatar} = this.state;
    const form = new FormData();
    form.append('info', JSON.stringify({name, username}));

    if (avatar.uri !== `${mediaUrl}/avatar/${this.props.profile.avatar}`) {
      // @ts-ignore
      form.append('avatar', {
        // @ts-ignore
        name: 'photo.jpeg',
        type: avatar.type,
        uri:
          Platform.OS === 'android'
            ? avatar.uri
            : avatar.uri.replace('file://', ''),
      });
    }

    axios
      .put<{
        token: string;
        user: {avatar: string; name: string; username: string};
      }>(`${root}/users`, form, {
        headers: {
          Authorization: `Bearer ${this.props.token}`,
        },
      })
      .then((res) => {
        this.props.updateClassOwner(res.data.user, this.props.profile.username);
        this.storeNewToken(res.data.token);
        this.props.registerToken(res.data.token);
        this.props.registerProfile(res.data.user);
        this.setState({loading: false});
        this.props.navigation.goBack();
      })
      .catch(() => {
        this.setState({loading: false});
        SnackBar.show({
          text: 'Unable to update profile. please try again later',
          backgroundColor: flatRed,
          textColor: '#fff',
        });
      });
  };

  render() {
    const {avatar, name, username} = this.state;

    return (
      <View>
        <Header
          centerComponent={{
            text: 'Edit Profile',
            style: {fontSize: 24, color: '#fff', fontWeight: '600'},
          }}
          leftComponent={{
            icon: 'arrow-back',
            color: '#ffff',
            size: 26,
            onPress: this.props.navigation.goBack,
          }}
        />

        <CommonSetting
          imageSource={{
            uri: avatar.uri,
          }}
          buttonLoading={this.state.loading}
          onButtonPress={this.updateProfile}
          onImagePress={() => this.sheet!.open()}
          buttonProps={{title: 'Update'}}>
          <Input
            label="Name"
            value={name}
            onChangeText={(text) => this.setState({name: text})}
          />
          <Input
            label="Username"
            value={username}
            onChangeText={(text) => this.setState({username: text})}
          />
        </CommonSetting>

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
    profile: state.profile,
    token: state.token,
  };
};

export default connect(mapStateToProps, {
  registerProfile,
  registerToken,
  updateClassOwner,
})(EditProfile);
