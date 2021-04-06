import React from 'react';
import {CompositeNavigationProp} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {StackNavigationProp} from '@react-navigation/stack';
import Snackbar from 'react-native-snackbar';

import Announce from '../../shared/screens/Announcement';

import {RootStackParamList, DrawerParamList} from '../navigators/types';
import {flatRed} from '../../shared/styles/colors';

type NavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DrawerParamList, 'People'>,
  StackNavigationProp<RootStackParamList>
>;

interface Props {
  navigation: NavigationProp;
}

const Home = (props: Props) => {
  return (
    <Announce
      onJoinPress={() => props.navigation.navigate('JoinClass')}
      onLeftTopPress={() => props.navigation.openDrawer()}
      onSendError={() => {
        Snackbar.show({
          text: 'Unable to send message. Please try again later',
          backgroundColor: flatRed,
          duration: Snackbar.LENGTH_LONG,
        });
      }}
    />
  );
};

export default Home;
