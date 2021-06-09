import React from 'react';
import axios from 'axios';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableHighlight,
  StyleSheet,
} from 'react-native';
import Dialog from 'react-native-dialog';
import {Header, Button} from 'react-native-elements';
import {connect} from 'react-redux';
import LottieView from 'lottie-react-native';
import {toast} from 'react-toastify';
import {withRouter, RouteComponentProps} from 'react-router-dom';
import pencilIcon from '@iconify-icons/mdi/pencil';
import deleteIcon from '@iconify-icons/mdi/delete-outline';
import menuIcon from '@iconify-icons/ic/menu';
import refreshCw from '@iconify-icons/feather/refresh-ccw';
import plusIcon from '@iconify-icons/ic/baseline-plus';

import {TouchableIcon} from '../components';
import {StoreState} from '../../shared/global';
import {Class, registerCurrentClass} from '../../shared/global/actions/classes';

import {moduleUrl} from '../../shared/utils/urls';
import {ContainerStyles} from '../../shared/styles/styles';
import {
  commonBlue,
  greyWithAlpha,
  commonBackground,
  commonGrey,
  flatRed,
} from '../../shared/styles/colors';
import {bytesToGB} from '../../shared/utils/functions';

interface Props extends RouteComponentProps<{classId: string}> {
  currentClass: Class | null;
  token: string;
  isOwner: boolean;
  premiumAllowed: boolean;
  classes: Class[];
  registerCurrentClass: typeof registerCurrentClass;
  onLeftTopPress: () => void;
}

interface ModuleRes {
  id: string;
  title: string;
  classId: string;
}

interface State {
  loading: boolean;
  errored: boolean;
  modules: ModuleRes[];
  dialogVisible: boolean;
  moduleName: string;
  moduleId: string | null;
  alertInfo: {
    title: string;
    description: string;
    buttons: {text: string; onPress(): void}[];
  };
  alertVisible: boolean;
}

