import React from 'react';
import {Header, Button} from 'react-native-elements';
import {StackNavigationProp} from '@react-navigation/stack';

import {RootStackParamList} from '../navigators/types';

type NavigationProps = StackNavigationProp<RootStackParamList>;

interface Props {
  navigation: NavigationProps;
}

const Test = (props: Props) => {
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

      <Button
        title="Open Quiz"
        onPress={() => props.navigation.navigate('Quiz')}
      />
    </>
  );
};

export default Test;
