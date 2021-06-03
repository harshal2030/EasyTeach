import React from 'react';
import {View, FlatList, ActivityIndicator} from 'react-native';
import {Header, ListItem, Button, Text} from 'react-native-elements';
import {connect} from 'react-redux';
import {withRouter, RouteComponentProps} from 'react-router-dom';
import ArrowBack from '@iconify-icons/ic/arrow-back';

import {TouchableIcon} from '../components';
import AccountEdit from '../../shared/images/account-edit.svg';
import {HeadCom} from '../../shared/components/common';
import {Avatar} from '../../shared/components/common';

import {StoreState} from '../../shared/global';
import {Class, registerCurrentClass} from '../../shared/global/actions/classes';

import {mediaUrl} from '../../shared/utils/urls';
import {ContainerStyles} from '../../shared/styles/styles';
import {commonBlue, greyWithAlpha} from '../../shared/styles/colors';
import {TouchableOpacity} from 'react-native-gesture-handler';

type Props = RouteComponentProps & {
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
          style={{backgroundColor: greyWithAlpha(0.3)}}
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
            this.props.history.push(`/classes/about/${item.id}`);
          }}
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
            onPress={() => this.props.history.push('/joinclass')}
          />
        </>
      );
    }

    return (
      <FlatList
        data={this.props.classes}
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
          leftComponent={
            <TouchableIcon
              icon={ArrowBack}
              size={26}
              color="#fff"
              onPress={this.props.history.goBack}
            />
          }
        />
        <HeadCom
          avatar={`${mediaUrl}/avatar/${profile.avatar}`}
          name={profile.name}
          username={profile.username}
          rightComponent={
            <TouchableOpacity
              onPress={() => this.props.history.push('/profile')}>
              <AccountEdit />
            </TouchableOpacity>
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
    classIsLoading: state.classIsLoading,
    classHasErrored: state.classHasErrored,
    currentClass: state.currentClass,
  };
};

export default withRouter(
  connect(mapStateToProps, {registerCurrentClass})(Settings),
);
