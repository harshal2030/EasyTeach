import React from 'react';
import {View, StyleSheet, useWindowDimensions} from 'react-native';
import {useRouteMatch, Switch, Route} from 'react-router-dom';
import Modal from 'react-native-modal';

import Drawer from '../Drawer';
import Announce from './Announcement.web';
import People from './People';
import Test from './Test';
import Manage from './ManageClass';
import Modules from './Modules';

const Main = () => {
  const [drawerVisible, setDrawer] = React.useState(false);
  const width = useWindowDimensions().width;
  const isLargeScreen = width >= 768;
  const {path} = useRouteMatch();

  return (
    <View style={styles.parent}>
      {isLargeScreen ? (
        // eslint-disable-next-line react-native/no-inline-styles
        <View style={[styles.drawer, {width: 320}]}>
          <Drawer onOptionPress={() => setDrawer(false)} />
        </View>
      ) : (
        <Modal
          isVisible={drawerVisible}
          animationIn="slideInLeft"
          swipeDirection="left"
          onSwipeComplete={() => setDrawer(false)}
          animationOut="slideOutLeft"
          onBackdropPress={() => setDrawer(!drawerVisible)}
          // eslint-disable-next-line react-native/no-inline-styles
          style={[styles.drawer, {width: '80%'}]}>
          <Drawer onOptionPress={() => setDrawer(false)} />
        </Modal>
      )}

      <View style={styles.main}>
        <Switch>
          <Route path={`${path}/home`} exact>
            <Announce onLeftTopPress={() => setDrawer(!drawerVisible)} />
          </Route>
          <Route path={`${path}/home/:classId`}>
            <Announce onLeftTopPress={() => setDrawer(!drawerVisible)} />
          </Route>
          <Route path={`${path}/people/:classId`}>
            <People onLeftTopPress={() => setDrawer(!drawerVisible)} />
          </Route>
          <Route path={`${path}/tests/:classId`}>
            <Test onLeftTopPress={() => setDrawer(!drawerVisible)} />
          </Route>
          <Route path={`${path}/about/:classId`}>
            <Manage onTopLeftPress={() => setDrawer(!drawerVisible)} />
          </Route>
          <Route path={`${path}/modules/:classId`}>
            <Modules onLeftTopPress={() => setDrawer(!drawerVisible)} />
          </Route>
        </Switch>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  parent: {
    flex: 1,
    flexDirection: 'row',
  },
  drawer: {
    height: '100%',
    margin: 0,
  },
  main: {
    flex: 1,
  },
});

export default Main;
