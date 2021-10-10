import React, {useState, useRef} from 'react';
import {Platform, StyleSheet, TextInput, TextInputProps} from 'react-native';
import {View} from 'react-native-animatable';

const IS_ANDROID = Platform.OS === 'android';

interface Props extends TextInputProps {
  isEnabled: boolean;
  name?: string;
  withRef: boolean;
}

export const AuthTextInput: React.FC<Props> = (props) => {
  const [isFocused, setIsFocused] = useState(false);

  const textInputRef = useRef<TextInput>(null);

  const {isEnabled, ...otherProps} = props;
  const color = isEnabled ? 'white' : 'rgba(255,255,255,0.4)';
  const borderColor = isFocused ? 'white' : 'rgba(255,255,255,0.4)';
  return (
    <View style={styles.container}>
      <View style={[styles.textInputWrapper, {borderColor}]}>
        <TextInput
          ref={textInputRef}
          autoCapitalize={'none'}
          autoCorrect={false}
          style={[styles.textInput, {color}]}
          underlineColorAndroid="none"
          placeholderTextColor={'rgba(255,255,255,0.4)'}
          selectionColor={'white'}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...otherProps}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 2,
    marginBottom: 10,
  },
  textInputWrapper: {
    height: 42,
    marginBottom: 2,
    borderBottomWidth: 1,
  },
  textInput: {
    flex: 1,
    color: 'white',
    margin: IS_ANDROID ? -1 : 0,
    height: 42,
    padding: 7,
  },
});
