import React from 'react';
import {View, ActivityIndicator, Text} from 'react-native';
import {Header} from 'react-native-elements';

import {commonBlue} from '../shared/styles/colors';
import {ContainerStyles} from '../shared/styles/styles';

const Loading = () => {
  return (
    <View style={ContainerStyles.parent}>
      <Header />
      <View style={ContainerStyles.centerElements}>
        <ActivityIndicator color={commonBlue} animating size="large" />
        <Text>loading...</Text>
      </View>
    </View>
  );
};

export default Loading;
