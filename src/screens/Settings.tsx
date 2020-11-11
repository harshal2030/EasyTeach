import React from 'react';
import axios from 'axios';
import {View, FlatList, ActivityIndicator, Alert} from 'react-native';
import {Header, ListItem, Avatar, Button, Text} from 'react-native-elements';
import {StackNavigationProp} from '@react-navigation/stack';
import {CompositeNavigationProp} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {connect} from 'react-redux';
import SnackBar from 'react-native-snackbar';

import {HeadCom} from '../components/common';

import {StoreState} from '../global';
import {
  Class,
  removeClass,
  registerCurrentClass,
} from '../global/actions/classes';

import {RootStackParamList, DrawerParamList} from '../navigators/types';
import {mediaUrl, studentUrl} from '../utils/urls';
import {ContainerStyles} from '../styles/styles';
import {flatRed, commonBlue} from '../styles/colors';

type NavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DrawerParamList, 'Settings'>,
  StackNavigationProp<RootStackParamList>
>;

type Props = {
  navigation: NavigationProp;
  token: string | null;
  profile: {
    name: string;
    username: string;
    avatar: string;
  };
  classes: Class[];
  classIsLoading: boolean;
  classHasErrored: boolean;
  currentClass: Class | null;
  removeClass: typeof removeClass;
  registerCurrentClass: typeof registerCurrentClass;
};

class Settings extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  unEnrollClass = (classId: string, className: string) => {
    axios
      .delete(`${studentUrl}/${this.props.profile.username}/${classId}`, {
        headers: {
          Authorization: `Bearer ${this.props.token}`,
        },
      })
      .then(() => {
        this.props.removeClass(classId);
        SnackBar.show({
          text: `You've Unenrolled from ${className} successfully`,
          duration: SnackBar.LENGTH_SHORT,
        });
      })
      .catch(() => {
        SnackBar.show({
          text: "Can't Unenroll from class. Please try again later",
          backgroundColor: flatRed,
          textColor: '#fff',
        });
      });
  };

  confirmUnenroll = (classId: string, className: string) => {
    Alert.alert('Confirm', `Are you sure to Unenroll from ${className}`, [
      {
        text: 'Cancel',
      },
      {
        text: 'Yes',
        onPress: () => this.unEnrollClass(classId, className),
      },
    ]);
  };

  renderItem = ({item}: {item: Class}) => {
    const isOwner = item.owner.username === this.props.profile.username;
    return (
      <ListItem bottomDivider>
        <Avatar
          size="medium"
          source={{
            uri: `${mediaUrl}/class/avatar/${item.photo}`,
          }}
        />

        <ListItem.Content>
          <ListItem.Title>{item.name}</ListItem.Title>
          <ListItem.Subtitle>{item.subject}</ListItem.Subtitle>
        </ListItem.Content>

        <Button
          title={isOwner ? 'Manage' : 'Unenroll'}
          type="outline"
          onPress={() => {
            if (isOwner) {
              this.props.navigation.navigate('Manage');
              this.props.registerCurrentClass(item);
            } else {
              this.confirmUnenroll(item.id, item.name);
            }
          }}
          buttonStyle={{borderColor: isOwner ? commonBlue : flatRed}}
          titleStyle={{color: isOwner ? commonBlue : flatRed}}
        />
      </ListItem>
    );
  };

  renderContent = () => {
    const {classHasErrored, classIsLoading, classes} = this.props;

    if (classHasErrored) {
      return (
        <Text>
          We're having trouble in connecting to services. Please try again later
        </Text>
      );
    }

    if (classIsLoading) {
      return <ActivityIndicator size="large" color={commonBlue} animating />;
    }

    if (classes.length === 0) {
      return (
        <>
          <Text>
            Looks like it's your first time. Begin with Joining or Creating a
            class
          </Text>
          <Button
            title="Create or Join class"
            onPress={() => this.props.navigation.navigate('JoinClass')}
          />
        </>
      );
    }

    return (
      <FlatList
        data={this.props.classes}
        keyExtractor={(_item, i) => i.toString()}
        renderItem={this.renderItem}
      />
    );
  };

  render() {
    const {profile} = this.props;
    return (
      <View style={[ContainerStyles.parent, {backgroundColor: '#ffff'}]}>
        <Header
          centerComponent={{
            text: 'Settings',
            style: {fontSize: 24, color: '#fff', fontWeight: '600'},
          }}
          leftComponent={{
            icon: 'arrow-back',
            color: '#ffff',
            size: 26,
            onPress: () => this.props.navigation.goBack(),
          }}
        />
        <HeadCom
          avatar={`${mediaUrl}/avatar/${profile.avatar}`}
          name={profile.name}
          username={profile.username}
          rightComponent={null}
        />

        {this.renderContent()}
      </View>
    );
  }
}

const mapStateToProps = (state: StoreState) => {
  return {
    token: state.token,
    profile: state.profile,
    classes: state.classes,
    classIsLoading: state.classIsLoading,
    classHasErrored: state.classHasErrored,
    currentClass: state.currentClass,
  };
};

export default connect(mapStateToProps, {removeClass, registerCurrentClass})(
  Settings,
);
