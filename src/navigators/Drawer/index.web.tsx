import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Switch, Route, useRouteMatch} from 'react-router-dom';

import DrawerContent from './DrawerContent.web';
import Home from '../bottom-tabs/Home.web';

import {commonBackground} from '../../styles/colors';

const DrawerNavigator = () => {
  const {path} = useRouteMatch();

  return (
    <View style={styles.root}>
      <View style={styles.drawer}>
        <DrawerContent />
      </View>
      <View style={styles.main}>
        <Switch>
          <Route path={`${path}`} component={Home} />
        </Switch>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
  },
  drawer: {
    width: 350,
    height: '100%',
  },
  main: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: commonBackground,
  },
});

export default DrawerNavigator;
