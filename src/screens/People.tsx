import React from 'react';
import axios from 'axios';
import {View, StyleSheet, Alert} from 'react-native';
import {Avatar, Header, ListItem, Text} from 'react-native-elements';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {StackNavigationProp} from '@react-navigation/stack';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {CompositeNavigationProp} from '@react-navigation/native';
import {connect} from 'react-redux';
import SnackBar from 'react-native-snackbar';

import {
  DrawerParamList,
  RootStackParamList,
  BottomTabHomeParamList,
} from '../navigators/types';
import {StoreState} from '../global';
import {Class} from '../global/actions/classes';
import {mediaUrl, studentUrl} from '../utils/urls';
import {FlatList} from 'react-native-gesture-handler';

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
  token: string | null;
}

interface peopleProp {
  name: string;
  username: string;
  avatar: string;
}

const People = (props: Props) => {
  const [people, setPeople] = React.useState<peopleProp[]>([]);
  React.useEffect(() => {
    if (props.currentClass) {
      axios
        .get<peopleProp[]>(`${studentUrl}/${props.currentClass!.id}`, {
          headers: {
            Authorization: `Bearer ${props.token!}`,
          },
        })
        .then((res) => setPeople(res.data))
        .catch((e) => console.log(e));
    }
  }, [props.currentClass, props.token]);

  let isOwner = false;
  if (props.currentClass) {
    isOwner = props.profile.username === props.currentClass.owner.username;
  }

  const removeStudent = (name: string, username: string) => {
    const removeReq = () => {
      axios
        .delete(`${studentUrl}/${username}/${props.currentClass!.id}`, {
          headers: {
            Authorization: `Bearer ${props.token}`,
          },
        })
        .then(() =>
          SnackBar.show({
            text: `${name} removed successfully from the class`,
            duration: SnackBar.LENGTH_SHORT,
          }),
        )
        .catch(() =>
          SnackBar.show({
            text: `Unable to remove ${name} at the moment`,
            duration: SnackBar.LENGTH_SHORT,
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
          size="medium"
          source={{
            uri: `${mediaUrl}/avatar/${item.avatar}`,
          }}
        />

        <ListItem.Content>
          <ListItem.Title>{item.name}</ListItem.Title>
          <ListItem.Subtitle>{'@' + item.username}</ListItem.Subtitle>
        </ListItem.Content>
        {isOwner && (
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

  const renderMainContent = () => (
    <View style={{padding: 5}}>
      <FlatList
        data={people}
        renderItem={renderListItem}
        keyExtractor={(_item, i) => i.toString()}
        ListHeaderComponent={
          <>
            <Text h4 style={styles.titleStyle}>
              Owner
            </Text>
            <ListItem bottomDivider topDivider>
              <Avatar
                size="medium"
                source={{
                  uri: `${mediaUrl}/avatar/${props.currentClass!.owner.avatar}`,
                }}
              />

              <ListItem.Content>
                <ListItem.Title>
                  {props.currentClass!.owner.name}
                </ListItem.Title>
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
        }
      />
    </View>
  );

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
      {props.currentClass ? (
        renderMainContent()
      ) : (
        <Text>Enroll in a class to see people</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  titleStyle: {
    marginTop: 5,
    marginBottom: 5,
  },
});

const mapStateToProps = (state: StoreState) => {
  return {
    token: state.token,
    currentClass: state.currentClass,
    profile: state.profile,
  };
};

export default connect(mapStateToProps)(People);