class Module extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loading: true,
      errored: false,
      modules: [],
      dialogVisible: false,
      moduleName: '',
      moduleId: null,
      alertInfo: {
        title: '',
        description: '',
        buttons: [],
      },
      alertVisible: false,
    };
  }

  componentDidMount() {
    const {classId} = this.props.match.params;
    const {classes} = this.props;

    const classFound = classes.find((cls) => cls.id === classId);

    if (classFound) {
      this.props.registerCurrentClass(classFound);
    } else {
      if (classes.length !== 0) {
        this.props.history.replace('/*');
      }
    }
    if (this.props.premiumAllowed) {
      this.fetchModules();
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (
      prevProps.currentClass?.id === this.props.currentClass?.id &&
      this.props.premiumAllowed !== prevProps.premiumAllowed
    ) {
      this.fetchModules();
      return;
    }

    if (prevProps.currentClass?.id !== this.props.currentClass?.id) {
      this.fetchModules();
    }
  }

  Alert = (
    title: string,
    description: string,
    buttons?: {text: string; onPress(): void}[],
  ) => {
    const buttonToSet = buttons
      ? buttons
      : [{text: 'Ok', onPress: () => this.setState({alertVisible: false})}];

    this.setState({
      alertInfo: {
        title,
        description,
        buttons: buttonToSet,
      },
      alertVisible: true,
    });
  };

  fetchModules = async () => {
    try {
      this.setState({loading: true});
      const res = await axios.get<ModuleRes[]>(
        `${moduleUrl}/${this.props.currentClass?.id}`,
        {
          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
        },
      );

      this.setState({loading: false, modules: res.data});
    } catch (e) {
      this.setState({loading: false, errored: true});
    }
  };

  confirmDelete = (id: string) => {
    const deleteModule = () => {
      this.setState({alertVisible: false});
      axios
        .delete(`${moduleUrl}/${this.props.currentClass?.id}/${id}`, {
          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
        })
        .then(() => {
          const temp = this.state.modules.filter((val) => val.id !== id);
          this.setState({modules: temp, moduleId: null});
        })
        .catch(() => {
          toast.error('Unable to delete module. Please try again later');
        });
    };

    this.Alert(
      'Confirm',
      'Are you sure to delete? You will lose all related information.',
      [
        {
          text: 'Cancel',
          onPress: () => this.setState({alertVisible: false}),
        },
        {
          text: 'Yes',
          onPress: deleteModule,
        },
      ],
    );
  };

  closeDialog = () => {
    this.setState({dialogVisible: false, moduleId: null});
  };

  createModule = async () => {
    try {
      this.closeDialog();
      const res = await axios.post<ModuleRes>(
        `${moduleUrl}/${this.props.currentClass!.id}`,
        {title: this.state.moduleName},
        {
          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
        },
      );

      this.setState({
        modules: [...this.state.modules, res.data],
        moduleName: '',
      });
    } catch (e) {
      toast.error('Something went wrong. Please try again later');
    }
  };

  updateModule = async () => {
    try {
      this.closeDialog();

      const res = await axios.put<ModuleRes>(
        `${moduleUrl}/${this.props.currentClass?.id}/${this.state.moduleId}`,
        {
          title: this.state.moduleName,
        },
        {
          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
        },
      );

      const moduleIndex = this.state.modules.findIndex(
        (val) => val.id === res.data.id,
      );
      const temp = [...this.state.modules];
      temp[moduleIndex] = res.data;
      this.setState({moduleId: null, modules: temp, moduleName: ''});
    } catch (e) {
      this.setState({moduleId: null, moduleName: ''});
      toast.error('Unable to update. Please try again later');
    }
  };

  onDialogButtonPress = () => {
    if (this.state.moduleId) {
      this.updateModule();
    } else {
      this.createModule();
    }
  };

  renderItem = ({item}: {item: {id: string; title: string}}) => {
    return (
      <TouchableHighlight
        underlayColor={greyWithAlpha(0.4)}
        onPress={() =>
          this.props.history.push(
            `/files/${this.props.currentClass?.id}/${item.id}`,
          )
        }>
        <View style={styles.moduleContainer}>
          <Text style={styles.moduleText}>{item.title}</Text>
          {this.props.isOwner && (
            <View style={styles.iconContainer}>
              <TouchableIcon
                icon={pencilIcon}
                color="#000"
                size={26}
                onPress={() =>
                  this.setState({
                    moduleId: item.id,
                    moduleName: item.title,
                    dialogVisible: true,
                  })
                }
              />
              <TouchableIcon
                icon={deleteIcon}
                size={26}
                color={flatRed}
                onPress={() => this.confirmDelete(item.id)}
              />
            </View>
          )}
        </View>
      </TouchableHighlight>
    );
  };

  renderContent = () => {
    const {loading, errored, modules} = this.state;
    const {isOwner, currentClass} = this.props;

    let upgradeText = '';

    if (isOwner && currentClass?.payedOn) {
      upgradeText =
        'Upgrade to resume services. All things automatically recovers';
    } else if (!isOwner) {
      upgradeText = 'Ask class owner to unlock video lessons';
    } else {
      upgradeText = 'Upgrade your class to unlock video lessons';
    }

    if (!this.props.premiumAllowed) {
      return (
        <View style={styles.promotionView}>
          <Text style={styles.promotionText}>{upgradeText}</Text>
          <LottieView
            source={require('../../shared/images/rocket.json')}
            autoPlay
            style={styles.rocket}
            loop
          />
          {this.props.isOwner && (
            <Button
              title="Upgrade Now"
              onPress={() =>
                this.props.history.push(
                  `/checkout/${this.props.currentClass?.id}`,
                )
              }
            />
          )}
        </View>
      );
    }

    if (loading) {
      return (
        <View style={ContainerStyles.centerElements}>
          <ActivityIndicator animating size="large" color={commonBlue} />
        </View>
      );
    }

    if (errored) {
      return (
        <View style={ContainerStyles.centerElements}>
          <Text>
            We're having trouble in fetching modules. Please try again later
          </Text>
        </View>
      );
    }

    if (modules.length === 0) {
      return (
        <View style={ContainerStyles.centerElements}>
          <Text>Nothing to show here right now.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={modules}
        style={{padding: 10}}
        keyExtractor={(item) => item.id}
        removeClippedSubviews
        renderItem={this.renderItem}
      />
    );
  };

  render() {
    return (
      <View style={[ContainerStyles.parent, {backgroundColor: '#ffff'}]}>
        <Header
          centerComponent={{
            text: 'Modules',
            style: {fontSize: 24, color: '#ffff', fontWeight: '600'},
          }}
          leftComponent={
            <TouchableIcon
              icon={menuIcon}
              size={26}
              color="#fff"
              onPress={this.props.onLeftTopPress}
            />
          }
          rightComponent={
            <TouchableIcon
              icon={refreshCw}
              size={20}
              color="#fff"
              onPress={this.fetchModules}
            />
          }
          rightContainerStyle={{justifyContent: 'center'}}
        />
        {this.renderContent()}

        <Dialog.Container visible={this.state.dialogVisible}>
          <Dialog.Title>
            {this.state.moduleId ? 'Update Module Name' : 'Create Module'}
          </Dialog.Title>
          <Dialog.Description>Enter name for your module.</Dialog.Description>
          <Dialog.Input
            placeholder="Module Name"
            value={this.state.moduleName}
            style={{borderBottomColor: 'gray', borderBottomWidth: 1}}
            onChangeText={(text) => this.setState({moduleName: text})}
            underlineColorAndroid="grey"
          />
          <Dialog.Button label="Cancel" onPress={this.closeDialog} />
          <Dialog.Button
            label={this.state.moduleId ? 'Update' : 'Create'}
            onPress={this.onDialogButtonPress}
          />
        </Dialog.Container>

        <Dialog.Container visible={this.state.alertVisible}>
          <Dialog.Title>{this.state.alertInfo.title}</Dialog.Title>
          <Dialog.Description>
            {this.state.alertInfo.description}
          </Dialog.Description>
          {this.state.alertInfo.buttons.map((button, i) => {
            return (
              <Dialog.Button
                key={i}
                label={button.text}
                onPress={button.onPress}
              />
            );
          })}
        </Dialog.Container>
        {this.props.isOwner && this.props.premiumAllowed && (
          <>
            <Button
              icon={
                <TouchableIcon icon={plusIcon} color={commonBlue} size={36} />
              }
              containerStyle={styles.FABContainer}
              onPress={() => this.setState({dialogVisible: true})}
              // eslint-disable-next-line react-native/no-inline-styles
              buttonStyle={{backgroundColor: '#ffff'}}
            />

            <View style={styles.bottomView}>
              <Text>
                Used {bytesToGB(this.props.currentClass!.storageUsed)}GB of 20GB
              </Text>
            </View>
          </>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  moduleContainer: {
    borderWidth: 1,
    borderColor: greyWithAlpha(0.5),
    padding: 10,
    backgroundColor: commonBackground,
    marginVertical: 2,
    borderRadius: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moduleText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  iconContainer: {
    flexDirection: 'row',
  },
  promotionText: {
    fontSize: 18,
    padding: 10,
    fontWeight: '800',
    alignSelf: 'center',
  },
  rocket: {
    position: 'relative',
    height: 450,
    width: '100%',
    alignSelf: 'center',
  },
  promotionView: {
    padding: 20,
  },
  bottomView: {
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: commonBackground,
  },
  FABContainer: {
    position: 'absolute',
    height: 60,
    width: 60,
    bottom: 50,
    right: 30,
    backgroundColor: '#ffff',
    borderWidth: 1,
    borderColor: greyWithAlpha(0.3),
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: commonGrey,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 2.62,
    elevation: 4,
  },
});

const mapStateToProps = (state: StoreState) => {
  return {
    currentClass: state.currentClass,
    token: state.token!,
    isOwner: state.currentClass?.owner.username === state.profile.username,
    premiumAllowed: state.currentClass?.planId !== 'free',
    classes: state.classes,
  };
};

export default withRouter(
  connect(mapStateToProps, {registerCurrentClass})(Module),
);
