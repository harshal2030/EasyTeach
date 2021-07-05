import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Alert,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import {withRouter, RouteComponentProps} from 'react-router-dom';
import {connect} from 'react-redux';
import {Header, Input, Button, ButtonGroup} from 'react-native-elements';
import {toast} from 'react-toastify';
import {TouchableIcon} from '../components';
import arrowBack from '@iconify-icons/ic/round-arrow-back';
import {socket} from '../../shared/socket';

import {CommonSetting} from '../../shared/components/main';
import {classUrl} from '../../shared/utils/urls';

import {
  Class,
  addClass,
  registerCurrentClass,
} from '../../shared/global/actions/classes';
import {staticImageExtPattern} from '../../shared/utils/regexPatterns';
import {StoreState} from '../../shared/global';

type Props = RouteComponentProps & {
  token: string;
  classes: Class[];
  addClass: typeof addClass;
  registerCurrentClass: typeof registerCurrentClass;
};

type State = {
  selected: number;
  photo: File | null;
  joinCode: string;
  className: string;
  about: string;
  previewPhoto: string;
  subject: string;
  loading: boolean;
};

class JoinClass extends React.Component<Props, State> {
  upload: HTMLInputElement | null = null;
  constructor(props: Props) {
    super(props);

    this.state = {
      selected: 0,
      photo: null,
      joinCode: '',
      className: '',
      about: '',
      subject: '',
      loading: false,
      previewPhoto: '',
    };
  }

  private joinSocketRoom = (classId: string) => {
    socket.emit('class:join_create', classId);
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
        this.joinSocketRoom(res.data.id);
        this.props.registerCurrentClass(res.data);
        this.props.history.push(`/classes/home/${res.data.id}`);
      })
      .catch((e) => {
        this.setState({loading: false});
        if (e.response && e.response.status === 400) {
          return Alert.alert('Oops!', e.response.data.error);
        }

        toast('Unable to join class at the moment');
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

    if (photo) {
      reqBody.append('classPhoto', photo, photo.name);
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
        this.joinSocketRoom(res.data.id);
        this.props.registerCurrentClass(res.data);
        this.props.history.push(`/classes/home/${res.data.id}`);
      })
      .catch((e) => {
        this.setState({loading: false});
        if (e.response) {
          if (e.response.status === 400) {
            return Alert.alert('Oops!', e.response.data.error);
          }
        }

        toast.error(
          'Unable to create class at the moment. Please try again later',
        );
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

  onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (!staticImageExtPattern.test(e.target.files[0].name)) {
        return toast.error('Please select a valid image file');
      }

      this.setState({
        photo: e.target.files[0],
        previewPhoto: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  private createClass() {
    const {className, about, subject, loading} = this.state;
    return (
      <ScrollView>
        <CommonSetting
          buttonLoading={loading}
          onButtonPress={this.createClassRequest}
          buttonProps={{title: 'Create Class'}}
          imageSource={{uri: this.state.previewPhoto}}
          onImagePress={() => this.upload!.click()}>
          <input
            id="image"
            name="avatar-image"
            type="file"
            onChange={this.onFileChange}
            accept="image/*"
            ref={(ref) => (this.upload = ref)}
            style={{display: 'none'}}
          />
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

  render() {
    const {mainContainer, RBContainer} = styles;
    const {loading} = this.state;

    return (
      <View style={mainContainer}>
        <Header
          leftComponent={
            <TouchableIcon
              icon={arrowBack}
              size={28}
              color="#fff"
              onPress={this.props.history.goBack}
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
            containerStyle={{width: ' 50%', height: 50}}
            disabled={loading}
            onPress={(selected) => this.setState({selected})}
            selectedIndex={this.state.selected}
          />
        </View>

        {this.state.selected === 0 ? this.joinClass() : this.createClass()}
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

export default withRouter(
  connect(mapStateToProps, {addClass, registerCurrentClass})(JoinClass),
);
