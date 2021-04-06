import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import {Button} from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import {connect} from 'react-redux';
import axios from 'axios';

import {StoreState} from '../../global';
import {removeToken} from '../../global/actions/token';
import {
  Class,
  fetchClasses,
  registerCurrentClass,
  removeCurrentClass,
} from '../../global/actions/classes';

import {Avatar} from '../../components/common';

import {commonBackground, commonGrey, greyWithAlpha} from '../../styles/colors';
import {mediaUrl, logOutUrl} from '../../utils/urls';

type Props = {
  token: string | null;
  removeToken: typeof removeToken;
  fetchClasses: Function;
  classes: Class[];
  classIsLoading: boolean;
  classErrored: boolean;
  currentClass: Class | null;
  registerCurrentClass: typeof registerCurrentClass;
  profile: {
    username: string;
    name: string;
    avatar: string;
  };
  removeCurrentClass: typeof removeCurrentClass;
  isOwner: boolean;
  onLogOutError: () => void;
  onClassPress: () => void;
  onPlusPress: () => void;
  onGearPress: () => void;
  children: JSX.Element | JSX.Element[];
  renderOwnerOptions: () => JSX.Element;
};

const DrawerContent = (props: Props): JSX.Element => {
  React.useEffect(() => {
    props.fetchClasses(props.token!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {currentClass} = props;

  const logOut = async () => {
    try {
      await axios.post(
        logOutUrl,
        {},
        {
          headers: {
            Authorization: `Bearer ${props.token}`,
          },
        },
      );
      await AsyncStorage.removeItem('token');
      props.removeToken();
      props.removeCurrentClass();
    } catch (e) {
      props.onLogOutError();
    }
  };

  const renderSMClass = ({item}: {item: Class}) => {
    return (
      <TouchableOpacity
        onPress={() => {
          props.registerCurrentClass(item);
          props.onClassPress();
        }}>
        <FastImage
          source={{
            uri: `${mediaUrl}/class/avatar/${item.photo}`,
          }}
          style={avatarImageStyle}
        />
        <Text numberOfLines={1} style={{fontSize: 16, fontWeight: '900'}}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderListFooter = () => {
    return (
      <TouchableOpacity
        style={{alignSelf: 'center'}}
        onPress={props.onPlusPress}>
        <Feather name="plus" size={36} color={commonGrey} />
      </TouchableOpacity>
    );
  };

  const renderClasses = () => {
    if (props.classErrored) {
      return <Text>Errored</Text>;
    }

    if (props.classIsLoading) {
      return <Text>Loading...</Text>;
    }

    return (
      <FlatList
        data={props.classes}
        keyExtractor={(_item, i) => i.toString()}
        renderItem={renderSMClass}
        removeClippedSubviews
        ListFooterComponent={renderListFooter}
      />
    );
  };

  const {
    actionButtonContainer,
    classText,
    mainImage,
    avatarContainer,
    avatarText,
    optionListContainer,
    avatarImageStyle,
  } = styles;
  return (
    <View style={styles.mainContainer}>
      <View style={styles.leftContainer}>
        <View style={{alignItems: 'center', height: '85%'}}>
          {renderClasses()}
        </View>

        <View style={actionButtonContainer}>
          <Button
            icon={<Ionicons name="settings" size={36} color={commonGrey} />}
            type="clear"
            TouchableComponent={TouchableOpacity}
            onPress={props.onGearPress}
          />

          <Button
            icon={<Feather name="log-out" size={36} color={commonGrey} />}
            type="clear"
            TouchableComponent={TouchableOpacity}
            onPress={logOut}
          />
        </View>
      </View>
      <View style={styles.rightContainer}>
        <ScrollView>
          <FastImage
            source={{
              uri: currentClass
                ? `${mediaUrl}/class/avatar/${currentClass.photo}`
                : 'https://easyteach.harshall.codes/noimage',
            }}
            style={mainImage}>
            <Text style={classText}>
              {currentClass ? currentClass.name : 'Current Class appears here'}
            </Text>
          </FastImage>

          <View style={avatarContainer}>
            <Avatar
              style={styles.avatar}
              source={{
                uri: currentClass
                  ? `${mediaUrl}/avatar/${currentClass.owner.avatar}`
                  : `${mediaUrl}/avatar/default.png`,
              }}
            />
            <Text style={avatarText}>
              {currentClass
                ? currentClass.owner.name
                : 'Class owner appears here'}
            </Text>
          </View>

          <View style={optionListContainer}>
            {props.classes.length === 0 ? null : props.children}

            {props.isOwner && props.renderOwnerOptions()}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  actionButtonContainer: {
    alignItems: 'center',
    height: '15%',
    justifyContent: 'space-between',
    padding: 5,
    marginBottom: 5,
  },
  avatarImageStyle: {
    height: 60,
    width: 60,
    marginTop: 10,
    backgroundColor: commonGrey,
  },
  leftContainer: {
    width: 90,
    backgroundColor: commonBackground,
    justifyContent: 'space-between',
    padding: 10,
  },
  rightContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  classText: {
    color: '#fff',
    fontSize: 30,
    padding: 5,
    backgroundColor: 'rgba(237, 240, 242, 0.8)',
  },
  mainImage: {
    height: 200,
    width: '100%',
    justifyContent: 'flex-end',
    backgroundColor: commonGrey,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingLeft: 15,
    borderBottomColor: greyWithAlpha(0.6),
    borderBottomWidth: 1,
  },
  avatarText: {
    fontSize: 16,
    marginLeft: 8,
  },
  optionListContainer: {
    padding: 20,
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 20,
  },
});

const mapStateToProps = (state: StoreState) => {
  let isOwner: boolean = false;
  if (state.currentClass) {
    isOwner = state.currentClass.owner.username === state.profile.username;
  }
  return {
    token: state.token,
    classes: state.classes,
    classIsLoading: state.classIsLoading,
    classErrored: state.classHasErrored,
    currentClass: state.currentClass,
    profile: state.profile,
    isOwner,
  };
};

export default connect(mapStateToProps, {
  removeToken,
  fetchClasses,
  registerCurrentClass,
  removeCurrentClass,
})(DrawerContent);
