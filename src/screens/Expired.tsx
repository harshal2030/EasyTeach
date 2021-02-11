import React from 'react';
import axios from 'axios';
import {View, Pressable, Text, StyleSheet} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {connect} from 'react-redux';
import {CompositeNavigationProp} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import SnackBar from 'react-native-snackbar';

import {CommonTest} from '../components/main';
import {Card} from '../components/common';

import {StoreState} from '../global';
import {Class} from '../global/actions/classes';
import {QuizRes} from '../global/actions/quiz';

import {quizUrl} from '../utils/urls';
import {
  RootStackParamList,
  DrawerParamList,
  BottomTabTestParamList,
} from '../navigators/types';
import {flatRed, greyWithAlpha} from '../styles/colors';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabTestParamList, 'TestHome'>,
  CompositeNavigationProp<
    DrawerNavigationProp<DrawerParamList>,
    StackNavigationProp<RootStackParamList>
  >
>;

interface Props {
  token: string | null;
  currentClass: Class | null;
  profile: {
    name: string;
    username: string;
    avatar: string;
  };
  navigation: NavigationProp;
  isOwner: boolean;
}

interface State {
  loading: boolean;
  errored: boolean;
  data: QuizRes[];
}

class Expired extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loading: true,
      errored: false,
      data: [],
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.currentClass?.id !== this.props.currentClass?.id) {
      this.fetchData();
    }
  }

  fetchData = () => {
    axios
      .get<{expired: QuizRes[]}>(`${quizUrl}/${this.props.currentClass!.id}`, {
        headers: {
          Authorization: `Bearer ${this.props.token}`,
        },
        params: {
          return: 'expired',
        },
      })
      .then((res) => {
        this.setState({
          data: res.data.expired,
          loading: false,
        });
      })
      .catch(() => {
        this.setState({
          loading: false,
          errored: true,
        });
      });
  };

  renderItem = ({item}: {item: QuizRes}) => {
    return (
      <Card
        title={item.title}
        containerStyle={{margin: 10}}
        expiresOn={new Date(item.timePeriod[1].value)}
        onPress={() =>
          SnackBar.show({
            text: 'This test has expired.',
            duration: SnackBar.LENGTH_SHORT,
            backgroundColor: flatRed,
          })
        }
        collapseComponent={
          this.props.isOwner ? (
            <View style={styles.collapseContainer}>
              <Pressable
                style={styles.collapseButton}
                onPress={() =>
                  this.props.navigation.navigate('CreateTest', {
                    quizId: item.quizId,
                  })
                }>
                <Text style={styles.collapseText}>Edit</Text>
              </Pressable>
              <Pressable
                style={styles.collapseButton}
                onPress={() =>
                  this.props.navigation.navigate('EditQuestion', {
                    quizId: item.quizId,
                  })
                }>
                <Text style={styles.collapseText}>Edit Questions</Text>
              </Pressable>
            </View>
          ) : null
        }
      />
    );
  };

  render() {
    const {navigation} = this.props;
    const {loading, errored, data} = this.state;
    return (
      <CommonTest
        navigation={navigation}
        dataLoading={loading}
        dataErrored={errored}
        renderItem={this.renderItem}
        data={data}
        headerText="Expired"
        isOwner={this.props.isOwner}
      />
    );
  }
}

const styles = StyleSheet.create({
  collapseContainer: {
    marginLeft: 30,
    flexDirection: 'row',
  },
  collapseButton: {
    marginHorizontal: 5,
    padding: 3,
    marginTop: 5,
    borderWidth: 1,
    borderColor: greyWithAlpha(0.8),
    backgroundColor: greyWithAlpha(0.2),
    borderRadius: 2,
  },
  collapseText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#003',
  },
});

const mapStateToProps = (state: StoreState) => {
  return {
    token: state.token,
    profile: state.profile,
    currentClass: state.currentClass,
    isOwner: state.currentClass!.owner.username === state.profile.username,
  };
};

export default connect(mapStateToProps)(Expired);
