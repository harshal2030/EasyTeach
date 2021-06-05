import React from 'react';
import {TouchableOpacity} from 'react-native';
import {Icon, IconifyIcon} from '@iconify/react';

interface Props extends IconifyIcon {
  onPress?: () => void;
  size?: number;
}

const TouchableIcon = ({icon, onPress, size, color}: Props) => {
  if (!onPress) {
    return <Icon icon={icon} height={size} width={size} color={color} />;
  }

  return (
    <TouchableOpacity onPress={onPress}>
      <Icon icon={icon} height={size} width={size} color={color} />
    </TouchableOpacity>
  );
};

export {TouchableIcon};
