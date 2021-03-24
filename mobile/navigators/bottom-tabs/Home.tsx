import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import {BottomTabHomeParamList} from '../types';
import {commonBlue} from '../../../shared/styles/colors';

const Tab = createBottomTabNavigator<BottomTabHomeParamList>();

const Home = () => {
  return (
    <Tab.Navigator
      initialRouteName="Announcements"
      tabBarOptions={{activeTintColor: commonBlue}}>
      <Tab.Screen
        name="Announcements"
        component={require('../../screens/Announcements').default}
        options={{
          tabBarLabel: 'Announcements',
          tabBarIcon: ({color}) => (
            <FontAwesome5 name="bullhorn" color={color} size={18} />
          ),
        }}
      />
      <Tab.Screen
        name="People"
        component={require('../../screens/People').default}
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
