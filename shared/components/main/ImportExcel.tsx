import React from 'react';
// import PhotoView from 'react-native-photo-view-ex';
import LightBox from 'react-native-lightbox-v2';
import {View, StyleSheet, Linking} from 'react-native';
import FastImage from 'react-native-fast-image';
import {Header, Button, Text} from 'react-native-elements';

import {eucalyptusGreen} from '../../styles/colors';
import {mediaUrl} from '../../utils/urls';

interface Props {
  onBackPress: () => any;
  onImportPress: () => any;
}

const ImportExcel = (props: Props) => {
  const {container, content, secondaryText, imageStyle, expandText} = styles;

  return (
    <View style={container}>
      <Header
        centerComponent={{
          text: 'Before you continue',
          style: {fontSize: 24, color: '#fff', fontWeight: '600'},
        }}
        leftComponent={{
          icon: 'arrow-back',
          color: '#ffff',
          size: 26,
          onPress: props.onBackPress,
        }}
      />
      <View style={content}>
        <Text h4>We need question sheet</Text>
        <Text>
          {`You're accessing most secure way to conduct tests:
1. Students cannot take screenshots during test.
2. Switching between apps will result in restart of test with shuffled questions.
3. Even options order are randomized.
4. Automated result generation.`}
        </Text>
        <Text style={secondaryText}>
          Create your own test by importing excel file in given format
        </Text>

        <LightBox>
          <FastImage
            source={require('../../../shared/images/sheet.png')}
            style={imageStyle}
            resizeMode="stretch"
          />
          <Text style={expandText}>*click to expand</Text>
        </LightBox>

        <Button
          title="Import Sheet"
          icon={{
            name: 'microsoft-excel',
            type: 'material-community',
            color: '#fff',
          }}
          containerStyle={{marginTop: 20}}
          onPress={props.onImportPress}
        />

        <Button
          title="Download Sample"
          containerStyle={{marginTop: 10}}
          buttonStyle={{backgroundColor: eucalyptusGreen}}
          icon={{
            name: 'file-download',
            type: 'font-awesome-5',
            color: '#fff',
            size: 24,
          }}
          onPress={() => Linking.openURL(`${mediaUrl}/sample`)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffff',
  },
  content: {
    padding: 20,
  },
  secondaryText: {
    color: 'grey',
    marginTop: 10,
  },
  imageStyle: {
    height: 140,
    width: '100%',
    marginTop: 10,
  },
  expandText: {
    fontSize: 12,
  },
});

export {ImportExcel};
