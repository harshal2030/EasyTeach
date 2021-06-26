import {io} from 'socket.io-client';
import {store} from '../shared/global';
import {root} from '../shared/utils/urls';

export const socket = io(root, {
  auth: {
    token: store.getState().token,
  },
});
