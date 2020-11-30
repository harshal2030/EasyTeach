import React from 'react';
import {View} from 'react-native';
import {Header} from 'react-native-elements';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {connect} from 'react-redux';

import {CommonSetting} from '../components/main';

import {StoreState} from '../global';
import {RootStackParamList} from '../navigators/types';
import {mediaUrl} from '../utils/urls';

type NavigationProps = StackNavigationProp<RootStackParamList, 'EditProfile'>;

interface Props {
  navigation: NavigationProps;
  route: RouteProp<RootStackParamList, 'EditProfile'>;
  profile: {
    name: string;
    username: string;
    avatar: string;
  };
}

class EditProfile extends React.Component<Props> {
  render() {
    return (
      <View>
        <Header
          centerComponent={{
            text: 'Edit Profile',
            style: {fontSize: 24, color: '#fff', fontWeight: '600'},
          }}
          leftComponent={{
            icon: 'arrow-back',
            color: '#ffff',
            size: 26,
            onPress: this.props.navigation.goBack,
          }}
        />

        <CommonSetting
          imageSource={{
            uri: `${mediaUrl}/avatar/${this.props.profile.avatar}`,
          }}
          onButtonPress={() => console.log('hello')}
          onImagePress={() => console.log('hello')}
          buttonProps={{title: 'Update'}}
        />
      </View>
    );
  }
}

const mapStateToProps = (state: StoreState) => {
  return {
    profile: state.profile,
  };
};

export default connect(mapStateToProps)(EditProfile);
