import React from 'react';
import {View, Text, ActivityIndicator} from 'react-native';
import {Header, Button} from 'react-native-elements';
import {connect} from 'react-redux';
import {CompositeNavigationProp} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {StackNavigationProp} from '@react-navigation/stack';

import {
  RootStackParamList,
  DrawerParamList,
  BottomTabHomeParamList,
} from '../navigators/types';
import {StoreState} from '../global';
import {Class} from '../global/actions/classes';
import {commonBlue} from '../styles/colors';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabHomeParamList, 'People'>,
  CompositeNavigationProp<
    DrawerNavigationProp<DrawerParamList>,
    StackNavigationProp<RootStackParamList>
  >
>;

interface Props {
  profile: {
    name: string;
    username: string;
    avatar: string;
  };
  navigation: NavigationProp;
  currentClass: Class | null;
  classHasErrored: boolean;
  classes: Class[];
  classIsLoading: boolean;
}

const Home = (props: Props): JSX.Element => {
  const renderContent = () => {
    if (props.classIsLoading) {
      return <ActivityIndicator color={commonBlue} animating size="large" />;
    }

    if (props.classHasErrored) {
      return (
        <Text>
          We're having trouble in connecting to service. Please consider
          checking your network or try again
        </Text>
      );
    }

    if (props.classes.length === 0) {
      return (
        <>
          <Text>
            Looks like it's your first time. Begin with Joining or Creating a
            class
          </Text>
          <Button
            title="Create or Join class"
            onPress={() => props.navigation.navigate('JoinClass')}
          />
        </>
      );
    }

    return (
      <Text>
        Announcements are Under Construction! Thanks for your patience
      </Text>
    );
  };

  return (
    <View style={{flex: 1}}>
      <Header
        centerComponent={{
          text: props.currentClass ? props.currentClass!.name : 'Home',
          style: {fontSize: 24, color: '#fff', fontWeight: '600'},
        }}
        leftComponent={{
          icon: 'menu',
          color: '#ffff',
          size: 26,
          onPress: () => props.navigation.openDrawer(),
        }}
      />
      <View
        style={{
          padding: 20,
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        {renderContent()}
      </View>
    </View>
  );
};

const mapStateToProps = (state: StoreState) => {
  return {
    profile: state.profile,
    currentClass: state.currentClass,
    classHasErrored: state.classHasErrored,
    classIsLoading: state.classIsLoading,
    classes: state.classes,
  };
};

export default connect(mapStateToProps)(Home);
