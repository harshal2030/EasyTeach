import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Entypo from 'react-native-vector-icons/Entypo';

import {BottomTabTestParamList} from '../types';
import {commonBlue} from '../../../shared/styles/colors';

const Tab = createBottomTabNavigator<BottomTabTestParamList>();

const TestTab = () => {
  return (
    <Tab.Navigator tabBarOptions={{activeTintColor: commonBlue}}>
      <Tab.Screen
        name="TestHome"
        component={require('../../screens/Test').default}
        options={{
          tabBarLabel: 'Live',
          tabBarIcon: ({color}) => (
            <Ionicons name="create" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="TestExpired"
        component={require('../../screens/Expired').default}
        options={{
          tabBarLabel: 'Expired',
          tabBarIcon: ({color}) => (
            <Entypo name="back-in-time" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="TestScored"
        component={require('../../screens/Scored').default}
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
