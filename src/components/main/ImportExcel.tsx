import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Header, Button, Text} from 'react-native-elements';

interface Props {
  onBackPress: () => any;
  onImportPress: () => any;
}

const ImportExcel = (props: Props) => {
  const {container, content, secondaryText, imageStyle} = styles;
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
        <Text style={secondaryText}>
          You need to import excel file in given format
        </Text>

        <View style={imageStyle} />

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
    height: 300,
    width: '100%',
    backgroundColor: 'red',
    marginTop: 10,
  },
});

export {ImportExcel};
