import React from 'react';
import {View, Text} from 'react-native';
import {connect} from 'react-redux';

import {StoreState} from '../global';

interface Props {
  profile: {
    name: string;
    username: string;
  };
}

const Home = (): JSX.Element => {
  return (
    <View>
      <Text>hii</Text>
    </View>
  );
};

const mapStateToProps = (state: StoreState) => {
  return {
    profile: state.profile,
  };
};

export default connect(mapStateToProps)(Home);
