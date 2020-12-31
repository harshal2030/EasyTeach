import React from 'react';
import {View} from 'react-native';
import {Header} from 'react-native-elements';
import {CompositeNavigationProp} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {StackNavigationProp} from '@react-navigation/stack';
import Dialog from 'react-native-dialog';

import {DrawerParamList, RootStackParamList} from '../navigators/types';
import {commonGrey} from '../styles/colors';

type NavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DrawerParamList, 'Manage'>,
  StackNavigationProp<RootStackParamList>
>;

interface Props {
  navigation: NavigationProp;
}

interface State {
  modalVisible: boolean;
}

class Resource extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      modalVisible: true,
    };
  }

  render() {
    return (
      <View>
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

        <Dialog.Container visible={this.state.modalVisible}>
          <Dialog.Title>Module Name</Dialog.Title>
          <Dialog.Input underlineColorAndroid={commonGrey} autoFocus={true} />
          <Dialog.Button
            label="Cancel"
            onPress={() => this.setState({modalVisible: false})}
          />
          <Dialog.Button label="Create" onPress={() => null} />
        </Dialog.Container>
      </View>
    );
  }
}

export default Resource;
