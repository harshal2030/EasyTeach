import React from 'react';
import axios from 'axios';
import {
  View,
  ScrollView,
  Platform,
  Alert,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {Header, Input, Button} from 'react-native-elements';
import {CompositeNavigationProp} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {StackNavigationProp} from '@react-navigation/stack';
import {connect} from 'react-redux';
import {ImageOrVideo} from 'react-native-image-crop-picker';
import SnackBar from 'react-native-snackbar';
import RBSheet from 'react-native-raw-bottom-sheet';
import Share from 'react-native-share';
import MI from 'react-native-vector-icons/MaterialIcons';
import Config from 'react-native-config';
// @ts-ignore
import RazorPay from 'react-native-razorpay';

import {PhotoPicker} from '../components/common';
import {CheckBox} from '../../shared/components/common';
import {Pricing} from '../../shared/components/main';

import {StoreState} from '../../shared/global';
import {
  Class,
  updateClasses,
  registerCurrentClass,
  removeClass,
  revokeCurrentClass,
} from '../../shared/global/actions/classes';
import {RootStackParamList, DrawerParamList} from '../navigators/types';
import {ContainerStyles, ImageStyles} from '../../shared/styles/styles';
import {
  mediaUrl,
  classUrl,
  studentUrl,
  paymentUrl,
} from '../../shared/utils/urls';
import {commonBlue, flatRed} from '../../shared/styles/colors';

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
  revokeCurrentClass: typeof revokeCurrentClass;
  isOwner: boolean;
  profile: {
    name: string;
    username: string;
    avatar: string;
  };
  classes: Class[];
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

  unEnroll = () => {
    const removeFromClass = () => {
      this.setState({loading: true});
      axios
        .delete(
          `${studentUrl}/${this.props.profile.username}/${
            this.props.currentClass!.id
          }`,
          {
            headers: {
              Authorization: `Bearer ${this.props.token}`,
            },
          },
        )
        .then(() => {
          this.setState({loading: false});
          this.props.removeClass(this.props.currentClass!.id);
          this.props.navigation.navigate('Home');
          this.props.revokeCurrentClass(this.props.classes);
        })
        .catch(() => {
          this.setState({loading: false});
          SnackBar.show({
            text: 'Unable to unenroll at the moment. Please try again later',
            duration: SnackBar.LENGTH_LONG,
            textColor: '#fff',
            backgroundColor: flatRed,
          });
        });
    };

    Alert.alert(
      'Confirm',
      `Are you sure to unenroll from ${
        this.props.currentClass!.name
      }? You won't have access to this class.`,
      [
        {
          text: 'Cancel',
        },
        {
          text: 'Yes',
          onPress: removeFromClass,
        },
      ],
    );
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

  shareCode = () => {
    Share.open({
      title: 'Join my class on EasyTeach',
      message: `Join my class on EasyTeach, through this code: ${
        this.props.currentClass!.joinCode
      }, Download app from https://play.google.com/store/apps/details?id=com.hcodes.easyteach`,
    })
      .then(() => null)
      .catch(() => null);
  };

  getSubscription = async () => {
    try {
      const res = await axios.post<{id: string; url: string}>(
        `${paymentUrl}/${this.props.currentClass!.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
        },
      );
      console.log(Config.key_id);

      const pay = await RazorPay.open({
        key: Config.key_id,
        subscription_id: res.data.id,
        name: 'Easy Teach',
        description: 'Test plan',
        theme: {
          color: commonBlue,
        },
      });
      console.log(pay);
    } catch (e) {
      console.log(e);
    }
  };

  render() {
    const {name, about, subject, lockJoin, photo, loading} = this.state;
    const {joinCode} = this.props.currentClass!;
    const {isOwner} = this.props;
    return (
      <View style={ContainerStyles.parent}>
        <Header
          centerComponent={{
            text: this.props.isOwner ? 'Manage' : 'Info',
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
          <View style={{padding: 20}}>
            {isOwner ? (
              <ImageBackground
                style={ImageStyles.classImage}
                source={{uri: photo.uri}}>
                <TouchableOpacity
                  style={ImageStyles.imageOverlay}
                  onPress={() => this.sheet!.open()}>
                  <MI name="camera-alt" color="#000" size={28} />
                </TouchableOpacity>
              </ImageBackground>
            ) : (
              <FastImage
                style={ImageStyles.classImage}
                source={{uri: photo.uri}}
              />
            )}

            <Input
              value={name}
              disabled={loading || !isOwner}
              label="Name"
              onChangeText={(text) => this.setState({name: text})}
            />
            <Input
              value={about}
              label="About"
              disabled={loading || !isOwner}
              numberOfLines={3}
              multiline
              onChangeText={(text) => this.setState({about: text})}
            />
            <Input
              value={subject}
              label="Subject"
              disabled={loading || !isOwner}
              onChangeText={(text) => this.setState({subject: text})}
            />
            {isOwner && (
              <>
                <Input
                  value={joinCode}
                  label="Join Code"
                  rightIcon={{
                    name: 'share',
                    type: 'material',
                    onPress: this.shareCode,
                  }}
                  disabled
                />
                <CheckBox
                  checked={lockJoin}
                  title="Lock Join"
                  onPress={() => this.setState({lockJoin: !lockJoin})}
                  desc="Enabling this will not allow anyone to join the class."
                />
              </>
            )}

            {isOwner ? (
              <>
                <Button
                  title="Save"
                  onPress={this.updateClass}
                  loading={loading}
                  containerStyle={{marginTop: 20}}
                />

                <Button
                  title="Upgrade"
                  containerStyle={{marginTop: 20}}
                  onPress={this.getSubscription}
                />

                <Pricing />
              </>
            ) : (
              <Button
                title="Unenroll"
                loading={loading}
                buttonStyle={{backgroundColor: flatRed}}
                onPress={this.unEnroll}
                containerStyle={{marginTop: 20}}
              />
            )}
          </View>
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
  let isOwner = false;
  if (state.currentClass!.owner.username === state.profile.username) {
    isOwner = true;
  }
  return {
    currentClass: state.currentClass,
    token: state.token,
    isOwner,
    profile: state.profile,
    classes: state.classes,
  };
};

export default connect(mapStateToProps, {
  updateClasses,
  registerCurrentClass,
  removeClass,
  revokeCurrentClass,
})(ManageClass);
