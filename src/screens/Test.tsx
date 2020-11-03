import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Header, Button, Text} from 'react-native-elements';
import {StackNavigationProp} from '@react-navigation/stack';
import {CompositeNavigationProp, RouteProp} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {connect} from 'react-redux';
import Octicons from 'react-native-vector-icons/Octicons';

import {StoreState} from '../global';
import {Class} from '../global/actions/classes';
import {
  RootStackParamList,
  DrawerParamList,
  BottomTabTestParamList,
} from '../navigators/types';
import {commonBlue, commonGrey} from '../styles/colors';
import {ContainerStyles} from '../styles/styles';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabTestParamList, 'TestHome'>,
  CompositeNavigationProp<
    DrawerNavigationProp<DrawerParamList>,
    StackNavigationProp<RootStackParamList>
  >
>;

type TestRouteProp = RouteProp<BottomTabTestParamList, 'TestHome'>;

interface Props {
  navigation: NavigationProp;
  profile: {name: string; username: string; avatar: string};
  currentClass: Class | null;
  route: TestRouteProp;
}

const Test = (props: Props) => {
  let isOwner = false;
  if (props.currentClass) {
    isOwner = props.profile.username === props.currentClass.owner.username;
  }
  return (
    <>
      <View style={ContainerStyles.parent}>
        <Header
          centerComponent={{
            text: 'Test',
            style: {fontSize: 24, color: '#fff', fontWeight: '600'},
          }}
          leftComponent={{
            icon: 'menu',
            color: '#ffff',
            size: 26,
          }}
        />

        <View style={ContainerStyles.padder}>
          <View>
            <Text>This is title</Text>
          </View>
        </View>
      </View>

      {isOwner && (
        <Button
          icon={<Octicons name="plus" size={26} color={commonBlue} />}
          containerStyle={styles.FABContainer}
          // eslint-disable-next-line react-native/no-inline-styles
          buttonStyle={{backgroundColor: '#ffff'}}
          onPress={() => props.navigation.navigate('CreateTest')}
        />
      )}
    </>
  );
};

const mapStateToProps = (state: StoreState) => {
  return {
    profile: state.profile,
    currentClass: state.currentClass,
  };
};

const styles = StyleSheet.create({
  FABContainer: {
    position: 'absolute',
    height: 60,
    width: 60,
    bottom: 10,
    right: 10,
    padding: 10,
    backgroundColor: '#ffff',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: commonGrey,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
});

export default connect(mapStateToProps)(Test);
