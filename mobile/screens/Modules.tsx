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
import {connect} from 'react-redux';

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
        onPress={() => console.log('hii')}>
        <View style={styles.moduleContainer}>
          <Text style={styles.moduleText}>{item.title}</Text>
          {this.props.isOwner && <Icon name="more-horizontal" type="feather" />}
        </View>
      </TouchableHighlight>
    );
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
          <Dialog.Title>Create Module</Dialog.Title>
          <Dialog.Description>Enter name for your module.</Dialog.Description>
          <Dialog.Input
            placeholder="Module Name"
            onChangeText={(text) => this.setState({moduleName: text})}
            underlineColorAndroid="green"
          />
          <Dialog.Button label="Cancel" onPress={this.closeDialog} />
          <Dialog.Button label="Create" onPress={this.createModule} />
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
