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
  Alert,
} from 'react-native';
import Image from 'react-native-fast-image';
import Dialog from 'react-native-dialog';
import {Header, Icon, Button} from 'react-native-elements';
import {CompositeNavigationProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import SnackBar from 'react-native-snackbar';
import {connect} from 'react-redux';

import {HeaderBadge} from '../../shared/components/common';

import {StoreState} from '../../shared/global';
import {Class} from '../../shared/global/actions/classes';
import {
  fetchModules,
  ModulePayload,
  Module as ModuleRes,
  addModule,
  updateModule,
  removeModule,
} from '../../shared/global/actions/modules';

import {RootStackParamList, DrawerParamList} from '../navigators/types';
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

type navigation = CompositeNavigationProp<
  DrawerNavigationProp<DrawerParamList, 'Modules'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface Props {
  navigation: navigation;
  currentClass: Class | null;
  token: string;
  isOwner: boolean;
  premiumAllowed: boolean;
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
}

class Module extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      dialogVisible: false,
      moduleName: '',
      moduleId: null,
    };
  }

  componentDidMount() {
    if (this.props.premiumAllowed) {
      this.props.fetchModules(this.props.currentClass!.id);
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (
      prevProps.currentClass?.id === this.props.currentClass?.id &&
      this.props.premiumAllowed !== prevProps.premiumAllowed
    ) {
      this.props.fetchModules(this.props.currentClass!.id);
      return;
    }

    if (prevProps.currentClass?.id !== this.props.currentClass?.id) {
      this.props.fetchModules(this.props.currentClass!.id);
    }
  }

  fetchModules = () => this.props.fetchModules(this.props.currentClass!.id);

  confirmDelete = (id: string) => {
    const deleteModule = () => {
      axios
        .delete(`${moduleUrl}/${this.props.currentClass?.id}/${id}`, {
          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
        })
        .then(() => {
          this.props.removeModule(id, this.props.currentClass!.id);
          this.setState({moduleId: null});
        })
        .catch(() => {
          SnackBar.show({
            text: 'Unable to delete module. Please try again later',
            backgroundColor: flatRed,
            textColor: '#fff',
            duration: SnackBar.LENGTH_LONG,
          });
        });
    };

    Alert.alert(
      'Confirm',
      'Are you sure to delete? You will lose all related information.',
      [
        {
          text: 'Cancel',
        },
        {
          text: 'Yes',
          onPress: deleteModule,
        },
      ],
    );
  };

  closeDialog = () => {
    this.setState({dialogVisible: false, moduleId: null, moduleName: ''});
  };

  createModule = async () => {
    try {
      const res = await axios.post<ModuleRes>(
        `${moduleUrl}/${this.props.currentClass!.id}`,
        {title: this.state.moduleName},
        {
          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
        },
      );

      this.closeDialog();
      this.props.addModule(res.data, this.props.currentClass!.id);
      this.setState({
        moduleName: '',
      });
    } catch (e) {
      Alert.alert('Oops!', 'Something went wrong. Please try again later');
    }
  };

  updateModule = async () => {
    try {
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

      this.closeDialog();
      this.props.updateModule(res.data, this.props.currentClass!.id);
      this.setState({moduleId: null, moduleName: ''});
    } catch (e) {
      this.setState({moduleId: null, moduleName: ''});
      SnackBar.show({
        text: 'Unable to update. Please try again later',
        backgroundColor: flatRed,
        duration: SnackBar.LENGTH_LONG,
        textColor: '#ffff',
      });
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
          this.props.navigation.navigate('Files', {moduleId: item.id})
        }>
        <View style={styles.moduleContainer}>
          <Text style={styles.moduleText}>{item.title}</Text>
          {this.props.isOwner && (
            <View style={styles.iconContainer}>
              <Icon
                name="pencil"
                tvParallaxProperties
                type="material-community"
                color="#000"
                onPress={() =>
                  this.setState({
                    moduleId: item.id,
                    moduleName: item.title,
                    dialogVisible: true,
                  })
                }
              />
              <Icon
                name="delete-outline"
                tvParallaxProperties
                type="material-community"
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
      upgradeText = 'Upgrade to unlock full potential to your space';
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
              onPress={() => this.props.navigation.navigate('Checkout')}
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
              <Icon
                name="menu"
                tvParallaxProperties
                size={26}
                onPress={this.props.navigation.openDrawer}
                color="#ffff"
              />
              {this.props.unread !== 0 ? <HeaderBadge /> : null}
            </>
          }
          rightComponent={{
            icon: 'refresh-ccw',
            type: 'feather',
            size: 20,
            onPress: this.fetchModules,
            color: '#ffff',
          }}
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
            onChangeText={(text) => this.setState({moduleName: text})}
            underlineColorAndroid="grey"
          />
          <Dialog.Button label="Cancel" onPress={this.closeDialog} />
          <Dialog.Button
            label={this.state.moduleId ? 'Update' : 'Create'}
            onPress={this.onDialogButtonPress}
          />
        </Dialog.Container>

        {this.props.isOwner && this.props.premiumAllowed && (
          <>
            <Button
              icon={{
                name: 'plus',
                type: 'octicon',
                color: commonBlue,
              }}
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
    bottom: 30,
    right: 30,
    backgroundColor: '#ffff',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: commonGrey,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
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
    unread: state.unreads.totalUnread,
    modules: state.modules[state.currentClass?.id || 'test'] || {
      loading: true,
      errored: false,
      modules: [],
    },
  };
};

export default connect(mapStateToProps, {
  fetchModules,
  removeModule,
  addModule,
  updateModule,
})(Module);
