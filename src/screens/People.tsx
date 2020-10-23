import React from 'react';
import axios from 'axios';
import {View, Text} from 'react-native';
import {Header} from 'react-native-elements';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {StackNavigationProp} from '@react-navigation/stack';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {CompositeNavigationProp} from '@react-navigation/native';
import {connect} from 'react-redux';

import {
  DrawerParamList,
  RootStackParamList,
  BottomTabParamList,
} from '../navigators/types';
import {StoreState} from '../global';
import {Class} from '../global/actions/classes';
import {studentUrl} from '../utils/urls';

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
  token: string | null;
}

const People = (props: Props) => {
  const [people, setPeople] = React.useState<{username: string}[]>([]);
  React.useEffect(() => {
    axios
      .get<{username: string}[]>(`${studentUrl}/${props.currentClass!.id}`, {
        headers: {
          Authorization: `Bearer ${props.token!}`,
        },
      })
      .then((res) => setPeople(res.data))
      .catch((e) => console.log(e));
  }, [props.currentClass, props.token]);

  return (
    <View>
      <Header
        centerComponent={{
          text: 'People',
          style: {fontSize: 24, color: '#fff', fontWeight: '600'},
        }}
        leftComponent={{
          icon: 'menu',
          color: '#ffff',
          size: 26,
          onPress: () => props.navigation.openDrawer(),
        }}
      />
      {people.map((ppl, i) => (
        <Text key={i.toString()}>{ppl.username}</Text>
      ))}
    </View>
  );
};

const mapStateToProps = (state: StoreState) => {
  return {
    token: state.token,
    currentClass: state.currentClass,
  };
};

export default connect(mapStateToProps)(People);
