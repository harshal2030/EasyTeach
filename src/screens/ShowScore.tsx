import React from 'react';
import {View, Text} from 'react-native';
import {Header} from 'react-native-elements';
import {StackNavigationProp} from '@react-navigation/stack';
import {connect} from 'react-redux';

import {StoreState} from '../global';
import {Class} from '../global/actions/classes';
import {RootStackParamList} from '../navigators/types';

type NavigationProp = StackNavigationProp<RootStackParamList, 'ShowScore'>;

interface Props {
  navigation: NavigationProp;
  token: string | null;
  currentClass: Class | null;
}

class ShowScore extends React.Component<Props> {
  render() {
    return (
      <View>
        <Header
          centerComponent={{
            text: 'Create Test',
            style: {fontSize: 24, color: '#fff', fontWeight: '600'},
          }}
          leftComponent={{
            icon: 'arrow-back',
            color: '#ffff',
            size: 26,
            onPress: () => this.props.navigation.goBack(),
          }}
        />

        <Text>hello You want to see ur score? huh!😏😏</Text>
      </View>
    );
  }
}

const mapStateToProps = (state: StoreState) => {
  return {
    token: state.token,
    currentClass: state.currentClass,
  };
};

export default connect(mapStateToProps)(ShowScore);
