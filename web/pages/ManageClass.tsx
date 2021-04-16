import React from 'react';
import axios from 'axios';
import {
  View,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Image as FastImage,
} from 'react-native';
import {withRouter, RouteComponentProps} from 'react-router-dom';
import {Header, Input, Button} from 'react-native-elements';
import {connect} from 'react-redux';
import MI from 'react-native-vector-icons/MaterialIcons';
import {toast} from 'react-toastify';
import Dialog from 'react-native-dialog';

import {CheckBox} from '../../shared/components/common';

import {StoreState} from '../../shared/global';
import {
  Class,
  updateClasses,
  registerCurrentClass,
  removeClass,
  revokeCurrentClass,
} from '../../shared/global/actions/classes';
import {ContainerStyles, ImageStyles} from '../../shared/styles/styles';
import {mediaUrl, classUrl, studentUrl} from '../../shared/utils/urls';
import {flatRed} from '../../shared/styles/colors';
import {staticImageExtPattern} from '../../shared/utils/regexPatterns';

type Props = RouteComponentProps<{classId: string}> & {
  currentClass: Class | null;
  token: string | null;
  updateClasses: typeof updateClasses;
  registerCurrentClass: typeof registerCurrentClass;
  removeClass: typeof removeClass;
  revokeCurrentClass: typeof revokeCurrentClass;
  isOwner: boolean;
  profile: {
    name: string;
    username: string;
    avatar: string;
  };
  classes: Class[];
  onTopLeftPress: () => void;
};

interface State {
  name: string;
  about: string;
  subject: string;
  lockJoin: boolean;
  photo: File | null;
  preview: string;
  loading: boolean;
  deleteModal: boolean;
}

class ManageClass extends React.Component<Props, State> {
  upload: HTMLInputElement | null = null;
  constructor(props: Props) {
    super(props);

    const {name, photo, about, subject, lockJoin} = this.props.currentClass!;

    this.state = {
      name,
      about,
      subject,
      lockJoin,
      preview: `${mediaUrl}/class/avatar/${photo}`,
      photo: null,
      loading: false,
      deleteModal: false,
    };
  }

  componentDidMount() {
    const {classId} = this.props.match.params;
    const {classes} = this.props;

    const classFound = classes.find((cls) => cls.id === classId);

    if (classFound) {
      this.props.registerCurrentClass(classFound);
    } else {
      this.props.history.replace('/*');
    }
  }

  onClassChange = () => {
    const {name, about, subject, lockJoin, photo} = this.props.currentClass!;
    this.setState({
      name,
      about,
      subject,
      lockJoin,
      preview: `${mediaUrl}/class/avatar/${photo}`,
    });
  };

  componentDidUpdate(prevProps: Props) {
    if (this.props.currentClass) {
      if (prevProps.currentClass!.id !== this.props.currentClass!.id) {
        this.onClassChange();
      }
    }
  }

  unEnroll = () => {
    this.setState({loading: true, deleteModal: false});
    axios
      .delete(
        `${studentUrl}/${this.props.profile.username}/${
          this.props.currentClass!.id
        }`,
        {
          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
        },
      )
      .then(() => {
        this.setState({loading: false});
        this.props.removeClass(this.props.currentClass!.id);
        this.props.revokeCurrentClass(this.props.classes);
        this.props.history.push(`/classes/home/${this.props.currentClass!.id}`);
        toast('You have been successfully removed from class.');
      })
      .catch(() => {
        this.setState({loading: false});
        toast.error('Unable to unenroll at the moment. Please try again later');
      });
  };

