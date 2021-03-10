import React from 'react';
import {View} from 'react-native';
import {Theme, makeStyles, createStyles, Drawer} from '@material-ui/core';
import DrawerContent from './DrawerContent.web';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawer: {
      width: 350,
      flexShrink: 0,
    },
    paper: {
      width: 350,
    },
    content: {
      padding: theme.spacing(3),
      flexGrow: 1,
    },
  }),
);

const DrawerNavigator = () => {
  const styles = useStyles();

  return (
    <View>
      <Drawer
        variant="permanent"
        className={styles.drawer}
        classes={{paper: styles.paper}}>
        <DrawerContent />
      </Drawer>
    </View>
  );
};

export default DrawerNavigator;
