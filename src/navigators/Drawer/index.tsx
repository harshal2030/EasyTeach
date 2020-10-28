import React from 'react';
import {useWindowDimensions} from 'react-native';
import {createDrawerNavigator} from '@react-navigation/drawer';

import DrawerContent from './DrawerContent';
import {DrawerParamList} from '../types';

import Home from '../bottom-tabs/Home';
import TestTabs from '../bottom-tabs/TestTabs';

const Drawer = createDrawerNavigator<DrawerParamList>();

const DrawerNavigator = (): JSX.Element => {
  const width = useWindowDimensions().width;
  const isLargeScreen = width >= 768;
  return (
    <Drawer.Navigator
      hideStatusBar={true}
      // eslint-disable-next-line react-native/no-inline-styles
      drawerStyle={{width: isLargeScreen ? 350 : '88%'}}
      drawerType={isLargeScreen ? 'permanent' : 'front'}
      // @ts-ignore
      drawerContent={(props) => <DrawerContent {...props} />}>
      <Drawer.Screen name="Home" component={Home} />
      <Drawer.Screen name="Test" component={TestTabs} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
