import React from 'react';
import {View, Text} from 'react-native';
import {Header} from 'react-native-elements';

const CreateTest = () => {
  return (
    <>
      <Header
        centerComponent={{
          text: 'Test',
          style: {fontSize: 24, color: '#fff', fontWeight: '600'},
        }}
        leftComponent={{
          icon: 'menu',
          color: '#ffff',
          size: 26,
        }}
      />
      <View>
        <Text>Hello test creators</Text>
      </View>
    </>
  );
};

export default CreateTest;
