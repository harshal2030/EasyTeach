import React from 'react';
import {View, StyleSheet, useWindowDimensions} from 'react-native';
import {toast} from 'react-toastify';
import Modal from 'react-native-modal';

import Drawer from '../Drawer';
import Announce from '../../shared/screens/Announcement';

const Announcement = () => {
  const [drawerVisible, setDrawer] = React.useState(false);
  const width = useWindowDimensions().width;
  const isLargeScreen = width >= 768;

  return (
    <View style={styles.parent}>
      {isLargeScreen ? (
        // eslint-disable-next-line react-native/no-inline-styles
        <View style={[styles.drawer, {width: 320}]}>
          <Drawer />
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
          <Drawer />
        </Modal>
      )}

      <View style={styles.main}>
        <Announce
          onJoinPress={() => console.log('join pressed')} // TODO: create join class screen and route it
          onLeftTopPress={() => setDrawer(!drawerVisible)}
          onSendError={() =>
            toast.error(
              'Unable to send message at the moment. Please try again later',
            )
          }
        />
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

export default Announcement;
