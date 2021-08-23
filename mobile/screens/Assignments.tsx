import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {View, Text, FlatList, ActivityIndicator} from 'react-native';
import {Header, Icon, Button} from 'react-native-elements';
import {connect} from 'react-redux';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {StackNavigationProp} from '@react-navigation/stack';
import {CompositeNavigationProp} from '@react-navigation/native';
import Octicons from 'react-native-vector-icons/Octicons';

import {HeaderBadge, Card} from '../../shared/components/common';

import {StoreState} from '../../shared/global';
import {Class} from '../../shared/global/actions/classes';

import {RootStackParamList, DrawerParamList} from '../navigators/types';
import {commonBlue} from '../../shared/styles/colors';
import {ContainerStyles} from '../../shared/styles/styles';
import {assignUrl} from '../../shared/utils/urls';

type Navigation = CompositeNavigationProp<
  DrawerNavigationProp<DrawerParamList, 'Assignment'>,
  StackNavigationProp<RootStackParamList>
>;

type Props = {
  navigation: Navigation;
  currentClass: Class;
  unread: number;
  isOwner: boolean;
  token: string;
};

type AssignRes = {
  id: string;
  title: string;
  description: string;
  file: string | null;
  dueDate: Date;
  allowLate: boolean;
};

const Assignment: React.FC<Props> = (props) => {
  const [assignments, setAssignments] = useState<AssignRes[]>([]);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${assignUrl}/${props.currentClass.id}`, {
        headers: {
          Authorization: `Bearer ${props.token}`,
        },
      })
      .then((res) => {
        setLoading(false);
        setAssignments(res.data);
      })
      .catch(() => {
        setLoading(false);
        setErrored(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.currentClass.id]);

  const renderItem = ({item}: {item: AssignRes}) => {
    return (
      <Card
        title={item.title}
        containerStyle={{margin: 10}}
        expiresOn={new Date(item.dueDate)}
        isOwner={props.isOwner}
        dateText="Due on"
      />
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={ContainerStyles.centerElements}>
          <ActivityIndicator animating size="large" color={commonBlue} />
        </View>
      );
    }

    if (errored) {
      return (
        <View style={ContainerStyles.centerElements}>
          <Text>
            We're having trouble in fetching modules. Please try again later
          </Text>
        </View>
      );
    }

    if (assignments.length === 0) {
      return (
        <View style={ContainerStyles.centerElements}>
          <Text>Nothing to show here right now.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={assignments}
        keyExtractor={(item) => item.id}
        removeClippedSubviews
        renderItem={renderItem}
      />
    );
  };

  return (
    <View style={[ContainerStyles.parent, {backgroundColor: '#fff'}]}>
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
      {renderContent()}

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
    token: state.token!,
  };
};

export default connect(mapStateToProps)(Assignment);
