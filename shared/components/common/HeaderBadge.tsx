import React from 'react';
import {Badge} from 'react-native-elements';

type Props = {
  value?: number;
};

export const HeaderBadge: React.FC<Props> = (props) => {
  return (
    <Badge
      status="error"
      value={props.value}
      badgeStyle={{
        position: 'absolute',
        right: -30,
        top: -12,
        height: 12,
        width: 12,
        borderColor: 'transparent',
        borderWidth: 1,
        borderRadius: 6,
      }}
    />
  );
};
