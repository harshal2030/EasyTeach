import React from 'react';
import {View, Text, ScrollView} from 'react-native';
import {Header} from 'react-native-elements';
import BackIcon from '@iconify-icons/ic/arrow-back';
import {useHistory} from 'react-router-dom';

import {TouchableIcon} from '../components';

import {ContainerStyles} from '../../shared/styles/styles';

const CreateSheet = () => {
  const history = useHistory();

  return (
    <View style={ContainerStyles.parent}>
      <Header
        centerComponent={{
          text: 'Create Questions',
          style: {fontSize: 24, color: '#fff', fontWeight: '600'},
        }}
        leftComponent={
          <TouchableIcon
            icon={BackIcon}
            color="#fff"
            size={26}
            onPress={history.goBack}
          />
        }
      />

      <ScrollView>
        <Text>Hello! This will be the second last feature</Text>
      </ScrollView>

      <View>
        <Text>Let's try this one</Text>
      </View>
    </View>
  );
};

export default CreateSheet;
