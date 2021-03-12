import React from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {RouteComponentProps} from 'react-router-dom';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import {commonBackground, commonBlue} from '../../styles/colors';

type Props = RouteComponentProps<{}>;

class Home extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.root}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.buttonContainer}>
            <FontAwesome5 name="bullhorn" size={18} color={commonBlue} />
            <Text style={{color: commonBlue}}> Announcements</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonContainer}>
            <FontAwesome name="group" size={18} />
            <Text> People</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 50,
    backgroundColor: '#ffff',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    elevation: 3,
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowColor: commonBackground,
  },
  buttonContainer: {
    flexDirection: 'row',
    borderBottomColor: commonBlue,
    borderBottomWidth: 3,
    padding: 10,
  },
});

export default Home;
