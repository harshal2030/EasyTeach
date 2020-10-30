import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import {BottomTabTestParamList} from '../types';
import Test from '../../screens/Test';
import Scored from '../../screens/Scored';
import {commonBlue} from '../../styles/colors';

const Tab = createBottomTabNavigator<BottomTabTestParamList>();

const TestTab = () => {
  return (
    <Tab.Navigator tabBarOptions={{activeTintColor: commonBlue}}>
      <Tab.Screen
        name="TestHome"
        component={Test}
        options={{
          tabBarLabel: 'Tests',
          tabBarIcon: ({color}) => (
            <Ionicons name="create" color={color} size={24} />
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
