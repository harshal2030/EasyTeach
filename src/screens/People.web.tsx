import React from 'react';
import axios from 'axios';
import {
  View,
  StyleSheet,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {ListItem, Text} from 'react-native-elements';
import {connect} from 'react-redux';

import {Avatar} from '../components/common';

import {StoreState} from '../global';
import {Class} from '../global/actions/classes';
import {mediaUrl, studentUrl} from '../utils/urls';
import {commonBlue} from '../styles/colors';

interface Props {
  profile: {
    name: string;
    username: string;
    avatar: string;
  };
  currentClass: Class | null;
  token: string | null;
  isOwner: boolean;
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
          const newPeople = people.filter((ppl) => ppl.username !== username);
          setPeople(newPeople);
        })
        .catch(() => null);
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
  };

  return (
    <View style={{flex: 1}}>
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
  let isOwner: boolean = false;
  if (state.currentClass) {
    isOwner = state.currentClass.owner.username === state.profile.username;
  }
  return {
    token: state.token,
    currentClass: state.currentClass,
    profile: state.profile,
    isOwner,
  };
};

export default connect(mapStateToProps)(People);
