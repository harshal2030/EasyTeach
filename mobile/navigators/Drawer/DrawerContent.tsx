import React from 'react';
import {Alert, StyleSheet, TouchableOpacity, Text} from 'react-native';
import {DrawerContentComponentProps} from '@react-navigation/drawer';
import Entypo from 'react-native-vector-icons/Entypo';
import Octicons from 'react-native-vector-icons/Octicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import Drawer from '../../../shared/navigators/Drawer/DrawerContent';

type Props = DrawerContentComponentProps;

const DrawerContent = (props: Props) => {
  const renderOwner = () => {
    return (
      <TouchableOpacity
        style={styles.optionContainer}
        onPress={() => props.navigation.navigate('Manage')}>
        <FontAwesome name="sliders" color="#34495e" size={23} />
        <Text style={styles.optionText}> Manage</Text>
      </TouchableOpacity>
    );
  };

  const onPlusPress = () => {
    props.navigation.closeDrawer();
    props.navigation.navigate('JoinClass');
  };

  return (
    <Drawer
      onClassPress={() => props.navigation.closeDrawer()}
      onGearPress={() => props.navigation.navigate('Settings')}
      onLogOutError={() =>
        Alert.alert('', 'Unable to Log Out, please try again later.')
      }
      renderOwnerOptions={renderOwner}
      onPlusPress={onPlusPress}>
      <TouchableOpacity
        style={styles.optionContainer}
        onPress={() => props.navigation.navigate('Home')}>
        <Entypo name="home" color="#34495e" size={23} />
        <Text style={styles.optionText}> Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.optionContainer}
        onPress={() => props.navigation.navigate('People')}>
        <FontAwesome name="group" color="#34495e" size={23} />
        <Text style={styles.optionText}> People</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.optionContainer}
        onPress={() => props.navigation.navigate('Test')}>
        <Octicons name="checklist" color="#34495e" size={25} />
        <Text style={styles.optionText}> Tests</Text>
      </TouchableOpacity>
    </Drawer>
  );
};

const styles = StyleSheet.create({
  optionText: {
    fontSize: 24,
    color: '#34495e',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
});

export default DrawerContent;
