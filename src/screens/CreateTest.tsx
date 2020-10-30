import React from 'react';
import {View, ScrollView} from 'react-native';
import {Header, Input} from 'react-native-elements';
import {commonGrey} from '../styles/colors';
import {StackNavigationProp} from '@react-navigation/stack';
import Modal from 'react-native-modal';

import {ImportExcel} from '../components/main';
import {RootStackParamList} from '../navigators/types';

type NavigationProp = StackNavigationProp<RootStackParamList, 'CreateTest'>;

interface Props {
  navigation: NavigationProp;
}

const CreateTest = (props: Props) => {
  const [showModal, updateModal] = React.useState<boolean>(true);
  return (
    <View style={{flex: 1}}>
      <Header
        centerComponent={{
          text: 'Create Test',
          style: {fontSize: 24, color: '#fff', fontWeight: '600'},
        }}
        leftComponent={{
          icon: 'arrow-back',
          color: '#ffff',
          size: 26,
          onPress: () => props.navigation.goBack(),
        }}
      />

      <ScrollView style={{padding: 20}}>
        <Input
          label="No. of questions"
          errorMessage="How many questions to be included from given set"
          errorStyle={{color: commonGrey}}
          keyboardType="number-pad"
        />
      </ScrollView>

      <Modal
        isVisible={showModal}
        animationOut="slideOutLeft"
        onBackButtonPress={() => props.navigation.goBack()}
        style={{margin: 0}}>
        <ImportExcel
          onBackPress={() => props.navigation.goBack()}
          onSubmitPress={() => updateModal(false)}
        />
      </Modal>
    </View>
  );
};

export default CreateTest;
