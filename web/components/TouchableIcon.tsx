import React from 'react';
import {TouchableOpacity, ViewStyle} from 'react-native';
import {Icon, IconifyIcon} from '@iconify/react';

interface Props extends IconifyIcon {
  onPress?: () => void;
  size?: number;
  containerStyle?: ViewStyle;
}

const TouchableIcon = ({icon, onPress, size, color, containerStyle}: Props) => {
  if (!onPress) {
    return <Icon icon={icon} height={size} width={size} color={color} />;
  }

  return (
    <TouchableOpacity onPress={onPress} style={containerStyle}>
      <Icon icon={icon} height={size} width={size} color={color} />
    </TouchableOpacity>
  );
};

export {TouchableIcon};
