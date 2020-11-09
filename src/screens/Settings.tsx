import React from 'react';
import {View, FlatList} from 'react-native';
import {Header, Text} from 'react-native-elements';
import {StackNavigationProp} from '@react-navigation/stack';
import {connect} from 'react-redux';
import RBSheet from 'react-native-raw-bottom-sheet';
import {ImageOrVideo} from 'react-native-image-crop-picker';
import SnackBar from 'react-native-snackbar';

import {HeadCom} from '../components/common';

import {StoreState} from '../global';
import {Class} from '../global/actions/classes';
import {RootStackParamList} from '../navigators/types';
import {mediaUrl} from '../utils/urls';
import {ContainerStyles} from '../styles/styles';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Settings'>;
  token: string | null;
  profile: {
    name: string;
    username: string;
    avatar: string;
  };
  classes: Class[];
};

type State = {
  name: string;
  photo: {
    uri: string;
    type: string;
  };
  username: string;
};

class Settings extends React.Component<Props, State> {
  sheet: RBSheet | null = null;
  constructor(props: Props) {
    super(props);

    const {profile} = this.props;

    this.state = {
      name: profile.name,
      photo: {
        uri: `${mediaUrl}/avatar/${profile.avatar}`,
        type: 'image/png',
      },
      username: profile.username,
    };
  }

  onImage = (image: ImageOrVideo) => {
    this.sheet!.close();
    this.setState({
      photo: {
        uri: image.path,
        type: image.mime,
      },
    });
  };

  onImageError = () => {
    SnackBar.show({
      text: 'Unable to pick image.',
      duration: SnackBar.LENGTH_SHORT,
    });
    this.sheet!.close();
  };

  render() {
    const {photo, name, username} = this.state;
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
        <HeadCom avatar={photo.uri} name={name} username={username} />

        <FlatList
          data={this.props.classes}
          keyExtractor={(item, i) => i.toString()}
          renderItem={({item}) => {
            return <Text>{item.name}</Text>;
          }}
        />
      </View>
    );
  }
}

const mapStateToProps = (state: StoreState) => {
  return {
    token: state.token,
    profile: state.profile,
    classes: state.classes,
  };
};

export default connect(mapStateToProps)(Settings);
