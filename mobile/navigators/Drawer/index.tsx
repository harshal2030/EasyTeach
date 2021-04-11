import React from 'react';
import {useWindowDimensions} from 'react-native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {connect} from 'react-redux';

import DrawerContent from './DrawerContent';
import {DrawerParamList} from '../types';
import {StoreState} from '../../../shared/global';
import {Class} from '../../../shared/global/actions/classes';

const Drawer = createDrawerNavigator<DrawerParamList>();

type Props = {
  currentClass: Class | null;
  profile: {
    name: string;
    username: string;
    avatar: string;
  };
};

const DrawerNavigator = (props: Props): JSX.Element => {
  const width = useWindowDimensions().width;
  const isLargeScreen = width >= 768;
  return (
    <Drawer.Navigator
      hideStatusBar={true}
      // eslint-disable-next-line react-native/no-inline-styles
      drawerStyle={{width: isLargeScreen ? 350 : '88%'}}
      drawerType={isLargeScreen ? 'permanent' : 'front'}
      // @ts-ignore
      drawerContent={(pprops) => <DrawerContent {...pprops} />}>
      <Drawer.Screen
        name="Home"
        component={require('../../screens/Announcements').default}
      />
      <Drawer.Screen
        name="People"
        component={require('../../screens/People').default}
      />
      {props.currentClass && (
        <Drawer.Screen
          name="Test"
          component={require('../../screens/Test').default}
        />
      )}
      {props.currentClass && (
        <Drawer.Screen
          name="Modules"
          component={require('../../screens/Modules').default}
        />
      )}
      {props.currentClass && (
        <Drawer.Screen
          name="Manage"
          component={require('../../screens/ManageClass').default}
        />
      )}
      <Drawer.Screen
        name="Settings"
        component={require('../../screens/Settings').default}
      />
    </Drawer.Navigator>
  );
};

const mapStateToProps = (state: StoreState) => {
  return {
    currentClass: state.currentClass,
    profile: state.profile,
  };
};

export default connect(mapStateToProps)(DrawerNavigator);
