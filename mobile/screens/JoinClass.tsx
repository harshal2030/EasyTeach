import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import {connect} from 'react-redux';
import {ImageOrVideo} from 'react-native-image-crop-picker';
import {Header, Input, Button, ButtonGroup} from 'react-native-elements';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import RBSheet from 'react-native-raw-bottom-sheet';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../navigators/types';
import SnackBar from 'react-native-snackbar';
import * as Analytics from 'expo-firebase-analytics';

import {PhotoPicker} from '../components/common';

import {CommonSetting} from '../../shared/components/main';
import {classUrl, mediaUrl} from '../../shared/utils/urls';
import {socket} from '../../shared/socket';

import {
  Class,
  addClass,
  registerCurrentClass,
} from '../../shared/global/actions/classes';
import {StoreState} from '../../shared/global';
import {eucalyptusGreen} from '../../shared/styles/colors';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'JoinClass'>;
  token: string;
  route: RouteProp<RootStackParamList, 'JoinClass'>;
  classes: Class[];
  addClass: typeof addClass;
  registerCurrentClass: typeof registerCurrentClass;
};

type State = {
  selected: number;
  photo: {
    uri: string;
    type: string;
  };
  joinCode: string;
  className: string;
  about: string;
  subject: string;
  loading: boolean;
};

const JoinClass: React.FC<Props> = (props) => {
  const [selected, setSelected] = useState(0);
  const [photo, setPhoto] = useState({
    uri: `${mediaUrl}/class/avatar`,
    type: '',
  });
  const [joinCode, setJoinCode] = useState(props.route.params?.c || '');
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);

  const sheet = useRef<RBSheet | null>(null);

  const joinSocketRoom = (classId: string) => {
    socket.emit('class:join_create', classId);
  };

  useEffect(() => {
    if (props.route.params?.c) {
      joinClassRequest();
    }
  });

  const joinClassRequest = () => {
    setLoading(true);
    axios
      .post<Class>(
        `${classUrl}/join`,
        {
          joinCode,
        },
        {
          headers: {
            Authorization: `Bearer ${props.token}`,
          },
        },
      )
      .then((res) => {
        props.registerCurrentClass(res.data);
        props.addClass(res.data);
        props.navigation.navigate('Drawer');
        joinSocketRoom(res.data.id);

        SnackBar.show({
          text: `Successfully joined ${res.data.name} class, open drawer to navigate to new class`,
          backgroundColor: eucalyptusGreen,
          duration: SnackBar.LENGTH_LONG,
          textColor: '#fff',
        });
      })
      .catch((e) => {
        setLoading(false);
        if (e.response && e.response.status === 400) {
          return Alert.alert('Oops!', e.response.data.error);
        }

        Analytics.logEvent('http_error', {
          url: `${classUrl}/join`,
          method: 'post',
          reason: 'unk',
        });

        SnackBar.show({
          text: 'Unable to join class at the moment',
          duration: SnackBar.LENGTH_SHORT,
        });
      });
  };

  const createClassRequest = () => {
    setLoading(true);
    const reqBody = new FormData();

    reqBody.append(
      'info',
      JSON.stringify({
        name: className,
        subject,
      }),
    );

    if (photo.uri !== `${mediaUrl}/class/avatar`) {
      reqBody.append('classPhoto', {
        // @ts-ignore
        name: 'photo.jpeg',
        type: photo.type || 'image/jpeg',
        uri:
          Platform.OS === 'android'
            ? photo.uri
            : photo.uri.replace('file://', ''),
      });
    }

    axios
      .post<Class>(classUrl, reqBody, {
        headers: {
          Authorization: `Bearer ${props.token}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        props.addClass(res.data);
        props.registerCurrentClass(res.data);
        joinSocketRoom(res.data.id);
        props.navigation.navigate('Drawer');
      })
      .catch((e) => {
        setLoading(false);
        if (e.response) {
          if (e.response.status === 400) {
            return Alert.alert('Oops!', e.response.data.error);
          }
        }

        Analytics.logEvent('http_error', {
          url: {classUrl},
          method: 'post',
          reason: 'unk',
        });

        SnackBar.show({
          text: 'Unable to create class at the moment. Please try again later',
          duration: SnackBar.LENGTH_LONG,
        });
      });
  };

  const joinClass = () => {
    const {joinClassContainer, joinClassText} = styles;
    return (
      <KeyboardAvoidingView behavior="height" style={joinClassContainer}>
        <Text style={joinClassText}>
          Enter the 12(approx.) character code given by your teacher to join the
          class.
        </Text>
        <Input
          label="Class Code"
          onChangeText={setJoinCode}
          defaultValue={joinCode}
        />
        <Button
          title="Join Class"
          loading={loading}
          onPress={joinClassRequest}
        />
      </KeyboardAvoidingView>
    );
  };

  const createClass = () => {
    return (
      <ScrollView>
        <CommonSetting
          buttonLoading={loading}
          onButtonPress={createClassRequest}
          buttonProps={{title: 'Create Class'}}
          imageSource={{uri: photo.uri}}
          onImagePress={() => sheet.current!.open()}>
          <Input
            label="Class Name"
            defaultValue={className}
            onChangeText={setClassName}
          />
          <Input
            label="Subject"
            defaultValue={subject}
            onChangeText={setSubject}
          />
        </CommonSetting>
      </ScrollView>
    );
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
      text: 'Unable to pick image',
      duration: SnackBar.LENGTH_SHORT,
    });
    sheet.current!.close();
  };

  const goBack = () => {
    if (props.navigation.canGoBack()) {
      props.navigation.goBack();
    } else {
      props.navigation.replace('Drawer');
    }
  };

  return (
    <View style={styles.mainContainer}>
      <Header
        leftComponent={
          <MaterialIcons
            name="arrow-back"
            color="#fff"
            size={28}
            onPress={goBack}
          />
        }
        centerComponent={{
          text: 'Join or Create class',
          style: {fontSize: 20, color: '#ffff'},
        }}
      />
      <View style={styles.RBContainer}>
        <ButtonGroup
          buttons={['Join Class', 'Create Class']}
          disabled={loading}
          onPress={setSelected}
          selectedIndex={selected}
        />
      </View>

      {selected === 0 ? joinClass() : createClass()}

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

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  RBContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  joinClassContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  joinClassText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 20,
  },
});

const mapStateToProps = (state: StoreState) => {
  return {
    token: state.token!,
    classes: state.classes.classes,
  };
};

export default connect(mapStateToProps, {addClass, registerCurrentClass})(
  JoinClass,
);
