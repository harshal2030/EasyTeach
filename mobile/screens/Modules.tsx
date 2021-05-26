import React from 'react';
import axios from 'axios';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableHighlight,
  StyleSheet,
  Alert,
} from 'react-native';
import Dialog from 'react-native-dialog';
import {Header, Icon, Button} from 'react-native-elements';
import {CompositeNavigationProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import SnackBar from 'react-native-snackbar';
import {connect} from 'react-redux';
import LottieView from 'lottie-react-native';

import {StoreState} from '../../shared/global';
import {Class} from '../../shared/global/actions/classes';

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
  StackNavigationProp<RootStackParamList>
>;

interface Props {
  navigation: navigation;
  currentClass: Class;
  token: string;
  isOwner: boolean;
  premiumAllowed: boolean;
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
    };
  }

  componentDidMount() {
    this.fetchModules();
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.currentClass!.id !== this.props.currentClass!.id) {
      this.fetchModules();
    }
  }

  fetchModules = async () => {
    try {
      this.setState({loading: true});
      const res = await axios.get<ModuleRes[]>(
        `${moduleUrl}/${this.props.currentClass.id}`,
        {
          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
        },
      );

      this.setState({loading: false, modules: res.data});
    } catch (e) {
      console.log(e);
      this.setState({loading: false, errored: true});
    }
  };

  confirmDelete = (id: string) => {
    const deleteModule = () => {
      axios
        .delete(`${moduleUrl}/${this.props.currentClass.id}/${id}`, {
          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
        })
        .then(() => {
          const temp = this.state.modules.filter((val) => val.id !== id);
          this.setState({modules: temp, moduleId: null});
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
      Alert.alert('Oops!', 'Something went wrong. Please try again later');
    }
  };

  updateModule = async () => {
    try {
      this.closeDialog();

      const res = await axios.put<ModuleRes>(
        `${moduleUrl}/${this.props.currentClass.id}/${this.state.moduleId}`,
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
    const {loading, errored, modules} = this.state;

    if (!this.props.premiumAllowed) {
      return (
        <View style={styles.promotionView}>
          <Text style={styles.promotionText}>
            {this.props.isOwner
              ? 'Upgrade your class to unlock video lessons.'
              : 'Ask class owner to unlock video lessons'}
          </Text>
          <LottieView
            source={require('../../shared/images/rocket.json')}
            autoPlay
            style={styles.rocket}
            loop
          />
          {this.props.isOwner && (
            <Button
              title="Upgrade Now"
              onPress={() => this.props.navigation.navigate('Checkout')}
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
          leftComponent={{
            icon: 'menu',
            color: '#ffff',
            size: 26,
            onPress: () => this.props.navigation.openDrawer(),
          }}
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
                Used {bytesToGB(this.props.currentClass.storageUsed)}GB of 20GB
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
    currentClass: state.currentClass!,
    token: state.token!,
    isOwner: state.currentClass!.owner.username === state.profile.username,
    premiumAllowed: state.currentClass!.planId !== 'free',
  };
};

export default connect(mapStateToProps)(Module);
