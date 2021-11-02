import React, {useState, useRef, useEffect} from 'react';
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
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
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
import {flatRed} from '../../shared/styles/colors';

type NavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DrawerParamList, 'Manage'>,
  NativeStackNavigationProp<RootStackParamList>
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

const ManageClass: React.FC<Props> = (props) => {
  const [name, setName] = useState(props.currentClass!.name);
  const [about, setAbout] = useState(props.currentClass!.about);
  const [subject, setSubject] = useState(props.currentClass!.subject);
  const [lockJoin, setLockJoin] = useState(props.currentClass!.lockJoin);
  const [photo, setPhoto] = useState({
    uri: `${mediaUrl}/class/avatar/${props.currentClass!.photo}`,
    type: 'image/png',
  });
  const [lockMsg, setLockMsg] = useState(props.currentClass!.lockMsg);
  const [loading, setLoading] = useState(false);

  const sheet = useRef<RBSheet | null>(null);

  useEffect(() => {
    onClassChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.currentClass?.id]);

  const onClassChange = () => {
    setName(props.currentClass!.name);
    setAbout(props.currentClass!.about);
    setSubject(props.currentClass!.subject);
    setLockJoin(props.currentClass!.lockJoin);
    setLockMsg(props.currentClass!.lockMsg);
    setPhoto({
      uri: `${mediaUrl}/class/avatar/${props.currentClass!.photo}`,
      type: 'image/png',
    });
  };

  const onImage = (image: ImageOrVideo) => {
    sheet.current!.close();
    setPhoto({
      uri: image.path,
      type: image.mime,
    });
  };

  const onImageError = () => {
    SnackBar.show({
      text: 'Unable to pick image.',
      duration: SnackBar.LENGTH_SHORT,
    });
    sheet.current!.close();
  };

  const unEnroll = () => {
    const removeFromClass = () => {
      setLoading(true);
      axios
        .delete(
          `${studentUrl}/${props.profile.username}/${props.currentClass!.id}`,
          {
            headers: {
              Authorization: `Bearer ${props.token}`,
            },
          },
        )
        .then(() => {
          setLoading(false);
          props.removeClass(props.currentClass!.id);
          props.navigation.navigate('Home');
          props.revokeCurrentClass(props.classes);
        })
        .catch(() => {
          setLoading(false);
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
        props.currentClass!.name
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

  const updateClass = () => {
    setLoading(true);
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

    if (photo.uri !== `${mediaUrl}/class/avatar/${props.currentClass?.photo}`) {
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
      .put<Class>(`${classUrl}/${props.currentClass!.id}`, reqBody, {
        headers: {
          Authorization: `Bearer ${props.token}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        setLoading(false);
        if (res.status !== 200) {
          throw new Error();
        }
        props.updateClasses(res.data);
        props.registerCurrentClass(res.data);
        props.navigation.goBack();
      })
      .catch((e) => {
        setLoading(false);
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

  const shareCode = () => {
    Share.open({
      title: 'Join my class on EasyTeach',
      message: `Join my class on EasyTeach, through this code: https://easyteach.inddex.co/joinclass?c=${
        props.currentClass!.joinCode
      }. Download app from https://play.google.com/store/apps/details?id=com.hcodes.easyteach`,
    })
      .then(() => null)
      .catch(() => null);
  };

  const renderNextPayDate = () => {
    const {currentClass, premiumAllowed, isOwner} = props;

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

  const {joinCode} = props.currentClass!;
  const {isOwner, premiumAllowed} = props;
  return (
    <View style={ContainerStyles.parent}>
      <Header
        centerComponent={{
          text: isOwner ? 'Manage' : 'Info',
          style: {fontSize: 24, color: '#fff', fontWeight: '600'},
        }}
        leftComponent={
          <>
            <Icon
              name="menu"
              tvParallaxProperties
              size={26}
              onPress={props.navigation.openDrawer}
              color="#ffff"
            />
            {props.unread !== 0 ? <HeaderBadge /> : null}
          </>
        }
      />

      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={{padding: 20}}>
          {isOwner ? (
            <FastImage style={ImageStyles.classImage} source={{uri: photo.uri}}>
              <TouchableOpacity
                style={ImageStyles.imageOverlay}
                onPress={() => sheet.current!.open()}>
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
            defaultValue={name}
            disabled={loading || !isOwner}
            label="Class Name"
            onChangeText={setName}
          />
          <Input
            value={props.currentClass!.owner.name}
            label="Class Owner"
            disabled
          />
          <Input
            defaultValue={about}
            label="About"
            disabled={loading || !isOwner}
            numberOfLines={3}
            multiline
            onChangeText={setAbout}
          />
          <Input
            defaultValue={subject}
            label="Subject"
            disabled={loading || !isOwner}
            onChangeText={setSubject}
          />
          {renderNextPayDate()}
          {isOwner && (
            <>
              <Input
                value={joinCode}
                label="Join Code"
                rightIcon={{
                  name: 'share',
                  type: 'material',
                  onPress: shareCode,
                }}
                disabled
              />
              <CheckBox
                checked={lockMsg}
                title="Lock Messages"
                desc="Enabling this will not allow students to send messages."
                onPress={() => setLockMsg((prev) => !prev)}
              />
              <CheckBox
                checked={lockJoin}
                title="Lock Join"
                onPress={() => setLockJoin((prev) => !prev)}
                desc="Enabling this will not allow anyone to join the class."
              />
            </>
          )}

          {isOwner ? (
            <>
              <Button
                title="Save"
                onPress={updateClass}
                loading={loading}
                containerStyle={{marginTop: 20}}
              />
            </>
          ) : (
            <Button
              title="Unenroll"
              loading={loading}
              buttonStyle={{backgroundColor: flatRed}}
              onPress={unEnroll}
              containerStyle={{marginTop: 20}}
            />
          )}

          {isOwner && !premiumAllowed && (
            <Button
              title="Upgrade"
              containerStyle={{marginTop: 20}}
              onPress={() => props.navigation.navigate('Checkout')}
            />
          )}
        </View>
      </ScrollView>

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
