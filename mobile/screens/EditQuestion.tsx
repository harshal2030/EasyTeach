import React from 'react';
import axios from 'axios';
import {View, Text, ActivityIndicator, StyleSheet, Alert} from 'react-native';
import {Header} from 'react-native-elements';
import {connect} from 'react-redux';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import ViewPager from '@react-native-community/viewpager';

import {QuestionCard} from '../components/main';

import {StoreState} from '../global';
import {Class} from '../global/actions/classes';

import {RootStackParamList} from '../navigators/types';
import {questionUrl} from '../utils/urls';
import {ContainerStyles} from '../styles/styles';
import {commonBackground, commonBlue} from '../styles/colors';

interface Props {
  navigation: StackNavigationProp<RootStackParamList, 'EditQuestion'>;
  route: RouteProp<RootStackParamList, 'EditQuestion'>;
  currentClass: Class;
  token: string;
}

type Questions = {
  question: string;
  options: string[];
  queId: string;
  score: number;
  attachments: string;
};

interface State {
  loading: boolean;
  errored: boolean;
  questions: Questions[];
  page: number;
  photo: {
    uri: string;
    type: string;
  };
}

class EditQuestion extends React.Component<Props, State> {
  pager: ViewPager | null = null;
  constructor(props: Props) {
    super(props);

    this.state = {
      questions: [],
      loading: true,
      errored: false,
      page: 0,
      photo: {
        uri: 'none',
        type: 'image/png',
      },
    };
  }

  componentDidMount() {
    this.fetchQues();
  }

  fetchQues = () => {
    this.setState({loading: true});
    const {currentClass, route, token} = this.props;
    axios
      .get<Questions[]>(
        `${questionUrl}/${currentClass.id}/${route.params.quizId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page: this.state.page,
          },
        },
      )
      .then((res) => {
        if (res.data.length === 0) {
          this.setState({loading: false, page: this.state.page - 1});
          return Alert.alert('', 'No more question remaining.');
        }
        this.setState({questions: res.data, loading: false}, () =>
          this.pager!.setPage(0),
        );
      })
      .catch(() => this.setState({loading: false, errored: true}));
  };

  onLoadNextPress = () => {
    this.setState({page: this.state.page + 1}, this.fetchQues);
  };

  renderContent = () => {
    const {errored, loading, questions, page} = this.state;

    if (errored) {
      return (
        <View style={ContainerStyles.centerElements}>
          <Text>
            We're having trouble in connecting to service. Please consider
            checking your network or try again
          </Text>
        </View>
      );
    }

    if (loading) {
      return (
        <View style={ContainerStyles.centerElements}>
          <ActivityIndicator color={commonBlue} animating size="large" />
        </View>
      );
    }

    const queNo = 10 * page + questions.length;

    return (
      // eslint-disable-next-line react-native/no-inline-styles
      <ViewPager
        initialPage={0}
        style={{flex: 1}}
        ref={(ref) => (this.pager = ref)}>
        {questions.map((que, i) => {
          return (
            <View collapsable={false} key={i} style={styles.queContainer}>
              <QuestionCard
                question={que}
                showPrevButton={page !== 0 && i === 0}
                onPrevPress={() =>
                  this.setState({page: page - 1}, this.fetchQues)
                }
                totalQues={queNo}
                queNo={page * 10 + i + 1}
                classId={this.props.currentClass.id}
                quizId={this.props.route.params.quizId}
                token={this.props.token}
                onLoadNextPress={() =>
                  this.setState({page: this.state.page + 1}, this.fetchQues)
                }
              />
            </View>
          );
        })}
      </ViewPager>
    );
  };

  render() {
    return (
      <View style={{flex: 1}}>
        <Header
          centerComponent={{
            text: 'Edit Questions',
            style: {fontSize: 24, color: '#fff', fontWeight: '600'},
          }}
          leftComponent={{
            icon: 'arrow-back',
            color: '#ffff',
            size: 26,
            onPress: () => this.props.navigation.goBack(),
          }}
        />

        {this.renderContent()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  queContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: commonBackground,
  },
});

const mapStateToProps = (state: StoreState) => {
  return {
    token: state.token!,
    currentClass: state.currentClass!,
  };
};

export default connect(mapStateToProps)(EditQuestion);
