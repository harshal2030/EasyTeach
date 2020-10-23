import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import {BottomTabParamList} from '../types';
import Announcements from '../../screens/Announcements';
import People from '../../screens/People';
import {commonBlue} from '../../styles/colors';

const Tab = createBottomTabNavigator<BottomTabParamList>();

const Home = () => {
  return (
    <Tab.Navigator
      initialRouteName="Announcements"
      tabBarOptions={{activeTintColor: commonBlue}}>
      <Tab.Screen
        name="Announcements"
        component={Announcements}
        options={{
          tabBarLabel: 'Announcements',
          tabBarIcon: ({color}) => (
            <FontAwesome5 name="bullhorn" color={color} size={18} />
          ),
        }}
      />
      <Tab.Screen
        name="People"
        component={People}
        options={{
          tabBarLabel: 'People',
          tabBarIcon: ({color}) => (
            <FontAwesome name="group" color={color} size={18} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default Home;
