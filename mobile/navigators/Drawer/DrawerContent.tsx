import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import {Button, Badge} from 'react-native-elements';
import {MMKV} from '../../MMKV';
import {connect} from 'react-redux';
import axios from 'axios';
import Octicons from 'react-native-vector-icons/Octicons';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MI from 'react-native-vector-icons/MaterialIcons';

import {StoreState} from '../../../shared/global';
import {UnreadState} from '../../../shared/global/actions/unreads';
import {removeToken} from '../../../shared/global/actions/token';
import {
  Class,
  registerCurrentClass,
  removeCurrentClass,
} from '../../../shared/global/actions/classes';

import {Avatar} from '../../../shared/components/common';
import {SMClass} from '../../../shared/components/main';

import {
  commonBackground,
  commonGrey,
  greyWithAlpha,
} from '../../../shared/styles/colors';
import {mediaUrl, logOutUrl} from '../../../shared/utils/urls';

import {DrawerContentComponentProps} from '@react-navigation/drawer';
import {CompositeNavigationProp} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList, DrawerParamList} from '../types';

type HomeScreenNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DrawerParamList, 'Home'>,
  StackNavigationProp<RootStackParamList>
>;

type Props = DrawerContentComponentProps & {
  token: string | null;
  removeToken: typeof removeToken;
  classes: {
    loading: boolean;
    errored: boolean;
    classes: Class[];
  };
  currentClass: Class | null;
  registerCurrentClass: typeof registerCurrentClass;
  navigation: HomeScreenNavigationProp;
  profile: {
    username: string;
    name: string;
    avatar: string;
  };
  removeCurrentClass: typeof removeCurrentClass;
  isOwner: boolean;
  unread: UnreadState;
};

const DrawerContent = (props: Props): JSX.Element => {
  const {currentClass} = props;

  const logOut = async () => {
    try {
      MMKV.removeItem('token');
      props.removeToken();
      props.removeCurrentClass();

      await axios.post(
        logOutUrl,
        {},
        {
          headers: {
            Authorization: `Bearer ${props.token}`,
          },
        },
      );
    } catch (e) {
      Alert.alert('Error', 'Unable to logout please try again later');
    }
  };

  const renderSMClass = ({item}: {item: Class}) => {
    return (
      <SMClass
        onPress={() => {
          props.registerCurrentClass(item);
          props.navigation.closeDrawer();
        }}
        photo={`${mediaUrl}/class/avatar/${item.photo}`}
        unread={props.unread.data[item.id]?.unread}
        name={item.name}
      />
    );
  };

  const renderListFooter = () => {
    return (
      <TouchableOpacity
        style={{alignSelf: 'center'}}
        onPress={() => {
          return (
            props.navigation.closeDrawer(),
            props.navigation.navigate('JoinClass')
          );
        }}>
        <Feather name="plus" size={36} color={commonGrey} />
      </TouchableOpacity>
    );
  };

  const renderClasses = () => {
    if (props.classes.errored) {
      return <Text>Errored</Text>;
    }

    if (props.classes.loading) {
      return <Text>Loading...</Text>;
    }

    return (
      <FlatList
        data={props.classes.classes}
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
    optionText,
    optionListContainer,
    optionContainer,
  } = styles;
  return (
    <View style={styles.mainContainer}>
      <View style={styles.leftContainer}>
        <View style={{alignItems: 'center', flex: 1}}>{renderClasses()}</View>

        <View style={actionButtonContainer}>
          <Button
            icon={<Ionicons name="settings" size={36} color={commonGrey} />}
            type="clear"
            TouchableComponent={TouchableOpacity}
            onPress={() => {
              props.navigation.closeDrawer();
              props.navigation.navigate('Settings');
            }}
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
                : 'https://api.easyetach.inddex.co/noimage',
            }}
            style={mainImage}
          />
          <Text style={classText}>
            {currentClass ? currentClass.name : 'Current Class appears here'}
          </Text>

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
            {props.classes.classes.length === 0 ? null : (
              <>
                <TouchableOpacity
                  style={optionContainer}
                  onPress={() => props.navigation.navigate('Home')}>
                  <Entypo name="home" color="#34495e" size={23} />
                  {props.unread.data[currentClass?.id || 'test']?.unread ? (
                    <Badge
                      status="error"
                      badgeStyle={{
                        position: 'absolute',
                        top: -10,
                        height: 10,
                        width: 10,
                        borderWidth: 1,
                        borderRadius: 5,
                      }}
                    />
                  ) : null}
                  <Text style={optionText}> Home</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={optionContainer}
                  onPress={() => props.navigation.navigate('People')}>
                  <FontAwesome name="group" color="#34495e" size={20} />
                  <Text style={optionText}> People</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={optionContainer}
                  onPress={() => props.navigation.navigate('Test')}>
                  <Octicons name="checklist" color="#34495e" size={25} />
                  <Text style={optionText}> Tests</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={optionContainer}
                  onPress={() => props.navigation.navigate('Modules')}>
                  <MI name="view-module" color="#33495e" size={23} />
                  <Text style={optionText}> Modules</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={optionContainer}
                  onPress={() => props.navigation.navigate('Manage')}>
                  <FontAwesome
                    name={props.isOwner ? 'sliders' : 'info-circle'}
                    color="#34495e"
                    size={23}
                  />
                  <Text style={optionText}>
                    {' '}
                    {props.isOwner ? 'Manage' : 'Info'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
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
    justifyContent: 'space-between',
    padding: 5,
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
    backgroundColor: greyWithAlpha(0.4),
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
  optionText: {
    fontSize: 24,
    color: '#34495e',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
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
    currentClass: state.currentClass,
    profile: state.profile,
    isOwner,
    unread: state.unreads,
  };
};

export default connect(mapStateToProps, {
  removeToken,
  registerCurrentClass,
  removeCurrentClass,
})(DrawerContent);
