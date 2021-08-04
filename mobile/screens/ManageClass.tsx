import React from 'react';
import axios from 'axios';
import {
  View,
  ScrollView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {Header, Input, Button, Icon} from 'react-native-elements';
import {CompositeNavigationProp} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {StackNavigationProp} from '@react-navigation/stack';
import {connect} from 'react-redux';
import {ImageOrVideo} from 'react-native-image-crop-picker';
import SnackBar from 'react-native-snackbar';
import RBSheet from 'react-native-raw-bottom-sheet';
import Share from 'react-native-share';
import MI from 'react-native-vector-icons/MaterialIcons';

import {HeaderBadge} from '../../shared/components/common';
import {PhotoPicker} from '../components/common';
import {CheckBox} from '../../shared/components/common';

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
import {mediaUrl, classUrl, studentUrl} from '../../shared/utils/urls';
import {flatRed, eucalyptusGreen} from '../../shared/styles/colors';

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
  premiumAllowed: boolean;
  unread: number;
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
  lockMsg: boolean;
}

class ManageClass extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const {name, photo, about, subject, lockJoin, lockMsg} =
      this.props.currentClass!;

    this.state = {
      name,
      about,
      subject,
      lockJoin,
      lockMsg,
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
    const {name, subject, about, photo, lockJoin, lockMsg} = this.state;
    const reqBody = new FormData();

    reqBody.append(
      'info',
      JSON.stringify({
        name,
        subject,
        about,
        lockJoin,
        lockMsg,
      }),
    );

    if (
      photo.uri !== `${mediaUrl}/class/avatar/${this.props.currentClass?.photo}`
    ) {
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
        console.log(JSON.stringify(e));
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
      message: `Join my class on EasyTeach, through this code: https://easyteach.inddex.co/joinclass?c=${
        this.props.currentClass!.joinCode
      }. Download app from https://play.google.com/store/apps/details?id=com.hcodes.easyteach`,
    })
      .then(() => null)
      .catch(() => null);
  };

  renderUpgradeButton = () => {
    if (this.props.isOwner && this.props.currentClass!.planId === 'free') {
      return (
        <Button
          title="Upgrade"
          buttonStyle={{backgroundColor: eucalyptusGreen}}
          containerStyle={{marginTop: 20}}
          onPress={() => this.props.navigation.navigate('Checkout')}
        />
      );
    }
  };

  renderNextPayDate = () => {
    const {currentClass, premiumAllowed, isOwner} = this.props;

    if (isOwner) {
      const nextPay = currentClass!.payedOn
        ? new Date(currentClass!.payedOn)
        : new Date();

      if (currentClass!.payedOn) {
        nextPay.setDate(nextPay.getDate() + 30);
      }

      const value = nextPay.toDateString();

      if (premiumAllowed) {
        return <Input value={value} disabled label="Next Payment Date" />;
      }

      if (!premiumAllowed && currentClass?.payedOn) {
        return <Input value="Today" disabled label="Next Payment Date" />;
      }
    }
  };

  render() {
    const {name, about, subject, lockJoin, photo, loading, lockMsg} =
      this.state;
    const {joinCode} = this.props.currentClass!;
    const {isOwner, premiumAllowed} = this.props;

    return (
      <View style={ContainerStyles.parent}>
        <Header
          centerComponent={{
            text: this.props.isOwner ? 'Manage' : 'Info',
            style: {fontSize: 24, color: '#fff', fontWeight: '600'},
          }}
          leftComponent={
            <>
              <Icon
                name="menu"
                size={26}
                onPress={this.props.navigation.openDrawer}
                color="#ffff"
              />
              {this.props.unread !== 0 ? <HeaderBadge /> : null}
            </>
          }
        />

        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={{padding: 20}}>
            {isOwner ? (
              <FastImage
                style={ImageStyles.classImage}
                source={{uri: photo.uri}}>
                <TouchableOpacity
                  style={ImageStyles.imageOverlay}
                  onPress={() => this.sheet!.open()}>
                  <MI name="camera-alt" color="#000" size={28} />
                </TouchableOpacity>
              </FastImage>
            ) : (
              <FastImage
                style={ImageStyles.classImage}
                source={{uri: photo.uri}}
              />
            )}

            <Input
              value={name}
              disabled={loading || !isOwner}
              label="Class Name"
              onChangeText={(text) => this.setState({name: text})}
            />
            <Input
              value={this.props.currentClass!.owner.name}
              label="Class Owner"
              disabled
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
            {this.renderNextPayDate()}
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
                  checked={lockMsg}
                  title="Lock Messages"
                  desc="Enabling this will not allow students to send messages."
                  onPress={() => this.setState({lockMsg: !lockMsg})}
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

            {isOwner && !premiumAllowed && (
              <Button
                title="Upgrade"
                containerStyle={{marginTop: 20}}
                onPress={() => this.props.navigation.navigate('Checkout')}
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

  let premiumAllowed: boolean = false;

  if (state.currentClass!.planId !== 'free') {
    premiumAllowed = true;
  }
  return {
    currentClass: state.currentClass,
    token: state.token,
    isOwner,
    profile: state.profile,
    classes: state.classes.classes,
    premiumAllowed,
    unread: state.unreads.totalUnread,
  };
};

export default connect(mapStateToProps, {
  updateClasses,
  registerCurrentClass,
  removeClass,
  revokeCurrentClass,
})(ManageClass);
