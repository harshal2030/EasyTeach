import React from 'react';
import axios from 'axios';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableHighlight,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import Dialog from 'react-native-dialog';
import {Header, Button} from 'react-native-elements';
import {connect} from 'react-redux';
import {toast} from 'react-toastify';
import {withRouter, RouteComponentProps} from 'react-router-dom';
import pencilIcon from '@iconify-icons/mdi/pencil';
import deleteIcon from '@iconify-icons/mdi/delete-outline';
import menuIcon from '@iconify-icons/ic/menu';
import refreshCw from '@iconify-icons/feather/refresh-ccw';
import plusIcon from '@iconify-icons/ic/baseline-plus';

import {TouchableIcon} from '../components';
import {HeaderBadge} from '../../shared/components/common';

import {StoreState} from '../../shared/global';
import {Class, registerCurrentClass} from '../../shared/global/actions/classes';
import {
  fetchModules,
  ModulePayload,
  Module as ModuleRes,
  addModule,
  updateModule,
  removeModule,
} from '../../shared/global/actions/modules';

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
  unread: number;
  modules: ModulePayload;
  fetchModules: (classId: string) => void;
  addModule: typeof addModule;
  updateModule: typeof updateModule;
  removeModule: typeof removeModule;
}

interface State {
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
      this.props.fetchModules(classFound!.id);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const {classId} = this.props.match.params;
    if (
      prevProps.currentClass?.id === this.props.currentClass?.id &&
      this.props.premiumAllowed !== prevProps.premiumAllowed
    ) {
      this.props.fetchModules(classId);
      return;
    }

    if (prevProps.currentClass?.id !== this.props.currentClass?.id) {
      this.props.fetchModules(classId);
    }
  }

  fetchModules = () => {
    this.props.fetchModules(this.props.match.params.classId);
  };

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
          this.props.removeModule(id, this.props.match.params.classId);
          this.setState({moduleId: null});
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

      this.props.addModule(res.data, this.props.match.params.classId);
      this.setState({
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

      this.props.updateModule(res.data, this.props.match.params.classId);
      this.setState({moduleName: ''});
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
    const {loading, errored, modules} = this.props.modules;
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
        <ScrollView style={ContainerStyles.padder}>
          <Text style={styles.promoBigText}>Video lessons</Text>
          <Text style={styles.promoInfoText}>
            Engage with others with videos and PDFs with our free analytics
            services
          </Text>

          <Image
            source={require('../../shared/images/mock.jpg')}
            style={styles.promoImage}
            resizeMode="contain"
          />

          <Text style={styles.promoUpgradeText}>{upgradeText}</Text>

          {this.props.isOwner && (
            <Button
              title="Upgrade Now"
              onPress={() =>
                this.props.history.push(
                  `/checkout/${this.props.match.params.classId}`,
                )
              }
              containerStyle={styles.upgradeButton}
            />
          )}
        </ScrollView>
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
            <>
              <TouchableIcon
                icon={menuIcon}
                size={26}
                color="#fff"
                onPress={this.props.onLeftTopPress}
              />
              {this.props.unread !== 0 ? <HeaderBadge /> : null}
            </>
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
  promoBigText: {
    color: '#2089dc',
    fontSize: 50,
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  promoInfoText: {
    color: '#2089dc',
    fontSize: 20,
    alignSelf: 'center',
  },
  promoImage: {
    height: 200,
    width: '100%',
    marginVertical: 20,
  },
  promoUpgradeText: {
    alignSelf: 'center',
    fontSize: 20,
  },
  upgradeButton: {
    marginHorizontal: 10,
    marginTop: 30,
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
    classes: state.classes.classes,
    unread: state.unreads.totalUnread,
    modules: state.modules[state.currentClass?.id || 'test'] || {
      loading: true,
      errored: false,
      modules: [],
    },
  };
};

export default withRouter(
  connect(mapStateToProps, {
    registerCurrentClass,
    fetchModules,
    removeModule,
    addModule,
    updateModule,
  })(Module),
);
