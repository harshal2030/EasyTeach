import React from 'react';
import axios from 'axios';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableHighlight,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {Header, Button, Icon} from 'react-native-elements';
import {CompositeNavigationProp} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {StackNavigationProp} from '@react-navigation/stack';
import {connect} from 'react-redux';
import Dialog from 'react-native-dialog';
import SnackBar from 'react-native-snackbar';
import RBSheet from 'react-native-raw-bottom-sheet';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {StoreState} from '../global';
import {Class} from '../global/actions/classes';

import {DrawerParamList, RootStackParamList} from '../navigators/types';
import {
  commonGrey,
  commonBackground,
  greyWithAlpha,
  flatRed,
  commonBlue,
} from '../styles/colors';
import {ContainerStyles} from '../styles/styles';
import {moduleUrl} from '../utils/urls';

type NavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DrawerParamList, 'Manage'>,
  StackNavigationProp<RootStackParamList>
>;

interface Props {
  navigation: NavigationProp;
  currentClass: Class;
  token: string;
  profile: {
    avatar: string;
    name: string;
    username: string;
  };
}

interface State {
  dialogVisible: boolean;
  blocks: {id: string; title: string}[];
  moduleName: string;
  loading: boolean;
  errored: boolean;
}

class Resource extends React.Component<Props, State> {
  isOwner: boolean =
    this.props.profile.username === this.props.currentClass.owner.username;
  sheet: RBSheet | null = null;
  constructor(props: Props) {
    super(props);

    this.state = {
      dialogVisible: false,
      blocks: [],
      moduleName: '',
      loading: true,
      errored: false,
    };
  }

  componentDidMount() {
    this.loadBlocks();
  }

  componentDidUpdate(prevProps: Props) {
    this.isOwner =
      this.props.profile.username === this.props.currentClass.owner.username;
    if (prevProps.currentClass.id !== this.props.currentClass.id) {
      this.loadBlocks();
      this.isOwner =
        this.props.profile.username === this.props.currentClass.owner.username;
    }
  }

  loadBlocks = () => {
    this.setState({loading: true});
    axios
      .get<{id: string; title: string; classId: string}[]>(
        `${moduleUrl}/${this.props.currentClass.id}`,
        {
          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
        },
      )
      .then((res) => {
        const blocks = res.data.map((val) => ({title: val.title, id: val.id}));
        this.setState({blocks, loading: false});
      })
      .catch(() => this.setState({loading: false, errored: true}));
  };

  addModule = () => {
    axios
      .post<{id: string; title: string; classId: string}>(
        `${moduleUrl}/${this.props.currentClass.id}`,
        {title: this.state.moduleName},
        {
          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
        },
      )
      .then((res) => {
        this.setState({
          blocks: [
            {id: res.data.id, title: res.data.title},
            ...this.state.blocks,
          ],
          dialogVisible: false,
          moduleName: '',
        });
      })
      .catch(() => {
        SnackBar.show({
          text: 'Unable to create module.',
          duration: SnackBar.LENGTH_SHORT,
          backgroundColor: flatRed,
        });
      });
  };

  renderBlock = ({item}: {item: {id: string; title: string}}) => {
    return (
      <TouchableHighlight
        underlayColor={greyWithAlpha(0.4)}
        onPress={() => console.log(item.id)}>
        <View style={styles.moduleContainer}>
          <Text style={{fontWeight: 'bold', fontSize: 16}}>{item.title}</Text>
          {this.isOwner && (
            <Icon
              name="more-horizontal"
              type="feather"
              onPress={() => this.sheet!.open()}
            />
          )}
        </View>
      </TouchableHighlight>
    );
  };

  renderContent = () => {
    const {loading, errored, blocks} = this.state;

    if (loading) {
      return (
        <View style={ContainerStyles.centerElements}>
          <ActivityIndicator color={commonBlue} animating />
        </View>
      );
    }

    if (errored) {
      return (
        <View style={ContainerStyles.centerElements}>
          <Text>Unable to fetch modules. please try again later</Text>
        </View>
      );
    }

    if (blocks.length === 0) {
      return (
        <View style={ContainerStyles.centerElements}>
          <Text>Wow! such empty.</Text>
        </View>
      );
    }

    return (
      <>
        <Dialog.Container
          visible={this.state.dialogVisible}
          onBackdropPress={() =>
            this.setState({dialogVisible: false, moduleName: ''})
          }
          onBackButtonPress={() =>
            this.setState({dialogVisible: false, moduleName: ''})
          }>
          <Dialog.Title>Module Name</Dialog.Title>
          <Dialog.Input
            underlineColorAndroid={commonGrey}
            value={this.state.moduleName}
            onChangeText={(text) => this.setState({moduleName: text})}
          />
          <Dialog.Button
            label="Cancel"
            onPress={() =>
              this.setState({dialogVisible: false, moduleName: ''})
            }
          />
          <Dialog.Button label="Create" onPress={this.addModule} />
        </Dialog.Container>

        <FlatList
          data={this.state.blocks}
          keyExtractor={(_item, i) => i.toString()}
          renderItem={this.renderBlock}
          style={{padding: 5}}
        />
      </>
    );
  };

  render() {
    return (
      // eslint-disable-next-line react-native/no-inline-styles
      <View style={[ContainerStyles.parent, {backgroundColor: '#ffff'}]}>
        <Header
          centerComponent={{
            text: 'Resources',
            style: {fontSize: 24, color: '#fff', fontWeight: '600'},
          }}
          leftComponent={{
            icon: 'menu',
            color: '#ffff',
            size: 26,
            onPress: () => this.props.navigation.openDrawer(),
          }}
        />
        {this.renderContent()}

        {this.isOwner && (
          <View style={{padding: 10}}>
            <Button
              title="Add Module"
              icon={{name: 'plus', type: 'font-awesome', color: '#fff'}}
              onPress={() => this.setState({dialogVisible: true})}
            />
          </View>
        )}

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
            <TouchableOpacity style={styles.RBOptionContainer}>
              <MaterialIcons name="edit" color="#000" size={24} />
              <Text style={styles.RBTextStyle}>Change Name</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.RBOptionContainer}>
              <MaterialIcons name="delete" color={flatRed} size={24} />
              <Text style={[styles.RBTextStyle, {color: flatRed}]}>
                Delete Module
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
    currentClass: state.currentClass!,
    token: state.token!,
    profile: state.profile,
  };
};

export default connect(mapStateToProps)(Resource);
