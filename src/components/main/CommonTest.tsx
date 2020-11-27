import React from 'react';
import {View, ActivityIndicator, FlatList, StyleSheet} from 'react-native';
import {Text, Header, Button} from 'react-native-elements';
import Octicons from 'react-native-vector-icons/Octicons';
import DocumentPicker from 'react-native-document-picker';
import SnackBar from 'react-native-snackbar';
import Modal from 'react-native-modal';
import {CompositeNavigationProp} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {StackNavigationProp} from '@react-navigation/stack';

import {ImportExcel} from './ImportExcel';

import {
  BottomTabTestParamList,
  DrawerParamList,
  RootStackParamList,
} from '../../navigators/types';
import {ContainerStyles} from '../../styles/styles';
import {commonBlue, commonGrey} from '../../styles/colors';
import {QuizRes} from '../../global/actions/quiz';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabTestParamList, 'TestHome'>,
  CompositeNavigationProp<
    DrawerNavigationProp<DrawerParamList>,
    StackNavigationProp<RootStackParamList>
  >
>;

interface Props {
  navigation: NavigationProp;
  user: string;
  currentClassOwner: string;
  dataErrored: boolean;
  dataLoading: boolean;
  data: QuizRes[];
  headerText: string;
  renderItem({item, index}: {item: QuizRes; index: number}): JSX.Element;
}

interface State {
  modalVisible: boolean;
}

class CommonTest extends React.Component<Props, State> {
  isOwner: boolean = false;
  constructor(props: Props) {
    super(props);

    this.state = {
      modalVisible: false,
    };
  }

  componentDidUpdate() {
    this.isOwner = this.props.currentClassOwner === this.props.user;
  }

  renderContent = () => {
    const {dataErrored, dataLoading, data} = this.props;

    if (dataErrored) {
      return (
        <Text>
          We're having trouble fetching latest data for you. Please try again
          later
        </Text>
      );
    }

    if (dataLoading) {
      return <ActivityIndicator color={commonBlue} size="large" animating />;
    }

    if (data.length === 0) {
      return <Text>Nothing to show here right now</Text>;
    }

    return (
      <FlatList
        data={data}
        style={{width: '100%'}}
        keyExtractor={(_item, i) => i.toString()}
        renderItem={this.props.renderItem}
        ListFooterComponent={<View style={{marginVertical: 15}} />}
      />
    );
  };

  ImportSheet = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      this.setState({modalVisible: false});
      this.props.navigation.navigate('CreateTest', {
        file: {
          name: res.name,
          type: res.type,
          uri: res.uri,
        },
      });
    } catch (e) {
      if (!DocumentPicker.isCancel(e)) {
        SnackBar.show({
          text: 'Unable to get the sheet.',
          duration: SnackBar.LENGTH_SHORT,
        });
      }
    }
  };

  render() {
    return (
      <View style={[ContainerStyles.parent, {backgroundColor: '#ffff'}]}>
        <Header
          centerComponent={{
            text: this.props.headerText,
            style: {fontSize: 24, color: '#fff', fontWeight: '600'},
          }}
          leftComponent={{
            icon: 'menu',
            color: '#ffff',
            size: 26,
            onPress: () => this.props.navigation.openDrawer(),
          }}
        />

        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          {this.renderContent()}
        </View>

        {this.isOwner && (
          <Button
            icon={<Octicons name="plus" size={26} color={commonBlue} />}
            containerStyle={styles.FABContainer}
            // eslint-disable-next-line react-native/no-inline-styles
            buttonStyle={{backgroundColor: '#ffff'}}
            onPress={() => this.setState({modalVisible: true})}
          />
        )}
        <Modal
          isVisible={this.state.modalVisible}
          animationIn="slideInLeft"
          animationOut="slideOutLeft"
          onBackButtonPress={() => this.setState({modalVisible: false})}
          // eslint-disable-next-line react-native/no-inline-styles
          style={{margin: 0}}>
          <ImportExcel
            onBackPress={() => this.setState({modalVisible: false})}
            onImportPress={this.ImportSheet}
          />
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  FABContainer: {
    position: 'absolute',
    height: 60,
    width: 60,
    bottom: 10,
    right: 10,
    padding: 10,
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

export {CommonTest};