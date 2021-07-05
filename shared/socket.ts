import {io} from 'socket.io-client';
import {store} from './global';
import {root} from './utils/urls';

export const socket = io(root, {
  auth: {
    token: store.getState().token,
  },
});
