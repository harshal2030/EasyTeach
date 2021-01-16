import React from 'react';
import axios from 'axios';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {Header} from 'react-native-elements';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {connect} from 'react-redux';
import {FlatGrid} from 'react-native-super-grid';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {StoreState} from '../global';
import {Class} from '../global/actions/classes';

import {RootStackParamList} from '../navigators/types';
import {moduleUrl} from '../utils/urls';
import {ContainerStyles} from '../styles/styles';
import {commonBlue, commonGrey} from '../styles/colors';
import {
  imageExtPattern,
  videoExtPattern,
  pdfExtPattern,
  pptExtPattern,
  docExtPattern,
  excelExtPattern,
} from '../utils/regexPatterns';

interface Props {
  navigation: StackNavigationProp<RootStackParamList, 'Files'>;
  currentClass: Class;
  token: string;
  route: RouteProp<RootStackParamList, 'Files'>;
}

interface File {
  title: string;
  id: string;
  filename: string;
}

interface State {
  files: File[];
  loading: boolean;
  errored: boolean;
}

class Files extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      files: [],
      loading: true,
      errored: false,
    };
  }

  componentDidMount() {
    axios
      .get<File[]>(
        `${moduleUrl}/${this.props.currentClass.id}/${this.props.route.params.moduleId}`,
        {
          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
        },
      )
      .then((res) => {
        this.setState({files: res.data, loading: false});
      })
      .catch(() => this.setState({errored: true, loading: false}));
  }

  renderFileBlock = ({item}: {item: File}) => {
    let name: string = 'image';

    if (item.filename.match(imageExtPattern)) {
      name = 'image-outline';
    }

    if (item.filename.match(videoExtPattern)) {
      name = 'play-box-outline';
    }

    if (item.filename.match(pdfExtPattern)) {
      name = 'pdf-box';
    }

    if (item.filename.match(docExtPattern)) {
      name = 'microsoft-word';
    }

    if (item.filename.match(pptExtPattern)) {
      name = 'microsoft-powerpoint';
    }

    if (item.filename.match(excelExtPattern)) {
      name = 'microsoft-excel';
    }

    return (
      <TouchableOpacity style={styles.fileBlock} onPress={() => console.log(item.filename)}>
        <MaterialCommunityIcons name={name} size={35} color={commonGrey} />
        <Text style={styles.fileBlockText}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  renderContent = () => {
    const {loading, errored, files} = this.state;

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
            We're having trouble in fetching latest data. Please try again later
          </Text>
        </View>
      );
    }

    if (files.length === 0) {
      return (
        <View style={ContainerStyles.centerElements}>
          <Text>Wow! Such empty</Text>
        </View>
      );
    }

    return (
      <FlatGrid
        data={files}
        spacing={6}
        keyExtractor={(item) => item.id}
        renderItem={this.renderFileBlock}
      />
    );
  };

  render() {
    return (
      <View style={{flex: 1}}>
        <Header
          centerComponent={{
            text: 'Files',
            style: {fontSize: 24, color: '#fff', fontWeight: '600'},
          }}
          leftComponent={{
            icon: 'arrow-back',
            color: '#ffff',
            size: 26,
            onPress: this.props.navigation.goBack,
          }}
        />
        {this.renderContent()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  fileBlock: {
    borderWidth: 1,
    borderColor: commonGrey,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileBlockText: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: '600',
  },
});

const mapStateToProps = (state: StoreState) => {
  return {
    token: state.token!,
    currentClass: state.currentClass!,
  };
};

export default connect(mapStateToProps)(Files);
