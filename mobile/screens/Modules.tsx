import React from 'react';
import {View, Text} from 'react-native';
import {Header} from 'react-native-elements';
import {CompositeNavigationProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {DrawerNavigationProp} from '@react-navigation/drawer';

import {RootStackParamList, DrawerParamList} from '../navigators/types';

type navigation = CompositeNavigationProp<
  DrawerNavigationProp<DrawerParamList, 'Modules'>,
  StackNavigationProp<RootStackParamList>
>;

interface Props {
  navigation: navigation;
}

class Module extends React.Component<Props> {
  render() {
    return (
      <View>
        <Header
          centerComponent={{
            text: 'Tests',
            style: {fontSize: 24, color: '#ffff', fontWeight: '600'},
          }}
          leftComponent={{
            icon: 'menu',
            color: '#ffff',
            size: 26,
            onPress: () => this.props.navigation.openDrawer(),
          }}
        />
        <Text>Hello World</Text>
      </View>
    );
  }
}

export default Module;
