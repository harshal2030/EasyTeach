import React from 'react';
import axios from 'axios';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableHighlight,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Dialog from 'react-native-dialog';
import {Header, Icon, Button} from 'react-native-elements';
import {CompositeNavigationProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import RBSheet from 'react-native-raw-bottom-sheet';
import SnackBar from 'react-native-snackbar';
import {connect} from 'react-redux';

import {StoreState} from '../../shared/global';
import {Class} from '../../shared/global/actions/classes';

import {RootStackParamList, DrawerParamList} from '../navigators/types';
import {moduleUrl} from '../../shared/utils/urls';
import {ContainerStyles, BottomSheetStyle} from '../../shared/styles/styles';
import {
  commonBlue,
  greyWithAlpha,
  commonBackground,
  commonGrey,
  flatRed,
} from '../../shared/styles/colors';

type navigation = CompositeNavigationProp<
  DrawerNavigationProp<DrawerParamList, 'Modules'>,
  StackNavigationProp<RootStackParamList>
>;

interface Props {
  navigation: navigation;
  currentClass: Class;
  token: string;
  isOwner: boolean;
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
  sheet: RBSheet | null = null;
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
            <Icon
              name="more-horizontal"
              type="feather"
              onPress={() => {
                this.sheet!.open();
                this.setState({moduleId: item.id, moduleName: item.title});
              }}
            />
          )}
        </View>
      </TouchableHighlight>
    );
  };

  confirmDelete = () => {
    this.sheet!.close();
    Alert.alert(
      'Confirm',
      'Are you sure to delete? You will lose all related information.',
      [
        {
          text: 'Cancel',
        },
        {
          text: 'Yes',
          onPress: this.deleteModule,
        },
      ],
    );
  };

  deleteModule = () => {
    axios
      .delete(
        `${moduleUrl}/${this.props.currentClass.id}/${this.state.moduleId}`,
        {
          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
        },
      )
      .then(() => {
        const temp = this.state.modules.filter(
          (val) => val.id !== this.state.moduleId,
        );
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

  closeDialog = () => {
    this.setState({dialogVisible: false});
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

  renderContent = () => {
    const {loading, errored, modules} = this.state;

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

        {this.props.isOwner && (
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
        )}

        <RBSheet
          height={140}
          ref={(ref) => (this.sheet = ref)}
          closeOnPressMask
          closeOnDragDown
          customStyles={{
            container: BottomSheetStyle.container,
          }}>
          <View>
            <TouchableOpacity
              style={BottomSheetStyle.RBOptionContainer}
              onPress={() => {
                this.setState({dialogVisible: true});
                this.sheet!.close();
              }}>
              <MCI name="pencil" color="#000" size={24} />
              <Text style={BottomSheetStyle.RBTextStyle}>Edit Name</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={BottomSheetStyle.RBOptionContainer}
              onPress={this.confirmDelete}>
              <MCI name="delete-outline" color={flatRed} size={24} />
              <Text style={[BottomSheetStyle.RBTextStyle, {color: flatRed}]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </RBSheet>
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
  },
  moduleText: {
    fontWeight: 'bold',
    fontSize: 16,
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
  };
};

export default connect(mapStateToProps)(Module);
