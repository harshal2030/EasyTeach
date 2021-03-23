import React from 'react';
import {
  Platform,
  View,
  TouchableNativeFeedback,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';

const IS_ANDROID = Platform.OS === 'android';
const IS_RIPPLE_EFFECT_SUPPORTED = Platform.Version >= 21 && IS_ANDROID;

interface Props {
  isRippleDisabled: boolean;
  children: JSX.Element[] | JSX.Element | boolean | null;
  style: ViewStyle;
}

const TouchableView = ({
  isRippleDisabled,
  children,
  style,
  ...props
}: Props) => {
  if (IS_RIPPLE_EFFECT_SUPPORTED && !isRippleDisabled) {
    const background = TouchableNativeFeedback.Ripple('#FFF');
    return (
      <TouchableNativeFeedback {...props} background={background}>
        <View style={style}>{children}</View>
      </TouchableNativeFeedback>
    );
  } else {
    return (
      <TouchableOpacity {...props} style={style}>
        {children}
      </TouchableOpacity>
    );
  }
};

export default TouchableView;
