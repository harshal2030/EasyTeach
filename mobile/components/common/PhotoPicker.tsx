import React, {MutableRefObject} from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ImagePicker, {
  ImageOrVideo,
  Options,
} from 'react-native-image-crop-picker';

type Props = {
  sheetRef: MutableRefObject<RBSheet | null>;
  onCameraImage(image: ImageOrVideo): any;
  onPickerImage(image: ImageOrVideo): any;
  onCameraError(e?: any): any;
  onPickerError(e?: any): any;
  cameraProps?: Options;
  pickerProps?: Options;
  children?: JSX.Element | JSX.Element[];
};

const PhotoPicker = (props: Props) => {
  const {RBOptionContainer, RBTextStyle} = styles;

  const openCamera = () => {
    ImagePicker.openCamera(props.cameraProps!)
      .then(props.onCameraImage)
      .catch(props.onCameraError);
  };

  const openPicker = () => {
    ImagePicker.openPicker(props.pickerProps!)
      .then(props.onPickerImage)
      .catch(props.onCameraError);
  };

  return (
    <RBSheet
      height={150}
      ref={props.sheetRef}
      closeOnPressMask
      closeOnDragDown
      customStyles={{
        container: {
          borderTopWidth: 1,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          borderColor: 'transparent',
        },
      }}>
      <View>
        <TouchableOpacity style={RBOptionContainer} onPress={openPicker}>
          <MaterialIcons name="image" color="#000" size={24} />
          <Text style={RBTextStyle}>Pick from Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={RBOptionContainer} onPress={openCamera}>
          <MaterialIcons name="camera" color="#000" size={24} />
          <Text style={RBTextStyle}>Shoot from Camera</Text>
        </TouchableOpacity>
        {props.children}
      </View>
    </RBSheet>
  );
};

PhotoPicker.defaultProps = {
  cameraProps: {
    height: 800,
    width: 800,
    cropping: true,
  },
  pickerProps: {
    height: 800,
    width: 800,
    cropping: true,
  },
};

const styles = StyleSheet.create({
  RBOptionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  RBTextStyle: {
    fontSize: 20,
    fontWeight: '400',
  },
});

export {PhotoPicker};
