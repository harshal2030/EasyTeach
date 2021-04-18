import React from 'react';
import axios from 'axios';
import {View, Text, ActivityIndicator, FlatList} from 'react-native';
import {Header} from 'react-native-elements';
import {withRouter, RouteComponentProps} from 'react-router-dom';
import {connect} from 'react-redux';
import {toast} from 'react-toastify';

import QuestionCard from '../components/QuestionCard';

import {StoreState} from '../../shared/global';
import {Class, registerCurrentClass} from '../../shared/global/actions/classes';

import {questionUrl} from '../../shared/utils/urls';
import {ContainerStyles} from '../../shared/styles/styles';
import {commonBlue} from '../../shared/styles/colors';

type Props = RouteComponentProps<{classId: string; quizId: string}> & {
  currentClass: Class;
  token: string;
  classes: Class[];
  registerCurrentClass: typeof registerCurrentClass;
};

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
  end: boolean;
}

class EditQuestion extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      questions: [],
      loading: true,
      errored: false,
      page: 0,
      end: false,
    };
  }

  componentDidMount() {
    const {classId} = this.props.match.params;
    const {classes} = this.props;

    const classFound = classes.find((cls) => cls.id === classId);

    if (classFound) {
      this.props.registerCurrentClass(classFound);
    } else {
      this.props.history.replace('/*');
    }

    this.fetchQues();
  }

  fetchQues = () => {
    this.setState({loading: true});
    const {token, match} = this.props;
    axios
      .get<Questions[]>(
        `${questionUrl}/${this.props.match.params.classId}/${match.params.quizId}`,
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
          this.setState({loading: false, end: false});
          return;
        }
        this.setState({
          questions: [...this.state.questions, ...res.data],
          loading: false,
        });
      })
      .catch(() => this.setState({loading: false, errored: true}));
  };

  onLoadNextPress = () => {
    this.setState({page: this.state.page + 1}, this.fetchQues);
  };

  renderItem = ({item}: {item: Questions}) => {
    return (
      <QuestionCard
        question={item}
        quizId={this.props.match.params.quizId}
        classId={this.props.currentClass.id}
        token={this.props.token}
        onInvalidFile={() => toast.error('Please upload a valid image file.')}
        onUploadFail={() =>
          toast.error('Unable to update. Please try again later')
        }
        onUploadSuccess={() => toast.success('Question updated succesfully')}
      />
    );
  };

  renderContent = () => {
    const {errored, loading, questions} = this.state;

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

    return (
      <View>
        <FlatList
          data={questions}
          keyExtractor={(_item, i) => i.toString()}
          renderItem={this.renderItem}
        />
      </View>
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
            onPress: () => this.props.history.goBack(),
          }}
        />

        {this.renderContent()}
      </View>
    );
  }
}

const mapStateToProps = (state: StoreState) => {
  return {
    token: state.token!,
    currentClass: state.currentClass!,
    classes: state.classes,
  };
};

export default withRouter(
  connect(mapStateToProps, {registerCurrentClass})(EditQuestion),
);
