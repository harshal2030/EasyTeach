import React from 'react';
import {Image as FastImage} from 'react-native';
import LightBox from 'react-native-lightbox-v2';
import {View, StyleSheet} from 'react-native';
import {Header, Button, Text} from 'react-native-elements';
import {InlineIcon} from '@iconify/react';
import ExcelIcon from '@iconify-icons/mdi/microsoft-excel';
import FileIcon from '@iconify-icons/fa-solid/file-download';
import createIcon from '@iconify-icons/ic/baseline-create';

import {eucalyptusGreen} from '../../styles/colors';
import {mediaUrl} from '../../utils/urls';

interface Props {
  onBackPress: () => any;
  onImportPress: () => any;
  onManualPress: () => void;
  classId: string;
}

const ImportExcel = (props: Props) => {
  const {container, content, secondaryText, imageStyle, expandText} = styles;

  const ZoomImage = () => {
    return (
      <FastImage
        source={require('../../../shared/images/sheet.png')}
        resizeMode="contain"
        style={{height: '100%', width: '100%'}}
      />
    );
  };

  return (
    <View style={container}>
      <Header
        centerComponent={{
          text: 'Before you continue',
          style: {fontSize: 24, color: '#fff', fontWeight: '600'},
        }}
      />
      <View style={content}>
        <Text h4>We need question sheet</Text>
        <Text style={secondaryText}>
          You need to import excel file in given format
        </Text>

        <LightBox renderContent={ZoomImage}>
          <FastImage
            source={require('../../../shared/images/sheet.png')}
            style={imageStyle}
            resizeMode="stretch"
          />
          <Text style={expandText}>*click to expand</Text>
        </LightBox>

        <Button
          title="Import Sheet"
          icon={<InlineIcon icon={ExcelIcon} color="#fff" height={24} />}
          containerStyle={{marginTop: 20}}
          onPress={props.onImportPress}
        />

        <Button
          title="Manually create questions"
          icon={<InlineIcon icon={createIcon} color="#fff" height={24} />}
          containerStyle={{marginTop: 10}}
          onPress={props.onManualPress}
        />

        <a
          href={`${mediaUrl}/sample`}
          target="_blank"
          style={{textDecoration: 'none'}}>
          <Button
            title="Download Sample"
            containerStyle={{marginTop: 10}}
            buttonStyle={{backgroundColor: eucalyptusGreen}}
            icon={<InlineIcon icon={FileIcon} color="#fff" height={24} />}
          />
        </a>
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
export default ImportExcel;
