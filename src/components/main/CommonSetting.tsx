import React from 'react';
import {
  View,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Button, ButtonProps} from 'react-native-elements';

import {greyWithAlpha} from '../../styles/colors';

interface Props {
  imageSource: ImageSourcePropType;
  onImagePress(): any;
  onButtonPress(): any;
  buttonLoading?: boolean;
  buttonProps?: ButtonProps;
  children?: JSX.Element[] | JSX.Element;
}

const CommonSetting = (props: Props) => {
  const {createClassContainer, classImage, imageOverlay} = styles;

  return (
    <View style={createClassContainer}>
      <View>
        <ImageBackground style={classImage} source={props.imageSource}>
          <TouchableOpacity style={imageOverlay} onPress={props.onImagePress}>
            <MaterialIcons name="camera-alt" color="#000" size={28} />
          </TouchableOpacity>
        </ImageBackground>
      </View>

      <View>
        {props.children}
        <Button
          {...props.buttonProps}
          loading={props.buttonLoading}
          onPress={props.onButtonPress}
        />
      </View>
    </View>
  );
};

CommonSetting.defaultProps = {
  loading: false,
};

const styles = StyleSheet.create({
  createClassContainer: {
    marginTop: 30,
    padding: 10,
  },
  classImage: {
    height: 100,
    width: 100,
    borderWidth: 1,
    borderRadius: 50,
    borderColor: 'transparent',
    overflow: 'hidden',
    alignSelf: 'center',
  },
  imageOverlay: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 50,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: greyWithAlpha(0.3),
  },
});

export {CommonSetting};
