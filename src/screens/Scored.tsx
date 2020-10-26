import React from 'react';
import {View, Text} from 'react-native';
import {Header} from 'react-native-elements';

const Scored = () => {
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
        <Text>Hello scored!</Text>
      </View>
    </>
  );
};

export default Scored;
