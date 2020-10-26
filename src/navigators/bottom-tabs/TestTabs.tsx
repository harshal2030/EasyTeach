import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import {BottomTabTestParamList} from '../types';
import Test from '../../screens/Test';
import Scored from '../../screens/Scored';
import {commonBlue} from '../../styles/colors';

const Tab = createBottomTabNavigator<BottomTabTestParamList>();

const TestTab = () => {
  return (
    <Tab.Navigator
      initialRouteName="TestHome"
      tabBarOptions={{activeTintColor: commonBlue}}>
      <Tab.Screen
        name="TestHome"
        component={Test}
        options={{
          tabBarLabel: 'Live',
          tabBarIcon: ({color}) => (
            <MaterialIcons name="play-circle-outline" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="TestScored"
        component={Scored}
        options={{
          tabBarLabel: 'Scored',
          tabBarIcon: ({color}) => (
            <FontAwesome5 name="tasks" color={color} size={20} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TestTab;
