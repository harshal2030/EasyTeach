import React, {useState, useEffect, useCallback} from 'react';
import {Header} from 'react-native-elements';
import {
  GiftedChat,
  IChatMessage,
  AvatarProps,
  IMessage,
  Actions,
  ActionsProps,
} from 'react-native-gifted-chat';
import axios from 'axios';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-crop-picker';
import {connect} from 'react-redux';
import SnackBar from 'react-native-snackbar';

import {Avatar} from '../../shared/components/common';

import {socket} from '../../shared/socket';
import {RootStackParamList} from '../navigators/types';

import {StoreState} from '../../shared/global';
import {Class} from '../../shared/global/actions/classes';

import {discussUrl, mediaUrl} from '../../shared/utils/urls';
import {flatRed} from '../../shared/styles/colors';

type NavigationProp = StackNavigationProp<RootStackParamList, 'EditProfile'>;

type Props = {
  navigation: NavigationProp;
  profile: {
    name: string;
    username: string;
    avatar: string;
  };
  currentClass: Class;
  route: RouteProp<RootStackParamList, 'Chat'>;
  token: string;
};

const Chat: React.FC<Props> = (props) => {
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [image, setImage] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await axios.get<IMessage[]>(
        `${discussUrl}/msg/${props.currentClass.id}/${props.route.params.discussId}`,
        {
          headers: {
            Authorization: `Bearer ${props.token}`,
          },
        },
      );

      setMessages((prev) => GiftedChat.append(prev, res.data));
    } catch (e) {
      console.log(e);
      // TODO: render on error
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.currentClass.id, props.route.params.discussId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    const focusSub = props.navigation.addListener('focus', () => {
      socket.on(props.route.params.discussId, (data: IMessage) => {
        setMessages((prev) => GiftedChat.append(prev, [data]));
      });
    });

    const blurSub = props.navigation.addListener('blur', () => {
      socket.off(props.route.params.discussId);
    });

    return () => {
      focusSub();
      blurSub();
    };
  }, [props.route.params.discussId, props.navigation]);

  const onPicker = async () => {
    try {
      const res = await ImagePicker.openPicker({cropping: true});

      setImage(res.path);
    } catch (e) {
      SnackBar.show({
        text: 'No Image picked',
        textColor: '#fff',
        backgroundColor: flatRed,
        duration: SnackBar.LENGTH_SHORT,
      });
    }
  };

  const onCamera = async () => {
    try {
      const res = await ImagePicker.openCamera({cropping: true});

      setImage(res.path);
    } catch (e) {
      SnackBar.show({
        text: 'No Image picked',
        textColor: '#fff',
        backgroundColor: flatRed,
        duration: SnackBar.LENGTH_SHORT,
      });
    }
  };

  const onSend = (message: IChatMessage[] = []) => {
    const messageToAppend = {
      user: message[0].user,
      _id: message[0]._id,
      image: image ? image : undefined,
      createdAt: message[0].createdAt,
      text: message[0].text,
    };

    axios
      .post(
        `${discussUrl}/msg/${props.currentClass.id}/${props.route.params.discussId}`,
        {
          message: message[0].text,
        },
        {
          headers: {
            Authorization: `Bearer ${props.token}`,
          },
          params: {
            sid: socket.id,
          },
        },
      )
      .then(() => null)
      .catch(() => {
        SnackBar.show({
          text: 'Message was not sent successfully. It will be deleted',
          textColor: '#ffff',
          backgroundColor: flatRed,
          duration: SnackBar.LENGTH_LONG,
        });
      });

    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, [messageToAppend]),
    );
    setImage(null);
  };

  const renderAvatar = (avatarProps: AvatarProps<IMessage>) => {
    const url = avatarProps.currentMessage?.user.avatar;
    if (url) {
      return (
        <Avatar
          source={{
            uri: `${mediaUrl}/avatar/${avatarProps.currentMessage?.user.avatar}`,
          }}
          style={{height: 40, width: 40, borderRadius: 20}}
        />
      );
    }
  };

  const renderAction = (actionProps: Readonly<ActionsProps>) => {
    return (
      <Actions
        {...actionProps}
        options={{'Open Gallery': onPicker, 'Open Camera': onCamera}}
        onSend={(args) => console.log(args)}
        icon={() => <Ionicons name="add-circle-outline" size={28} />}
      />
    );
  };

  return (
    <>
      <Header
        centerComponent={{
          text: 'Chat',
          style: {fontSize: 24, color: '#fff', fontWeight: '600'},
        }}
        leftComponent={{
          icon: 'arrow-back',
          color: '#ffff',
          size: 26,
          onPress: props.navigation.goBack,
        }}
      />
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{
          _id: props.profile.username,
          name: props.profile.name,
        }}
        renderAvatar={renderAvatar}
        renderActions={renderAction}
        renderUsernameOnMessage
      />
    </>
  );
};

const mapStateToProps = (state: StoreState) => {
  return {
    profile: state.profile,
    currentClass: state.currentClass!,
    token: state.token!,
  };
};

export default connect(mapStateToProps)(Chat);
