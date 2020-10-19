import React from 'react';
import {View, Text} from 'react-native';
import {Header} from 'react-native-elements';
import RadioForm from 'react-native-simple-radio-button';

const radio_props = [
  {label: 'Join Class', value: 0},
  {label: 'Create Class', value: 1},
];

const JoinClass = () => {
  const [selected, alterSelected] = React.useState(0);
  return (
    <View style={{flex: 1, backgroundColor: '#ffff'}}>
      <Header
        centerComponent={{text: 'Join or Create class', style: {fontSize: 18}}}
        containerStyle={{backgroundColor: '#ffff', height: 50}}
      />
      <View>
        <RadioForm
          radio_props={radio_props}
          initialValue={0}
          onPress={alterSelected}
        />
      </View>
      {selected === 0 ? <Text>Join Class</Text> : <Text>Create Class</Text>}
    </View>
  );
};

export {JoinClass};
