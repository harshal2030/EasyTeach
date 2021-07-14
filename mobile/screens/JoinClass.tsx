import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import {connect} from 'react-redux';
import {ImageOrVideo} from 'react-native-image-crop-picker';
import {Header, Input, Button, ButtonGroup} from 'react-native-elements';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import RBSheet from 'react-native-raw-bottom-sheet';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../navigators/types';
import SnackBar from 'react-native-snackbar';

import {PhotoPicker} from '../components/common';

import {CommonSetting} from '../../shared/components/main';
import {classUrl, mediaUrl} from '../../shared/utils/urls';
import {socket} from '../../shared/socket';

import {
  Class,
  addClass,
  registerCurrentClass,
} from '../../shared/global/actions/classes';
import {StoreState} from '../../shared/global';
import {eucalyptusGreen} from '../../shared/styles/colors';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'JoinClass'>;
  token: string;
  route: RouteProp<RootStackParamList, 'JoinClass'>;
  classes: Class[];
  addClass: typeof addClass;
  registerCurrentClass: typeof registerCurrentClass;
};

type State = {
  selected: number;
  photo: {
    uri: string;
    type: string;
  };
  joinCode: string;
  className: string;
  about: string;
  subject: string;
  loading: boolean;
};

class JoinClass extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selected: 0,
      photo: {
        uri: `${mediaUrl}/class/avatar`,
        type: '',
      },
      joinCode: props.route.params?.c || '',
      className: '',
      about: '',
      subject: '',
      loading: false,
    };
  }

  private joinSocketRoom = (classId: string) => {
    socket.emit('class:join_create', classId);
  };

  componentDidMount() {
    if (this.props.route.params?.c) {
      this.joinClassRequest();
    }
  }

  private sheet: RBSheet | null = null;

  private joinClassRequest = () => {
    this.setState({loading: true});
    axios
      .post<Class>(
        `${classUrl}/join`,
        {
          joinCode: this.state.joinCode,
        },
        {
          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
        },
      )
      .then((res) => {
        this.props.registerCurrentClass(res.data);
        this.props.addClass(res.data);
        this.props.navigation.navigate('Drawer');
        this.joinSocketRoom(res.data.id);

        SnackBar.show({
          text: `Successfully joined ${res.data.name} class, open drawer to navigate to new class`,
          backgroundColor: eucalyptusGreen,
          duration: SnackBar.LENGTH_LONG,
          textColor: '#fff',
        });
      })
      .catch((e) => {
        this.setState({loading: false});
        if (e.response && e.response.status === 400) {
          return Alert.alert('Oops!', e.response.data.error);
        }

        SnackBar.show({
          text: 'Unable to join class at the moment',
          duration: SnackBar.LENGTH_SHORT,
        });
      });
  };

  private createClassRequest = () => {
    this.setState({loading: true});
    const {className, subject, about, photo} = this.state;
    const reqBody = new FormData();

    reqBody.append(
      'info',
      JSON.stringify({
        name: className,
        subject,
        about,
      }),
    );

    if (photo.uri !== 'none') {
      reqBody.append('classPhoto', {
        // @ts-ignore
        name: 'photo.jpeg',
        type: photo.type,
        uri:
          Platform.OS === 'android'
            ? photo.uri
            : photo.uri.replace('file://', ''),
      });
    }

    axios
      .post<Class>(classUrl, reqBody, {
        headers: {
          Authorization: `Bearer ${this.props.token}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        this.props.addClass(res.data);
        this.props.registerCurrentClass(res.data);
        this.joinSocketRoom(res.data.id);
        this.props.navigation.navigate('Drawer');
      })
      .catch((e) => {
        this.setState({loading: false});
        if (e.response) {
          if (e.response.status === 400) {
            return Alert.alert('Oops!', e.response.data.error);
          }
        }

        SnackBar.show({
          text: 'Unable to create class at the moment. Please try again later',
          duration: SnackBar.LENGTH_LONG,
        });
      });
  };

  private joinClass() {
    const {joinClassContainer, joinClassText} = styles;
    return (
      <KeyboardAvoidingView behavior="height" style={joinClassContainer}>
        <Text style={joinClassText}>
          Enter the 12(approx.) character code given by your teacher to join the
          class.
        </Text>
        <Input
          label="Class Code"
          onChangeText={(joinCode) => this.setState({joinCode})}
          value={this.state.joinCode}
        />
        <Button
          title="Join Class"
          loading={this.state.loading}
          onPress={this.joinClassRequest}
        />
      </KeyboardAvoidingView>
    );
  }

  private createClass() {
    const {className, about, subject, loading, photo} = this.state;
    return (
      <ScrollView>
        <CommonSetting
          buttonLoading={loading}
          onButtonPress={this.createClassRequest}
          buttonProps={{title: 'Create Class'}}
          imageSource={{uri: photo.uri}}
          onImagePress={() => this.sheet!.open()}>
          <Input
            label="Class Name"
            value={className}
            onChangeText={(text) => this.setState({className: text})}
          />
          <Input
            label="About"
            multiline
            numberOfLines={3}
            value={about}
            onChangeText={(text) => this.setState({about: text})}
          />
          <Input
            label="Subject"
            value={subject}
            onChangeText={(text) => this.setState({subject: text})}
          />
        </CommonSetting>
      </ScrollView>
    );
  }

  private onImage = (image: ImageOrVideo) => {
    this.sheet!.close();
    this.setState({
      photo: {
        uri: image.path,
        type: image.mime,
      },
    });
  };

  private onImageError = () => {
    SnackBar.show({
      text: 'Unable to pick image',
      duration: SnackBar.LENGTH_SHORT,
    });
    this.sheet!.close();
  };

  private goBack = () => {
    if (this.props.navigation.canGoBack()) {
      this.props.navigation.goBack();
    } else {
      this.props.navigation.replace('Drawer');
    }
  };

  render() {
    const {mainContainer, RBContainer} = styles;
    const {loading} = this.state;

    return (
      <View style={mainContainer}>
        <Header
          leftComponent={
            <MaterialIcons
              name="arrow-back"
              color="#fff"
              size={28}
              onPress={this.goBack}
            />
          }
          centerComponent={{
            text: 'Join or Create class',
            style: {fontSize: 20, color: '#ffff'},
          }}
        />
        <View style={RBContainer}>
          <ButtonGroup
            buttons={['Join Class', 'Create Class']}
            disabled={loading}
            onPress={(selected) => this.setState({selected})}
            selectedIndex={this.state.selected}
          />
        </View>

        {this.state.selected === 0 ? this.joinClass() : this.createClass()}

        <PhotoPicker
          sheetRef={(ref) => (this.sheet = ref)}
          onCameraImage={this.onImage}
          onPickerImage={this.onImage}
          onCameraError={this.onImageError}
          onPickerError={this.onImageError}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  RBContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  joinClassContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  joinClassText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 20,
  },
});

const mapStateToProps = (state: StoreState) => {
  return {
    token: state.token!,
    classes: state.classes,
  };
};

export default connect(mapStateToProps, {addClass, registerCurrentClass})(
  JoinClass,
);
