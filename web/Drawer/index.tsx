import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  Image as FastImage,
  ImageBackground,
} from 'react-native';
import {useRouteMatch, useHistory} from 'react-router-dom';
import {Button, Badge} from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import {connect} from 'react-redux';
import axios from 'axios';
import {InlineIcon} from '@iconify/react';
import ModuleIcon from '@iconify-icons/ic/view-module';

import LogOut from '../../shared/images/log-out.svg';
import Plus from '../../shared/images/plus-36.svg';
import Home from '../../shared/images/home.svg';
import Sliders from '../../shared/images/sliders.svg';
import InfoCircle from '../../shared/images/info-circle.svg';
import Group from '../../shared/images/group.svg';
import Checklist from '../../shared/images/checklist.svg';
import Settings from '../../shared/images/settings.svg';

import {StoreState} from '../../shared/global/index.web';
import {UnreadState} from '../../shared/global/actions/unreads';
import {removeToken} from '../../shared/global/actions/token';
import {
  Class,
  registerCurrentClass,
  removeCurrentClass,
} from '../../shared/global/actions/classes';

import {Avatar} from '../../shared/components/common';

import {
  commonBackground,
  commonGrey,
  greyWithAlpha,
} from '../../shared/styles/colors';
import {mediaUrl, logOutUrl} from '../../shared/utils/urls';

type Props = {
  token: string | null;
  removeToken: typeof removeToken;
  classes: {
    classes: Class[];
    loading: boolean;
    errored: boolean;
  };
  currentClass: Class | null;
  registerCurrentClass: typeof registerCurrentClass;
  profile: {
    username: string;
    name: string;
    avatar: string;
  };
  removeCurrentClass: typeof removeCurrentClass;
  isOwner: boolean;
  onOptionPress: () => void;
  unread: UnreadState;
};

const DrawerContent = (props: Props): JSX.Element => {
  const {currentClass} = props;

  const {url} = useRouteMatch();
  const history = useHistory();

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
      Alert.alert('Error', 'Unable to logout please try again later');
    }
  };

  const renderSMClass = ({item}: {item: Class}) => {
    return (
      <TouchableOpacity
        onPress={() => {
          props.registerCurrentClass(item);
          props.onOptionPress();
          history.push(`${url}/home/${item.id}`);
        }}>
        <FastImage
          source={{
            uri: `${mediaUrl}/class/avatar/${item.photo}`,
          }}
          style={avatarImageStyle}
        />
        {props.unread.data[item.id]?.unread ? (
          <Badge
            status="error"
            value={props.unread.data[item.id]?.unread}
            badgeStyle={{
              position: 'absolute',
              right: -1,
              top: -4,
            }}
          />
        ) : null}
        <Text style={{fontSize: 16, fontWeight: '900'}}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderListFooter = () => {
    return (
      <TouchableOpacity
        style={{alignSelf: 'center'}}
        onPress={() => history.push('/joinclass')}>
        <Plus />
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
        style={styles.leftContainer}
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
    avatarImageStyle,
    optionContainer,
  } = styles;
  return (
    <View style={styles.mainContainer}>
      <View style={styles.leftContainer}>
        {renderClasses()}

        <View style={actionButtonContainer}>
          <Button
            icon={<Settings />}
            type="clear"
            onPress={() => history.push('/settings')}
            TouchableComponent={TouchableOpacity}
          />

          <Button
            icon={<LogOut />}
            type="clear"
            TouchableComponent={TouchableOpacity}
            onPress={logOut}
          />
        </View>
      </View>
      <View style={styles.rightContainer}>
        <ScrollView>
          <ImageBackground
            source={{
              uri: currentClass
                ? `${mediaUrl}/class/avatar/${currentClass.photo}`
                : 'https://easyteach.harshall.codes/noimage',
            }}
            style={mainImage}>
            <Text style={classText}>
              {currentClass ? currentClass.name : 'Current Class appears here'}
            </Text>
          </ImageBackground>

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
                  onPress={() => {
                    history.push(`${url}/home/${currentClass?.id}`);
                    props.onOptionPress();
                  }}>
                  <Home />
                  {props.unread.data[currentClass!.id]?.unread ? (
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
                  onPress={() => {
                    history.push(`${url}/people/${currentClass?.id}`);
                    props.onOptionPress();
                  }}>
                  <Group />
                  <Text style={optionText}> People</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={optionContainer}
                  onPress={() => {
                    history.push(`${url}/tests/${currentClass?.id}`);
                    props.onOptionPress();
                  }}>
                  <Checklist height={25} width={25} color="#34495e" />
                  <Text style={optionText}> Tests</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={optionContainer}
                  onPress={() => {
                    history.push(`${url}/modules/${currentClass?.id}`);
                    props.onOptionPress();
                  }}>
                  <InlineIcon
                    icon={ModuleIcon}
                    color="#34495e"
                    height={25}
                    width={25}
                  />
                  <Text style={optionText}> Modules</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={optionContainer}
                  onPress={() => {
                    history.push(`${url}/about/${currentClass?.id}`);
                    props.onOptionPress();
                  }}>
                  {props.isOwner ? <Sliders /> : <InfoCircle />}
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
    height: '15%',
    justifyContent: 'space-between',
    padding: 5,
    marginBottom: 5,
  },
  avatarImageStyle: {
    height: 70,
    width: 70,
    marginTop: 10,
    backgroundColor: commonGrey,
  },
  leftContainer: {
    width: 100,
    backgroundColor: commonBackground,
    padding: 8,
  },
  rightContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: commonGrey,
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
