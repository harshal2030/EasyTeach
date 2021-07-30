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
import {toast} from 'react-toastify';
import Dialog from 'react-native-dialog';
import CameraAlt from '@iconify-icons/ic/round-camera-alt';
import MenuIcon from '@iconify-icons/ic/menu';
import CopyIcon from '@iconify-icons/ic/content-copy';

import {TouchableIcon} from '../components';
import {CheckBox, HeaderBadge} from '../../shared/components/common';

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
  premiumAllowed: boolean;
  unread: number;
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
  lockMsg: boolean;
  ownerChangeModal: boolean;
  ownerChangeClassName: string;
  ownerChangeContinue: boolean;
  newOwner: string;
}

class ManageClass extends React.Component<Props, State> {
  upload: HTMLInputElement | null = null;
  constructor(props: Props) {
    super(props);

    const {name, photo, about, subject, lockJoin, lockMsg} =
      this.props.currentClass!;

    this.state = {
      name,
      about,
      subject,
      lockMsg,
      lockJoin,
      preview: `${mediaUrl}/class/avatar/${photo}`,
      photo: null,
      loading: false,
      deleteModal: false,
      ownerChangeModal: false,
      ownerChangeClassName: '',
      ownerChangeContinue: false,
      newOwner: '',
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
    const {name, subject, about, photo, lockJoin, lockMsg} = this.state;
    const reqBody = new FormData();

    reqBody.append(
      'info',
      JSON.stringify({
        name,
        subject,
        about,
        lockJoin,
        lockMsg,
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
    navigator.clipboard
      .writeText(
        `Join my class on EasyTeach, through this code: https://easyteach.inddex.co/joinclass?c=${
          this.props.currentClass!.joinCode
        }. Download app from https://play.google.com/store/apps/details?id=com.hcodes.easyteach`,
      )
      .then(() => toast.info('Joining Info has been copied to clipboard'))
      .catch(() =>
        toast.error('Unable to copy text info. Manually share the join code.'),
      );
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

  cancelOwnershipChange = () => {
    this.setState({
      ownerChangeClassName: '',
      ownerChangeContinue: false,
      ownerChangeModal: false,
      newOwner: '',
    });
  };

  ownerChangeContinue = () => {
    if (this.state.ownerChangeClassName === this.props.currentClass?.name) {
      this.setState({ownerChangeContinue: true});
      return;
    }

    toast.error('Class Name does not match');
  };

  changeOwner = () => {
    axios
      .post(
        `${classUrl}/${this.props.match.params.classId}`,
        {user: this.state.newOwner, class: this.state.ownerChangeClassName},
        {
          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
        },
      )
      .then(() => {
        this.cancelOwnershipChange();
        this.props.removeClass(this.props.currentClass!.id);
        this.props.revokeCurrentClass(this.props.classes);
        this.props.history.push(`/classes/home/${this.props.currentClass!.id}`);
        toast.success('Successfully transferred class');
      })
      .catch(() =>
        toast.error('Unable to transfer Ownership. Please try again later'),
      );
  };

  renderNextPayDate = () => {
    const {currentClass, premiumAllowed, isOwner} = this.props;

    if (isOwner) {
      const nextPay = currentClass!.payedOn
        ? new Date(currentClass!.payedOn)
        : new Date();

      if (currentClass!.payedOn) {
        nextPay.setDate(nextPay.getDate() + 30);
      }

      const value = nextPay.toDateString();

      if (premiumAllowed) {
        return <Input value={value} disabled label="Next Payment Date" />;
      }

      if (!premiumAllowed && currentClass?.payedOn) {
        return <Input value="Today" disabled label="Next Payment Date" />;
      }
    }
  };

  render() {
    const {name, about, subject, lockJoin, loading, preview, lockMsg} =
      this.state;
    const {joinCode} = this.props.currentClass!;
    const {isOwner, premiumAllowed} = this.props;
    return (
      <View style={ContainerStyles.parent}>
        <Header
          centerComponent={{
            text: this.props.isOwner ? 'Manage' : 'Info',
            style: {fontSize: 24, color: '#fff', fontWeight: '600'},
          }}
          leftComponent={
            <>
              <TouchableIcon
                icon={MenuIcon}
                size={26}
                color="#fff"
                onPress={this.props.onTopLeftPress}
              />
              {this.props.unread !== 0 ? <HeaderBadge /> : null}
            </>
          }
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
                  <TouchableIcon icon={CameraAlt} color="#000" size={28} />
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
              value={this.props.currentClass!.owner.name}
              label="Class Owner"
              disabled
              rightIcon={
                isOwner && (
                  <Button
                    title="Transfer Ownership"
                    onPress={() => this.setState({ownerChangeModal: true})}
                  />
                )
              }
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
            {this.renderNextPayDate()}
            {isOwner && (
              <>
                <Input
                  value={joinCode}
                  label="Join Code"
                  rightIcon={
                    <TouchableIcon
                      icon={CopyIcon}
                      onPress={this.shareCode}
                      size={24}
                    />
                  }
                  disabled
                />
                <CheckBox
                  checked={lockMsg}
                  title="Lock Messages"
                  desc="Enabling this will not allow students to send messages."
                  onPress={() => this.setState({lockMsg: !lockMsg})}
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

            {isOwner && !premiumAllowed && (
              <Button
                title="Upgrade"
                containerStyle={{marginTop: 20}}
                onPress={() =>
                  this.props.history.push(
                    `/checkout/${this.props.match.params.classId}`,
                  )
                }
              />
            )}
          </View>
        </ScrollView>

        <Dialog.Container visible={this.state.ownerChangeModal}>
          <Dialog.Title style={{color: flatRed}}>Danger Zone</Dialog.Title>
          {this.state.ownerChangeContinue ? (
            <>
              <Dialog.Description>
                Enter the new owner's username or E-mail and click submit
              </Dialog.Description>
              <Input
                label="Username or E-mail"
                inputStyle={{padding: 5}}
                value={this.state.newOwner}
                onChangeText={(text) => this.setState({newOwner: text})}
              />
              <View style={{flexDirection: 'row'}}>
                <Button
                  title="SUBMIT"
                  buttonStyle={{marginHorizontal: 10}}
                  onPress={this.changeOwner}
                />
                <Button
                  title="CANCEL"
                  buttonStyle={{marginHorizontal: 10}}
                  onPress={this.cancelOwnershipChange}
                />
              </View>
            </>
          ) : (
            <>
              <Dialog.Description>
                You're going to change the owner of the class. You no longer
                will be able access this class
              </Dialog.Description>
              <Dialog.Description>
                {`Type ${
                  this.props.currentClass!.name
                } (CASE SENSITIVE) below and click continue`}
              </Dialog.Description>
              <Input
                label="Your Class Name"
                value={this.state.ownerChangeClassName}
                inputStyle={{paddingHorizontal: 5}}
                onChangeText={(text) =>
                  this.setState({ownerChangeClassName: text})
                }
              />
              <View style={{flexDirection: 'row'}}>
                <Button
                  title="CONTINUE"
                  buttonStyle={{backgroundColor: flatRed, marginHorizontal: 10}}
                  onPress={this.ownerChangeContinue}
                />
                <Button
                  title="CANCEL"
                  buttonStyle={{marginHorizontal: 10}}
                  onPress={this.cancelOwnershipChange}
                />
              </View>
            </>
          )}
        </Dialog.Container>

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
    premiumAllowed: state.currentClass?.planId !== 'free',
    unread: state.unreads.totalUnread,
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
