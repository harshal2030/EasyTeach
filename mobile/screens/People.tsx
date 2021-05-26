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
import {Header, ListItem, Text} from 'react-native-elements';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {StackNavigationProp} from '@react-navigation/stack';
import {CompositeNavigationProp} from '@react-navigation/native';
import {connect} from 'react-redux';
import SnackBar from 'react-native-snackbar';

import {Avatar} from '../../shared/components/common';

import {DrawerParamList, RootStackParamList} from '../navigators/types';
import {StoreState} from '../../shared/global';
import {Class} from '../../shared/global/actions/classes';
import {mediaUrl, studentUrl} from '../../shared/utils/urls';
import {commonBlue, flatRed, greyWithAlpha} from '../../shared/styles/colors';
import {TextStyles} from '../../shared/styles/styles';

type NavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DrawerParamList, 'People'>,
  StackNavigationProp<RootStackParamList>
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
}

interface peopleProp {
  name: string;
  username: string;
  avatar: string;
}

const People = (props: Props) => {
  const [people, setPeople] = React.useState<peopleProp[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    if (props.currentClass) {
      setPeople([]);
      setLoading(true);
      axios
        .get<peopleProp[]>(`${studentUrl}/${props.currentClass!.id}`, {
          headers: {
            Authorization: `Bearer ${props.token!}`,
          },
          timeout: 20000,
        })
        .then((res) => {
          setLoading(false);
          setPeople(res.data);
        })
        .catch(() => {
          setLoading(false);
          SnackBar.show({
            text: 'Unable to show people. Please try again later',
            backgroundColor: flatRed,
            duration: SnackBar.LENGTH_SHORT,
            textColor: '#ffff',
          });
        });
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

          const newPeople = people.filter((ppl) => ppl.username !== username);
          setPeople(newPeople);
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
          <Text h4 style={styles.titleStyle}>
            Students
          </Text>
        )}
      </>
    );
  };

  const renderListFooter = () => {
    if (loading) {
      return <ActivityIndicator size="large" animating color={commonBlue} />;
    }

    return <View style={{height: 50}} />;
  };

  return (
    <View style={{flex: 1}}>
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
            You can only have 100 students in your class.{' '}
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
  };
};

export default connect(mapStateToProps)(People);
