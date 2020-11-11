import React from 'react';
import axios from 'axios';
import {StyleSheet, View, SectionList, ActivityIndicator} from 'react-native';
import {Header, Button, Text} from 'react-native-elements';
import {StackNavigationProp} from '@react-navigation/stack';
import {CompositeNavigationProp, RouteProp} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {connect} from 'react-redux';
import Octicons from 'react-native-vector-icons/Octicons';
import DocumentPicker from 'react-native-document-picker';
import SnackBar from 'react-native-snackbar';
import Modal from 'react-native-modal';

import {Card} from '../components/common';
import {ImportExcel} from '../components/main';

import {StoreState} from '../global';
import {Class} from '../global/actions/classes';
import {
  RootStackParamList,
  DrawerParamList,
  BottomTabTestParamList,
} from '../navigators/types';
import {commonBlue, commonGrey} from '../styles/colors';
import {ContainerStyles} from '../styles/styles';
import {quizUrl} from '../utils/urls';
import {QuizRes} from '../utils/API';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabTestParamList, 'TestHome'>,
  CompositeNavigationProp<
    DrawerNavigationProp<DrawerParamList>,
    StackNavigationProp<RootStackParamList>
  >
>;

type TestRouteProp = RouteProp<BottomTabTestParamList, 'TestHome'>;

interface Props {
  token: string | null;
  navigation: NavigationProp;
  profile: {name: string; username: string; avatar: string};
  currentClass: Class | null;
  route: TestRouteProp;
}

type QuizData = [
  {title: 'Live'; data: QuizRes[]},
  {title: 'Expired'; data: QuizRes[]},
];

interface State {
  quizzes: QuizData;
  loading: boolean;
  errored: boolean;
  modalVisible: boolean;
}

class Test extends React.Component<Props, State> {
  isOwner: boolean = false;
  subscribe: (() => void) | undefined;
  constructor(props: Props) {
    super(props);

    this.state = {
      quizzes: [
        {title: 'Live', data: []},
        {title: 'Expired', data: []},
      ],
      loading: true,
      errored: false,
      modalVisible: false,
    };

    if (props.currentClass) {
      this.isOwner =
        props.currentClass.owner.username === props.profile.username;
    }
  }

  componentDidMount() {
    if (this.props.currentClass) {
      this.fetchData();
    }

    this.subscribe = this.props.navigation.addListener(
      'focus',
      this.updateDataOnFocus,
    );
  }

  componentWillUnmount() {
    this.subscribe!();
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.currentClass?.id !== this.props.currentClass?.id) {
      this.fetchData();
      this.isOwner =
        this.props.currentClass?.owner.username === this.props.profile.username;
    }
  }

  updateDataOnFocus = () => {
    if (this.props.route.params) {
      const data: QuizData = [...this.state.quizzes];
      const testExists = data[0].data.findIndex(
        (val) => val.quizId === this.props.route.params!.quizId,
      );
      if (testExists === -1) {
        data[0].data = [this.props.route.params, ...data[0].data];
        this.setState({quizzes: data});
      }
    }
  };

  fetchData = () => {
    axios
      .get<{live: QuizRes[]; expired: QuizRes[]}>(
        `${quizUrl}/${this.props.currentClass!.id}`,
        {
          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
        },
      )
      .then((res) => {
        const data: QuizData = [
          {title: 'Live', data: res.data.live},
          {title: 'Expired', data: res.data.expired},
        ];
        this.setState({quizzes: data, loading: false});
      })
      .catch(() => this.setState({errored: true, loading: false}));
  };

  renderItem = ({item}: {item: QuizRes}) => {
    return (
      <Card
        title={item.title}
        containerStyle={{margin: 10}}
        expiresOn={new Date(item.timePeriod[1].value)}
        rightComponent={
          <Octicons
            name="gear"
            size={16}
            onPress={() =>
              this.props.navigation.navigate('CreateTest', {
                quizId: item.quizId,
              })
            }
          />
        }
      />
    );
  };

  renderContent = () => {
    const {errored, loading, quizzes} = this.state;

    if (errored) {
      return (
        <Text>
          We're having trouble fetching latest data for you. Please try again
          later
        </Text>
      );
    }

    if (loading) {
      return <ActivityIndicator color={commonBlue} size="large" animating />;
    }

    if (quizzes[0].data.length === 0 && quizzes[1].data.length === 0) {
      return <Text>Nothing to show here right now</Text>;
    }

    return (
      <SectionList
        sections={quizzes}
        style={{width: '100%'}}
        stickySectionHeadersEnabled
        keyExtractor={(_item, i) => i.toString()}
        renderItem={this.renderItem}
        renderSectionHeader={({section: {title}}) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
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
            text: 'Test',
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
          onBackButtonPress={() => this.props.navigation.goBack()}
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
  sectionHeader: {
    fontSize: 24,
    fontWeight: '700',
    width: '100%',
    backgroundColor: '#ffff',
    padding: 10,
    color: commonGrey,
    borderBottomColor: commonGrey,
    borderBottomWidth: 1,
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
    token: state.token,
    profile: state.profile,
    currentClass: state.currentClass,
  };
};

export default connect(mapStateToProps)(Test);
