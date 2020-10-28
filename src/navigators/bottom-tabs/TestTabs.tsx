import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {connect} from 'react-redux';

import {StoreState} from '../../global';
import {Class} from '../../global/actions/classes';
import {BottomTabTestParamList} from '../types';
import Test from '../../screens/Test';
import Scored from '../../screens/Scored';
import {commonBlue} from '../../styles/colors';

const Tab = createBottomTabNavigator<BottomTabTestParamList>();

interface Props {
  profile: {name: string; username: string; avatar: string};
  currentClass: Class | null;
}

const TestTab = (props: Props) => {
  let isOwner = false;
  if (props.currentClass) {
    isOwner = props.profile.username === props.currentClass.owner.username;
  }
  let CreateTest;

  if (isOwner) {
    CreateTest = require('../../screens/CreateTest').default;
  }

  return (
    <Tab.Navigator tabBarOptions={{activeTintColor: commonBlue}}>
      {isOwner && (
        <Tab.Screen
          name="CreateTest"
          component={CreateTest}
          options={{
            tabBarLabel: 'Create Test',
            tabBarIcon: ({color}) => (
              <Ionicons name="create" size={20} color={color} />
            ),
          }}
        />
      )}
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

const mapStateToProps = (state: StoreState) => {
  return {
    profile: state.profile,
    currentClass: state.currentClass,
  };
};

export default connect(mapStateToProps)(TestTab);
