import React from 'react';
import {View, Text} from 'react-native';
import {Header, Button} from 'react-native-elements';
import {connect} from 'react-redux';
import {CompositeNavigationProp} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {StackNavigationProp} from '@react-navigation/stack';

import {
  RootStackParamList,
  DrawerParamList,
  BottomTabParamList,
} from '../navigators/types';
import {StoreState} from '../global';
import {Class} from '../global/actions/classes';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'People'>,
  CompositeNavigationProp<
    DrawerNavigationProp<DrawerParamList>,
    StackNavigationProp<RootStackParamList>
  >
>;

interface Props {
  profile: {
    name: string;
    username: string;
  };
  navigation: NavigationProp;
  currentClass: Class | null;
  classHasErrored: boolean;
  classes: Class[];
}

const Home = (props: Props): JSX.Element => {
  const renderContent = () => {
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
  };

  return (
    <View>
      <Header
        centerComponent={{
          text: 'Home',
          style: {fontSize: 24, color: '#fff', fontWeight: '600'},
        }}
        leftComponent={{
          icon: 'menu',
          color: '#ffff',
          size: 26,
          onPress: () => props.navigation.openDrawer(),
        }}
      />
      <View style={{padding: 20}}>{renderContent()}</View>
    </View>
  );
};

const mapStateToProps = (state: StoreState) => {
  return {
    profile: state.profile,
    currentClass: state.currentClass,
    classHasErrored: state.classHasErrored,
    classes: state.classes,
  };
};

export default connect(mapStateToProps)(Home);
