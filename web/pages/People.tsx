import React from 'react';
import axios from 'axios';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {useHistory, useParams, Link} from 'react-router-dom';
import {Header, ListItem, Text, Button} from 'react-native-elements';
import {connect} from 'react-redux';
import {toast} from 'react-toastify';
import Dialog from 'react-native-dialog';
import MenuIcon from '@iconify-icons/ic/menu';

import {TouchableIcon} from '../components';
import Cross from '../../shared/images/cross.svg';
import {Avatar, HeaderBadge} from '../../shared/components/common';

import {StoreState} from '../../shared/global';
import {Class, registerCurrentClass} from '../../shared/global/actions/classes';
import {mediaUrl, studentUrl} from '../../shared/utils/urls';
import {commonBlue, greyWithAlpha} from '../../shared/styles/colors';
import {TextStyles} from '../../shared/styles/styles';

interface Props {
  profile: {
    name: string;
    username: string;
    avatar: string;
  };
  currentClass: Class | null;
  token: string | null;
  isOwner: boolean;
  classes: Class[];
  onLeftTopPress: () => void;
  registerCurrentClass: typeof registerCurrentClass;
  premiumAllowed: boolean;
  unread: number;
}

interface peopleProp {
  name: string;
  username: string;
  avatar: string;
}

const People = (props: Props) => {
  const [people, setPeople] = React.useState<peopleProp[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [alertVisible, setAlert] = React.useState<boolean>(false);
  const [user, setUser] = React.useState<{name: string; username: string}>({
    name: '',
    username: '',
  });
  const [offset, setOffset] = React.useState(0);

  const fetchPeople = () => {
    setPeople([]);
    setLoading(true);
    axios
      .get<peopleProp[]>(`${studentUrl}/${props.currentClass!.id}`, {
        headers: {
          Authorization: `Bearer ${props.token!}`,
        },
        params: {
          offset,
        },
        timeout: 20000,
      })
      .then((res) => {
        setLoading(false);
        setPeople(res.data);
      })
      .catch(() => {
        setLoading(false);
        toast.error('Unable to show people. Please try again later');
      });
  };

  const onNextPress = () => {
    if (people.length >= 10) {
      setOffset((prevValue) => prevValue + 10);
    }
  };

  const onPrevPress = () => {
    if (offset !== 0) {
      setOffset((prevValue) => prevValue - 10);
    }
  };

  const history = useHistory();

  const {classId} = useParams<{classId: string}>();

  React.useEffect(() => {
    const {classes} = props;

    const classFound = classes.find((cls) => cls.id === classId);

    if (classFound) {
      props.registerCurrentClass(classFound);
    } else {
      history.replace('/*');
    }

    if (props.currentClass) {
      fetchPeople();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.currentClass, classId, offset]);

  const removeStudent = () => {
    setAlert(false);
    axios
      .delete(`${studentUrl}/${user.username}/${props.currentClass!.id}`, {
        headers: {
          Authorization: `Bearer ${props.token}`,
        },
      })
      .then(() => {
        toast.info(`${user.name} removed successfully from the class`);

        const newPeople = people.filter(
          (ppl) => ppl.username !== user.username,
        );
        setPeople(newPeople);
      })
      .catch(() => toast.error(`Unable to remove ${user.name} at the moment`));
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
          <TouchableOpacity
            onPress={() => {
              setUser(item);
              setAlert(true);
            }}>
            <Cross />
          </TouchableOpacity>
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
              Students
            </Text>

            <Text>
              Showing {offset} - {offset + 10}
            </Text>
          </View>
        )}
      </>
    );
  };

  const renderListFooter = () => {
    if (loading) {
      return <ActivityIndicator size="large" animating color={commonBlue} />;
    }

    return (
      <View style={styles.listFooterContainer}>
        <Button
          title="PREV"
          type="clear"
          disabled={offset === 0}
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
            <TouchableIcon
              icon={MenuIcon}
              color="#fff"
              size={26}
              onPress={props.onLeftTopPress}
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
            <Link to={`/checkout/${props.currentClass?.id}`}>
              <Text style={TextStyles.link}>Click here</Text>
            </Link>{' '}
            to upgrade now
          </Text>
        </View>
      )}

      <Dialog.Container visible={alertVisible}>
        <Dialog.Title>Confirm</Dialog.Title>
        <Dialog.Description>
          {`Are you sure to remove ${user.name} from the class`}
        </Dialog.Description>
        <Dialog.Button label="Cancel" onPress={() => setAlert(false)} />
        <Dialog.Button label="Yes" onPress={removeStudent} />
      </Dialog.Container>
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
    paddingHorizontal: 5,
  },
  listFooterContainer: {
    height: 50,
    justifyContent: 'flex-end',
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
    classes: state.classes.classes,
    isOwner,
    premiumAllowed,
    unread: state.unreads.totalUnread,
  };
};

export default connect(mapStateToProps, {registerCurrentClass})(People);
