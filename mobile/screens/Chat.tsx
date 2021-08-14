import React, {useState, useCallback, useEffect} from 'react';
import {
  GiftedChat,
  IChatMessage,
  AvatarProps,
  IMessage,
} from 'react-native-gifted-chat';

import {Avatar} from '../../shared/components/common';

const Chat = () => {
  const [messages, setMessages] = useState<IChatMessage[]>([]);

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: 'Hello developer',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'React Native',
          avatar: 'https://placeimg.com/140/140/any',
        },
      },
    ]);
  }, []);

  const onSend = useCallback((message: IChatMessage[] = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, message),
    );
  }, []);

  const renderAvatar = (avatarProps: AvatarProps<IMessage>) => {
    return (
      <Avatar
        source={{uri: `${avatarProps.currentMessage?.user.avatar}`}}
        style={{height: 40, width: 40, borderRadius: 20}}
      />
    );
  };

  return (
    <GiftedChat
      messages={messages}
      onSend={onSend}
      user={{
        _id: 1,
      }}
      renderAvatar={renderAvatar}
    />
  );
};

export default Chat;
