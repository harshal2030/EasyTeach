import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';

import DrawerContent from './DrawerContent';

import Home from '../../screens/Home';

type DrawerParamList = {
  Home: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

const DrawerNavigator = (): JSX.Element => {
  return (
    // eslint-disable-next-line react-native/no-inline-styles
    <Drawer.Navigator
      drawerStyle={{width: '85%'}}
      drawerContent={(props) => <DrawerContent {...props} />}>
      <Drawer.Screen name="Home" component={Home} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
