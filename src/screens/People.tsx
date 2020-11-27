import React from 'react';
import axios from 'axios';
import {
  View,
  StyleSheet,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
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
import {commonBlue, flatRed} from '../styles/colors';

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
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    if (props.currentClass) {
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
          rounded
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

  const renderListFooter = () => {
    if (loading) {
      return <ActivityIndicator size="large" animating color={commonBlue} />;
    }
  };

  const renderMainContent = () => (
    <View style={{padding: 5}}>
      <FlatList
        data={people}
        renderItem={renderListItem}
        keyExtractor={(_item, i) => i.toString()}
        ListFooterComponent={renderListFooter()}
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
