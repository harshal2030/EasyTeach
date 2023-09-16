/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import axios from 'axios';
import {
  View,
  StyleSheet,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {Header, ListItem, Text, Button, Icon} from 'react-native-elements';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CompositeNavigationProp} from '@react-navigation/native';
import {connect} from 'react-redux';
import SnackBar from 'react-native-snackbar';

import {HeaderBadge} from '../../shared/components/common';
import {Avatar} from '../../shared/components/common';

import {StoreState} from '../../shared/global';
import {Class} from '../../shared/global/actions/classes';
import {
  PeoplePayload,
  fetchPeople,
  removeUser,
} from '../../shared/global/actions/people';

import {DrawerParamList, RootStackParamList} from '../navigators/types';
import {mediaUrl, studentUrl} from '../../shared/utils/urls';
import {commonBlue, flatRed, greyWithAlpha} from '../../shared/styles/colors';
import {TextStyles} from '../../shared/styles/styles';

type NavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DrawerParamList, 'People'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface Props {
  profile: {
    name: string;
    username: string;
    avatar: string;
  };
  navigation: NavigationProp;
  currentClass: Class | null;
  token: string | null;
  isOwner: boolean;
  premiumAllowed: boolean;
  unread: number;
  people: PeoplePayload;
  fetchPeople(classId: string, offset?: number): void;
  removeUser: typeof removeUser;
}

interface peopleProp {
  name: string;
  username: string;
  avatar: string;
}

const People = (props: Props) => {
  const {users: people} = props.people;

  const onNextPress = () => {
    if (people.length >= 10) {
      props.fetchPeople(props.currentClass!.id, 10);
    }
  };

  const onPrevPress = () => {
    if (props.people.offset !== 0) {
      props.fetchPeople(props.currentClass!.id, -10);
    }
  };

  React.useEffect(() => {
    if (props.currentClass) {
      props.fetchPeople(props.currentClass.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.currentClass]);

  const removeStudent = (name: string, username: string) => {
    const removeReq = () => {
      axios
        .delete(`${studentUrl}/${username}/${props.currentClass!.id}`, {
          headers: {
            Authorization: `Bearer ${props.token}`,
          },
        })
        .then(() => {
          SnackBar.show({
            text: `${name} removed successfully from the class`,
            duration: SnackBar.LENGTH_SHORT,
          });

          props.removeUser(username, props.currentClass!.id);
        })
        .catch(() =>
          SnackBar.show({
            text: `Unable to remove ${name} at the moment`,
            duration: SnackBar.LENGTH_SHORT,
            backgroundColor: flatRed,
            textColor: '#fff',
          }),
        );
    };

    Alert.alert('Confirm', `Are you sure to remove ${name} from the class?`, [
      {
        text: 'Cancel',
      },
      {
        text: 'Yes',
        onPress: removeReq,
      },
    ]);
  };

  const renderListItem = ({item}: {item: peopleProp}) => {
    return (
      <ListItem bottomDivider>
        <Avatar
          source={{
            uri: `${mediaUrl}/avatar/${item.avatar}`,
          }}
        />

        <ListItem.Content>
          <ListItem.Title>{item.name}</ListItem.Title>
          <ListItem.Subtitle>{'@' + item.username}</ListItem.Subtitle>
        </ListItem.Content>
        {props.isOwner && (
          <ListItem.Chevron
            name="cross"
            tvParallaxProperties
            type="entypo"
            size={24}
            onPress={() => removeStudent(item.name, item.username)}
          />
        )}
      </ListItem>
    );
  };

  const renderHeader = () => {
    return (
      <>
        <Text h4 style={styles.titleStyle}>
          Owner
        </Text>
        <ListItem bottomDivider topDivider>
          <Avatar
            source={{
              uri: `${mediaUrl}/avatar/${props.currentClass!.owner.avatar}`,
            }}
          />

          <ListItem.Content>
            <ListItem.Title>{props.currentClass!.owner.name}</ListItem.Title>
            <ListItem.Subtitle>
              {'@' + props.currentClass!.owner.username}
            </ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>

        {people.length !== 0 && (
          <View style={styles.studentTextContainer}>
            <Text h4 style={styles.titleStyle}>
              People
            </Text>

            <Text>
              Showing {props.people.offset} - {props.people.offset + 10}
            </Text>
          </View>
        )}
      </>
    );
  };

  const renderListFooter = () => {
    if (props.people.loading) {
      return <ActivityIndicator size="large" animating color={commonBlue} />;
    }

    return (
      <View style={styles.listFooterContainer}>
        <Button
          title="PREV"
          type="clear"
          disabled={props.people.offset === 0}
          onPress={onPrevPress}
        />
        <Button
          title="NEXT"
          type="clear"
          disabled={people.length < 10}
          onPress={onNextPress}
        />
      </View>
    );
  };

  return (
    <View style={{flex: 1}}>
      <Header
        centerComponent={{
          text: 'People',
          style: {fontSize: 24, color: '#fff', fontWeight: '600'},
        }}
        leftComponent={
          <>
            <Icon
              name="menu"
              tvParallaxProperties
              size={26}
              onPress={props.navigation.openDrawer}
              color="#ffff"
            />
            {props.unread !== 0 ? <HeaderBadge /> : null}
          </>
        }
      />
      {props.currentClass ? (
        <FlatList
          data={people}
          renderItem={renderListItem}
          style={{padding: 5}}
          keyExtractor={(_item, i) => i.toString()}
          ListFooterComponent={renderListFooter()}
          removeClippedSubviews
          ListHeaderComponent={renderHeader}
        />
      ) : (
        <Text>Enroll in a class to see people</Text>
      )}

      {props.isOwner && !props.premiumAllowed && (
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            You can only have few seats in your class.{' '}
            <Text
              style={TextStyles.link}
              onPress={() => props.navigation.navigate('Checkout')}>
              Click here
            </Text>{' '}
            to upgrade now
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  titleStyle: {
    marginTop: 5,
    marginBottom: 5,
  },
  studentTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listFooterContainer: {
    height: 50,
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    alignItems: 'center',
    flexDirection: 'row',
  },
  footerContainer: {
    padding: 8,
    borderTopColor: greyWithAlpha(0.5),
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

const mapStateToProps = (state: StoreState) => {
  let isOwner: boolean = false;
  let premiumAllowed = false;

  if (state.currentClass) {
    isOwner = state.currentClass.owner.username === state.profile.username;
    premiumAllowed = state.currentClass.planId !== 'free';
  }
  return {
    token: state.token,
    currentClass: state.currentClass,
    profile: state.profile,
    isOwner,
    premiumAllowed,
    unread: state.unreads.totalUnread,
    people: state.people[state.currentClass?.id || 'test'] || {
      loading: true,
      errored: false,
      offset: 0,
      users: [],
    },
  };
};

export default connect(mapStateToProps, {fetchPeople, removeUser})(People);
