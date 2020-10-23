import React from 'react';
import {View} from 'react-native';
import {Header} from 'react-native-elements';
import {connect} from 'react-redux';
import {CompositeNavigationProp} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {StackNavigationProp} from '@react-navigation/stack';

import {
  RootStackParamList,
  DrawerParamList,
  BottomTabParamList,
} from '../navigators/types';
import {StoreState} from '../global';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'People'>,
  CompositeNavigationProp<
    DrawerNavigationProp<DrawerParamList>,
    StackNavigationProp<RootStackParamList>
  >
>;

interface Props {
  profile: {
    name: string;
    username: string;
  };
  navigation: NavigationProp;
}

const Home = (props: Props): JSX.Element => {
  return (
    <View>
      <Header
        centerComponent={{
          text: 'Home',
          style: {fontSize: 24, color: '#fff', fontWeight: '600'},
        }}
        leftComponent={{
          icon: 'menu',
          color: '#ffff',
          size: 26,
          onPress: () => props.navigation.openDrawer(),
        }}
      />
    </View>
  );
};

const mapStateToProps = (state: StoreState) => {
  return {
    profile: state.profile,
  };
};

export default connect(mapStateToProps)(Home);