  updateClass = () => {
    this.setState({loading: true});
    const {name, subject, about, photo, lockJoin} = this.state;
    const reqBody = new FormData();

    reqBody.append(
      'info',
      JSON.stringify({
        name,
        subject,
        about,
        lockJoin,
      }),
    );

    if (photo) {
      reqBody.append('classPhoto', photo, photo.name);
    }

    axios
      .put<Class>(`${classUrl}/${this.props.currentClass!.id}`, reqBody, {
        headers: {
          Authorization: `Bearer ${this.props.token}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        this.setState({loading: false});
        if (res.status !== 200) {
          throw new Error();
        }
        this.props.updateClasses(res.data);
        this.props.registerCurrentClass(res.data);
        this.props.history.goBack();
      })
      .catch((e) => {
        this.setState({loading: false});
        if (e.response) {
          if (e.response.status === 400) {
            return toast.error(e.response.data.error);
          }
        }

        toast.error(
          'Unable to update class at the moment. Please try again later',
        );
      });
  };

  shareCode = () => {
    navigator.clipboard.writeText(
      `Join my class on EasyTeach, through this code: ${
        this.props.currentClass!.joinCode
      }, Download app from https://play.google.com/store/apps/details?id=com.hcodes.easyteach`,
    );
    toast.info('Joining Info has been copied to clipboard');
  };

  onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!staticImageExtPattern.test(file.name)) {
        return toast.error('Please select a valid image');
      }

      this.setState({
        photo: file,
        preview: URL.createObjectURL(file),
      });
    }
  };

  render() {
    const {name, about, subject, lockJoin, loading, preview} = this.state;
    const {joinCode} = this.props.currentClass!;
    const {isOwner} = this.props;
    return (
      <View style={ContainerStyles.parent}>
        <Header
          centerComponent={{
            text: this.props.isOwner ? 'Manage' : 'Info',
            style: {fontSize: 24, color: '#fff', fontWeight: '600'},
          }}
          leftComponent={{
            icon: 'menu',
            color: '#ffff',
            size: 26,
            onPress: this.props.onTopLeftPress,
          }}
        />

        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={{padding: 20}}>
            <input
              type="file"
              accept="image/*"
              ref={(ref) => (this.upload = ref)}
              style={{display: 'none'}}
              onChange={this.onFileSelect}
            />
            {isOwner ? (
              <ImageBackground
                style={ImageStyles.classImage}
                source={{uri: preview}}>
                <TouchableOpacity
                  style={ImageStyles.imageOverlay}
                  onPress={() => this.upload!.click()}>
                  <MI name="camera-alt" color="#000" size={28} />
                </TouchableOpacity>
              </ImageBackground>
            ) : (
              <FastImage
                style={ImageStyles.classImage}
                source={{uri: preview}}
              />
            )}

            <Input
              value={name}
              disabled={loading || !isOwner}
              label="Name"
              onChangeText={(text) => this.setState({name: text})}
            />
            <Input
              value={about}
              label="About"
              disabled={loading || !isOwner}
              numberOfLines={3}
              multiline
              onChangeText={(text) => this.setState({about: text})}
            />
            <Input
              value={subject}
              label="Subject"
              disabled={loading || !isOwner}
              onChangeText={(text) => this.setState({subject: text})}
            />
            {isOwner && (
              <>
                <Input
                  value={joinCode}
                  label="Join Code"
                  rightIcon={{
                    name: 'content-copy',
                    onPress: this.shareCode,
                  }}
                  disabled
                />
                <CheckBox
                  checked={lockJoin}
                  title="Lock Join"
                  onPress={() => this.setState({lockJoin: !lockJoin})}
                  desc="Enabling this will not allow anyone to join the class."
                />
              </>
            )}

            {isOwner ? (
              <Button
                title="Save"
                onPress={this.updateClass}
                loading={loading}
                containerStyle={{marginTop: 20}}
              />
            ) : (
              <Button
                title="Unenroll"
                loading={loading}
                buttonStyle={{backgroundColor: flatRed}}
                onPress={() => this.setState({deleteModal: true})}
                containerStyle={{marginTop: 20}}
              />
            )}
          </View>
        </ScrollView>

        <Dialog.Container visible={this.state.deleteModal}>
          <Dialog.Title>Confirm</Dialog.Title>
          <Dialog.Description>{`Are you sure to unenroll from ${
            this.props.currentClass!.name
          }? You won't have access to this class.`}</Dialog.Description>
          <Dialog.Button
            label="Cancel"
            onPress={() => this.setState({deleteModal: false})}
          />
          <Dialog.Button label="Yes" onPress={this.unEnroll} />
        </Dialog.Container>
      </View>
    );
  }
}

const mapStateToProps = (state: StoreState) => {
  let isOwner = false;
  if (state.currentClass!.owner.username === state.profile.username) {
    isOwner = true;
  }
  return {
    currentClass: state.currentClass,
    token: state.token,
    isOwner,
    profile: state.profile,
    classes: state.classes,
  };
};

export default withRouter(
  connect(mapStateToProps, {
    updateClasses,
    registerCurrentClass,
    removeClass,
    revokeCurrentClass,
  })(ManageClass),
);
