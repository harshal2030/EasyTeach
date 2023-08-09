import React from 'react';
import axios from 'axios';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {useHistory, useParams, Link} from 'react-router-dom';
import {Header, ListItem, Text, Button} from 'react-native-elements';
import {connect} from 'react-redux';
import {toast} from 'react-toastify';
import Dialog from 'react-native-dialog';
import MenuIcon from '@iconify-icons/ic/menu';
import uploadIcon from '@iconify-icons/ic/baseline-file-upload';
import lockIcon from '@iconify-icons/ic/lock';
import Modal from 'react-native-modal';

import {TouchableIcon} from '../components';
import Cross from '../../shared/images/cross.svg';
import {Avatar, HeaderBadge} from '../../shared/components/common';

import {StoreState} from '../../shared/global';
import {Class, registerCurrentClass} from '../../shared/global/actions/classes';
import {
  PeoplePayload,
  fetchPeople,
  removeUser,
} from '../../shared/global/actions/people';

import {mediaUrl, studentUrl} from '../../shared/utils/urls';
import {commonBlue, greyWithAlpha} from '../../shared/styles/colors';
import {TextStyles} from '../../shared/styles/styles';
import {excelExtPattern} from '../../shared/utils/regexPatterns';

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
  people: PeoplePayload;
  removeUser: typeof removeUser;
  fetchPeople: (classId: string, offsetChange?: number) => void;
}

interface peopleProp {
  name: string;
  username: string;
  avatar: string;
}

const People = (props: Props) => {
  const [alertVisible, setAlert] = React.useState<boolean>(false);
  const [user, setUser] = React.useState<{name: string; username: string}>({
    name: '',
    username: '',
  });
  const [visible, setVisible] = React.useState(false);

  const fileRef = React.useRef<HTMLImageElement | null>(null);

  const {users: people, offset, loading} = props.people;

  const onPrevPress = () => {
    if (offset !== 0) {
      props.fetchPeople(props.currentClass!.id, -10);
    }
  };

  const onNextPress = () => {
    if (people.length >= 10) {
      props.fetchPeople(props.currentClass!.id, 10);
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
      props.fetchPeople(classFound!.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.currentClass, classId]);

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

        props.removeUser(user.username, props.currentClass!.id);
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

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!excelExtPattern.test(file.name)) {
        return toast.error('Please select a valid file');
      }

      const form = new FormData();
      form.append('sheet', file);

      axios
        .post(`${studentUrl}/${props.currentClass!.id}`, form, {
          headers: {
            Authorization: `Bearer ${props.token}`,
          },
        })
        .then(() => {
          setVisible(false);
          toast.info('Sheet upload successfully');
        })
        .catch(() => toast.error('Unable to upload sheet'));
    }
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
        rightComponent={
          <>
            {props.isOwner && (
              <TouchableIcon
                icon={uploadIcon}
                size={34}
                color="#fff"
                onPress={() => setVisible(true)}
              />
            )}
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

      <Modal
        isVisible={visible}
        onBackdropPress={() => setVisible(false)}
        style={{justifyContent: 'center', alignItems: 'center'}}>
        <View
          style={{
            backgroundColor: '#fff',
            height: 500,
            width: 400,
            padding: 20,
          }}>
          <h2>Selective class joining</h2>
          <Text>
            Upload a excel sheet with pattern given below and people with given
            email address can only join
          </Text>
          <Image
            source={require('../../shared/images/people.png')}
            style={{height: 200, width: 200, margin: 10}}
            resizeMode="contain"
          />
          {props.premiumAllowed ? (
            <Button
              title="Upload sheet"
              buttonStyle={{marginHorizontal: 10}}
              onPress={() => fileRef.current!.click()}
            />
          ) : (
            <Button
              title="Upgrade Required"
              buttonStyle={{marginHorizontal: 10}}
              onPress={() =>
                history.push(`/checkout/${props.currentClass?.id}`)
              }
              icon={<TouchableIcon icon={lockIcon} size={26} color="#fff" />}
            />
          )}
        </View>
      </Modal>

      <input
        type="file"
        // @ts-ignore
        ref={fileRef}
        style={{display: 'none'}}
        onChange={onFileSelect}
      />

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
    people: state.people[state.currentClass?.id || 'test'] || {
      loading: true,
      errored: false,
      offset: 0,
      users: [],
    },
  };
};

export default connect(mapStateToProps, {
  registerCurrentClass,
  fetchPeople,
  removeUser,
})(People);
