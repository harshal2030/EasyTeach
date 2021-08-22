import React from 'react';
import {View, Text} from 'react-native';
import {Header, Icon, Button} from 'react-native-elements';
import {connect} from 'react-redux';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {StackNavigationProp} from '@react-navigation/stack';
import {CompositeNavigationProp} from '@react-navigation/native';
import Octicons from 'react-native-vector-icons/Octicons';

import {HeaderBadge} from '../../shared/components/common';

import {StoreState} from '../../shared/global';
import {Class} from '../../shared/global/actions/classes';

import {RootStackParamList, DrawerParamList} from '../navigators/types';
import {commonBlue} from '../../shared/styles/colors';
import {ContainerStyles} from '../../shared/styles/styles';

type Navigation = CompositeNavigationProp<
  DrawerNavigationProp<DrawerParamList, 'Assignment'>,
  StackNavigationProp<RootStackParamList>
>;

type Props = {
  navigation: Navigation;
  currentClass: Class;
  unread: number;
  isOwner: boolean;
};

const Assignment: React.FC<Props> = (props) => {
  return (
    <View style={ContainerStyles.parent}>
      <Header
        centerComponent={{
          text: 'Classwork',
          style: {fontSize: 24, color: '#fff', fontWeight: '600'},
        }}
        leftComponent={
          <>
            <Icon
              name="menu"
              size={26}
              onPress={props.navigation.openDrawer}
              color="#ffff"
            />
            {props.unread !== 0 ? <HeaderBadge /> : null}
          </>
        }
      />
      <Text>{props.currentClass.name}</Text>

      {props.isOwner && (
        <Button
          icon={<Octicons name="plus" size={26} color={commonBlue} />}
          containerStyle={ContainerStyles.FABContainer}
          // eslint-disable-next-line react-native/no-inline-styles
          buttonStyle={{backgroundColor: '#ffff'}}
          onPress={() => props.navigation.navigate('Assign')}
        />
      )}
    </View>
  );
};

const mapStateToProps = (state: StoreState) => {
  return {
    currentClass: state.currentClass!,
    unread: state.unreads.totalUnread,
    isOwner: state.currentClass?.owner.username === state.profile.username,
  };
};

export default connect(mapStateToProps)(Assignment);
