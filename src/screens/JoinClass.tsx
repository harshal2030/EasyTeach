import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import axios from 'axios';
import {connect} from 'react-redux';
import {Header, Input, Button, ButtonGroup} from 'react-native-elements';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import RBSheet from 'react-native-raw-bottom-sheet';
import ImagePicker from 'react-native-image-crop-picker';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigators/types';
import SnackBar from 'react-native-snackbar';

import {greyWithAlpha} from '../styles/colors';
import {classUrl} from '../utils/urls';

import {Class, addClass} from '../global/actions/classes';
import {StoreState} from '../global';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'JoinClass'>;
  token: string;
  classes: Class[];
  addClass: typeof addClass;
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
        uri: 'none',
        type: '',
      },
      joinCode: '',
      className: '',
      about: '',
      subject: '',
      loading: false,
    };
  }

  private sheet: RBSheet | null = null;

  private openPicker = () => {
    ImagePicker.openPicker({
      width: 200,
      height: 200,
      compressImageQuality: 1,
      cropping: true,
    })
      .then((image) => {
        this.sheet!.close();
        this.setState({
          photo: {
            uri: image.path,
            type: image.mime,
          },
        });
      })
      .catch(() => {
        SnackBar.show({
          text: 'Unable to pick Image.',
          duration: SnackBar.LENGTH_SHORT,
        });
        this.sheet!.close();
      });
  };

  private openCamera = () => {
    ImagePicker.openCamera({
      width: 200,
      height: 200,
      cropping: true,
    })
      .then((image) => {
        this.sheet!.close();
        this.setState({
          photo: {
            uri: image.path,
            type: image.mime,
          },
        });
      })
      .catch(() => {
        SnackBar.show({
          text: 'Unable to pick image',
          duration: SnackBar.LENGTH_SHORT,
        });
        this.sheet!.close();
      });
  };

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
        this.props.addClass(res.data);
        this.props.navigation.navigate('Drawer');
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
    const {className, about, subject, loading} = this.state;
    const {createClassContainer, classImage, imageOverlay} = styles;
    return (
      <ScrollView
        style={createClassContainer}
        keyboardShouldPersistTaps="handled">
        <View>
          <ImageBackground
            style={classImage}
            source={{uri: this.state.photo.uri}}>
            <TouchableOpacity
              style={imageOverlay}
              onPress={() => this.sheet!.open()}>
              <MaterialIcons name="camera-alt" color="#000" size={28} />
            </TouchableOpacity>
          </ImageBackground>
        </View>

        <View>
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

          <Button
            title="Create Class"
            loading={loading}
            onPress={this.createClassRequest}
          />
        </View>
      </ScrollView>
    );
  }

  render() {
    const {mainContainer, RBContainer, RBOptionContainer, RBTextStyle} = styles;
    const {loading} = this.state;

    return (
      <View style={mainContainer}>
        <Header
          leftComponent={
            <MaterialIcons
              name="arrow-back"
              color="#fff"
              size={28}
              onPress={() => this.props.navigation.goBack()}
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

        <RBSheet
          height={150}
          ref={(ref) => (this.sheet = ref)}
          closeOnPressMask
          closeOnDragDown
          customStyles={{
            container: {
              borderTopWidth: 1,
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              borderColor: 'transparent',
            },
          }}>
          <View>
            <TouchableOpacity
              style={RBOptionContainer}
              onPress={this.openPicker}>
              <MaterialIcons name="image" color="#000" size={24} />
              <Text style={RBTextStyle}>Pick from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={RBOptionContainer}
              onPress={this.openCamera}>
              <MaterialIcons name="camera" color="#000" size={24} />
              <Text style={RBTextStyle}>Shoot from Camera</Text>
            </TouchableOpacity>
          </View>
        </RBSheet>
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
  createClassContainer: {
    marginTop: 30,
    padding: 10,
  },
  classImage: {
    height: 100,
    width: 100,
    borderWidth: 1,
    borderRadius: 50,
    borderColor: 'transparent',
    overflow: 'hidden',
    alignSelf: 'center',
  },
  imageOverlay: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 50,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: greyWithAlpha(0.3),
  },
  RBOptionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  RBTextStyle: {
    fontSize: 20,
    fontWeight: '400',
  },
});

const mapStateToProps = (state: StoreState) => {
  return {
    token: state.token!,
    classes: state.classes,
  };
};

export default connect(mapStateToProps, {addClass})(JoinClass);
