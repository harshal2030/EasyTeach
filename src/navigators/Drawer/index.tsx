import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';

import DrawerContent from './DrawerContent';
import {DrawerParamList} from '../types';

import Home from '../../screens/Home';

const Drawer = createDrawerNavigator<DrawerParamList>();

const DrawerNavigator = (): JSX.Element => {
  return (
    <Drawer.Navigator
      // eslint-disable-next-line react-native/no-inline-styles
      drawerStyle={{width: '90%'}}
      hideStatusBar={true}
      // @ts-ignore
      drawerContent={(props) => <DrawerContent {...props} />}>
      <Drawer.Screen name="Home" component={Home} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
