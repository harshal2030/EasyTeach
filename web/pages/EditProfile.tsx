import React from 'react';
import axios from 'axios';
import {View} from 'react-native';
import {Header, Input} from 'react-native-elements';
import {connect} from 'react-redux';
import {toast} from 'react-toastify';
import {withRouter, RouteComponentProps} from 'react-router-dom';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackIcon from '@iconify-icons/ic/arrow-back';

import {TouchableIcon} from '../components';
import {CommonSetting} from '../../shared/components/main';

import {StoreState} from '../../shared/global';
import {registerToken} from '../../shared/global/actions/token';
import {registerProfile} from '../../shared/global/actions/profile';
import {updateClassOwner} from '../../shared/global/actions/classes';

import {mediaUrl, root} from '../../shared/utils/urls';
import {staticImageExtPattern} from '../../shared/utils/regexPatterns';

type Props = RouteComponentProps & {
  profile: {
    name: string;
    username: string;
    avatar: string;
  };
  token: string | null;
  registerToken: typeof registerToken;
  registerProfile: typeof registerProfile;
  updateClassOwner: typeof updateClassOwner;
};

interface State {
  name: string;
  username: string;
  avatar: File | null;
  previewAvatar: string;
  loading: boolean;
}

class EditProfile extends React.Component<Props, State> {
  upload: HTMLInputElement | null = null;
  constructor(props: Props) {
    super(props);

    const {name, username, avatar} = this.props.profile;

    this.state = {
      name,
      username,
      avatar: null,
      previewAvatar: `${mediaUrl}/avatar/${avatar}`,
      loading: false,
    };
  }

  storeNewToken = async (token: string) => {
    try {
      await AsyncStorage.setItem('token', token);
    } catch (e) {
      // move on
    }
  };

  updateProfile = () => {
    this.setState({loading: true});
    const {name, username, avatar} = this.state;
    const form = new FormData();
    form.append('info', JSON.stringify({name, username}));

    if (avatar) {
      form.append('avatar', avatar, avatar.name);
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
        this.props.history.goBack();
      })
      .catch(() => {
        this.setState({loading: false});
        toast.error('Unable to update profile. please try again later');
      });
  };

  handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (!staticImageExtPattern.test(file.name)) {
        return toast.error('Please upload a valid image.');
      }

      this.setState({
        avatar: file,
        previewAvatar: URL.createObjectURL(file),
      });
    }
  };

  render() {
    const {name, username} = this.state;

    return (
      <View>
        <Header
          centerComponent={{
            text: 'Edit Profile',
            style: {fontSize: 24, color: '#fff', fontWeight: '600'},
          }}
          leftComponent={
            <TouchableIcon
              icon={BackIcon}
              color="#fff"
              size={26}
              onPress={this.props.history.goBack}
            />
          }
        />

        <CommonSetting
          imageSource={{
            uri: this.state.previewAvatar,
          }}
          buttonLoading={this.state.loading}
          onButtonPress={this.updateProfile}
          onImagePress={() => this.upload!.click()}
          buttonProps={{title: 'Update'}}>
          <input
            type="file"
            accept="image/*"
            style={{display: 'none'}}
            onChange={this.handleImage}
            ref={(ref) => (this.upload = ref)}
          />
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

export default withRouter(
  connect(mapStateToProps, {
    registerProfile,
    registerToken,
    updateClassOwner,
  })(EditProfile),
);
