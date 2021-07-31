import React from 'react';
import {View, FlatList, ActivityIndicator} from 'react-native';
import {Header, ListItem, Button, Text} from 'react-native-elements';
import {StackNavigationProp} from '@react-navigation/stack';
import {CompositeNavigationProp} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {connect} from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {HeadCom} from '../../shared/components/common';
import {Avatar} from '../../shared/components/common';

import {StoreState} from '../../shared/global';
import {Class, registerCurrentClass} from '../../shared/global/actions/classes';

import {RootStackParamList, DrawerParamList} from '../navigators/types';
import {mediaUrl} from '../../shared/utils/urls';
import {ContainerStyles} from '../../shared/styles/styles';
import {
  commonBlue,
  commonGrey,
  greyWithAlpha,
} from '../../shared/styles/colors';

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
  classes: {
    classes: Class[];
    loading: boolean;
    errored: boolean;
  };
  currentClass: Class | null;
  registerCurrentClass: typeof registerCurrentClass;
};

class Settings extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  renderItem = ({item}: {item: Class}) => {
    const isOwner = item.owner.username === this.props.profile.username;
    return (
      <ListItem bottomDivider>
        <Avatar
          source={{
            uri: `${mediaUrl}/class/avatar/${item.photo}`,
          }}
          style={{backgroundColor: greyWithAlpha(0.5)}}
        />

        <ListItem.Content>
          <ListItem.Title>{item.name}</ListItem.Title>
          <ListItem.Subtitle>{item.subject}</ListItem.Subtitle>
        </ListItem.Content>

        <Button
          title={isOwner ? 'Manage' : 'Info'}
          type="outline"
          onPress={() => {
            this.props.registerCurrentClass(item);
            this.props.navigation.navigate('Manage');
          }}
        />
      </ListItem>
    );
  };

  renderContent = () => {
    const {classes} = this.props;

    if (classes.errored) {
      return (
        <Text>
          We're having trouble in connecting to services. Please try again later
        </Text>
      );
    }

    if (classes.loading) {
      return <ActivityIndicator size="large" color={commonBlue} animating />;
    }

    if (classes.classes.length === 0) {
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
        data={this.props.classes.classes}
        keyExtractor={(_item, i) => i.toString()}
        renderItem={this.renderItem}
        removeClippedSubviews
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
          rightComponent={
            <MaterialCommunityIcons
              name="account-edit-outline"
              size={28}
              color={commonGrey}
              onPress={() =>
                this.props.navigation.navigate('EditProfile', {
                  username: profile.username,
                })
              }
            />
          }
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
    currentClass: state.currentClass,
  };
};

export default connect(mapStateToProps, {registerCurrentClass})(Settings);
