import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import {View} from 'react-native-animatable';

import TouchableView from './TouchableView';

interface Props {
  onPress: () => void;
  isEnabled: boolean;
  isLoading: boolean;
  text: string;
  buttonStyle: ViewStyle;
  textStyle: TextStyle;
}

const CustomButton = ({
  onPress,
  isEnabled,
  isLoading,
  text,
  buttonStyle,
  textStyle,
  ...otherProps
}: Props) => {
  const onButtonPress = isEnabled && !isLoading ? onPress : () => null;

  return (
    <View {...otherProps}>
      <TouchableView
        onPress={onButtonPress}
        // @ts-ignore
        style={[styles.button, buttonStyle]}>
        {isLoading ? (
          <ActivityIndicator style={styles.spinner} color={'grey'} />
        ) : (
          <Text style={[styles.text, textStyle]}>{text}</Text>
        )}
      </TouchableView>
    </View>
  );
};

CustomButton.defaultProps = {
  onPress: () => null,
  isEnabled: true,
  isLoading: false,
};

const styles = StyleSheet.create({
  button: {
    height: 42,
    borderWidth: 1,
    borderRadius: 3,
    alignSelf: 'stretch',
    justifyContent: 'center',
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  spinner: {
    height: 26,
  },
  text: {
    textAlign: 'center',
    fontWeight: '400',
    color: 'white',
  },
});

export default CustomButton;
