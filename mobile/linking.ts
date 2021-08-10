import {LinkingOptions} from '@react-navigation/native';
import {Linking} from 'react-native';
import {store} from '../shared/global';
import {redirected} from '../shared/global/actions/token';

export const linking: LinkingOptions = {
  prefixes: ['https://easyteach.inddex.co', 'easyteach://inddex'],
  config: {
    screens: {
      JoinClass: 'joinclass',
      Quiz: {
        path: 'quiz/:classId/:quizId',
      },
    },
  },
  async getInitialURL() {
    const url = await Linking.getInitialURL();
    const state = store.getState();

    if (state.token) {
      store.dispatch(redirected());
    }

    if (url != null) {
      return url;
    }
  },
};
