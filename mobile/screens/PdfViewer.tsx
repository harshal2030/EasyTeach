import React from 'react';
import {View, Text, ActivityIndicator} from 'react-native';
import {Header} from 'react-native-elements';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import PDFView from 'react-native-view-pdf';

import {RootStackParamList} from '../navigators/types';
import {ContainerStyles} from '../../shared/styles/styles';
import {commonBlue} from '../../shared/styles/colors';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PDFViewer'>;
  route: RouteProp<RootStackParamList, 'PDFViewer'>;
};

const PdfViewer: React.FC<Props> = (props) => {
  const [loading, setLoading] = React.useState(true);
  const [errored, setErrored] = React.useState(false);

  if (errored) {
    return (
      <View style={ContainerStyles.centerElements}>
        <Text>Could not load PDF. Please try again later</Text>
      </View>
    );
  }

  return (
    <View style={ContainerStyles.parent}>
      <Header
        leftComponent={{
          icon: 'arrow-back',
          color: '#ffff',
          size: 26,
          onPress: props.navigation.goBack,
        }}
      />
      {loading && (
        <View style={ContainerStyles.centerElements}>
          <ActivityIndicator color={commonBlue} size="large" animating />
          <Text>Loading PDF...</Text>
        </View>
      )}
      <PDFView
        resourceType="url"
        resource={props.route.params.url}
        style={{flex: 1}}
        onLoad={() => setLoading(false)}
        onError={() => setErrored(true)}
      />
    </View>
  );
};

export default PdfViewer;
