import React, {memo} from 'react';
import {TouchableOpacity, Text, Image as FastImage} from 'react-native';
import {Badge} from 'react-native-elements';

import {ImageStyles} from '../../styles/styles';

interface Props {
  onPress: () => void;
  photo: string;
  name: string;
  unread: number | undefined;
}

export const SMClass: React.FC<Props> = memo(
  ({onPress, photo, name, unread}) => {
    return (
      <TouchableOpacity onPress={onPress}>
        <FastImage
          source={{
            uri: photo,
          }}
          style={ImageStyles.classAvatarImage}
        />
        {unread ? (
          <Badge
            status="error"
            value={unread}
            badgeStyle={{
              position: 'absolute',
              right: -1,
              top: -4,
            }}
          />
        ) : null}
        <Text numberOfLines={1} style={{fontSize: 16, fontWeight: '900'}}>
          {name}
        </Text>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    if (
      prevProps.name === nextProps.name &&
      prevProps.photo === nextProps.photo &&
      prevProps.unread === nextProps.unread
    ) {
      return true;
    }

    return false;
  },
);
