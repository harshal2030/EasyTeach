import React, {useRef, useState} from 'react';
import axios from 'axios';
import {View, Platform} from 'react-native';
import {Header, Input} from 'react-native-elements';
import {ImageOrVideo} from 'react-native-image-crop-picker';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {connect} from 'react-redux';
import SnackBar from 'react-native-snackbar';
import RBSheet from 'react-native-raw-bottom-sheet';
import * as Analytics from 'expo-firebase-analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {CommonSetting} from '../../shared/components/main';
import {PhotoPicker} from '../components/common';

import {StoreState} from '../../shared/global';
import {registerToken} from '../../shared/global/actions/token';
import {registerProfile} from '../../shared/global/actions/profile';
import {updateClassOwner} from '../../shared/global/actions/classes';

import {RootStackParamList} from '../navigators/types';
import {mediaUrl, root} from '../../shared/utils/urls';
import {flatRed} from '../../shared/styles/colors';

type NavigationProps = NativeStackNavigationProp<
  RootStackParamList,
  'EditProfile'
>;

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

const EditProfile: React.FC<Props> = (props) => {
  const [name, setName] = useState(props.profile.name);
  const [username, setUsername] = useState(props.profile.username);
  const [avatar, setAvatar] = useState<{uri: string; type: string}>({
    uri: `${mediaUrl}/avatar/${props.profile.avatar}`,
    type: '',
  });
  const [loading, setLoading] = useState(false);

  const sheet = useRef<RBSheet | null>(null);

  const storeNewToken = (token: string) => {
    AsyncStorage.setItem('token', token);
  };

  const updateProfile = () => {
    setLoading(true);
    const form = new FormData();
    form.append('info', JSON.stringify({name, username}));

    if (avatar.uri !== `${mediaUrl}/avatar/${props.profile.avatar}`) {
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
          Authorization: `Bearer ${props.token}`,
        },
      })
      .then((res) => {
        props.updateClassOwner(res.data.user, props.profile.username);
        storeNewToken(res.data.token);
        props.registerToken(res.data.token);
        props.registerProfile(res.data.user);
        setLoading(false);
        props.navigation.goBack();
      })
      .catch(() => {
        setLoading(false);
        SnackBar.show({
          text: 'Unable to update profile. please try again later',
          backgroundColor: flatRed,
          textColor: '#fff',
        });
        Analytics.logEvent('http_error', {
          url: `${root}/users`,
          method: 'put',
          reason: 'unk',
        });
      });
  };

  const onImage = (image: ImageOrVideo) => {
    sheet.current?.close();
    setAvatar({
      uri: image.path,
      type: image.mime,
    });
  };

  const onImageError = () => {
    sheet.current?.close();
    SnackBar.show({
      text: 'Unable to pick image.',
      duration: SnackBar.LENGTH_SHORT,
    });
  };

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
          onPress: props.navigation.goBack,
        }}
      />

      <CommonSetting
        imageSource={{
          uri: avatar.uri,
        }}
        buttonLoading={loading}
        onButtonPress={updateProfile}
        onImagePress={() => sheet.current!.open()}
        buttonProps={{title: 'Update'}}>
        <Input
          label="Name"
          autoCompleteType="off"
          defaultValue={name}
          onChangeText={setName}
        />
        <Input
          label="Username"
          autoCompleteType="off"
          defaultValue={username}
          onChangeText={setUsername}
        />
      </CommonSetting>

      <PhotoPicker
        sheetRef={sheet}
        onCameraImage={onImage}
        onPickerImage={onImage}
        onCameraError={onImageError}
        onPickerError={onImageError}
      />
    </View>
  );
};

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
