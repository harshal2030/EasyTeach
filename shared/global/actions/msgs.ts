/* eslint-disable no-undef */
import {Dispatch} from 'redux';
import axios from 'axios';

import {msgUrl} from '../../utils/urls';

enum ActionTypes {
  msgsErrored = 'msgs_errored',
  msgsLoading = 'msgs_loading',
  msgsFetched = 'msgs_fetched',
  addMsgs = 'msgs_add',
}

interface Msg {
  id: string;
  createdAt: string;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  message: string;
}

// action interfaces
interface msgErroredAction {
  type: ActionTypes.msgsErrored;
  payload: boolean;
}

interface msgLoadingAction {
  type: ActionTypes.msgsLoading;
  payload: boolean;
}

interface msgFetchedAction {
  type: ActionTypes.msgsFetched;
  payload: Msg[];
}

interface addMsgAction {
  type: ActionTypes.addMsgs;
  payload: Msg;
}

const msgHasErrored = (errored: boolean): msgErroredAction => {
  return {
    type: ActionTypes.msgsErrored,
    payload: errored,
  };
};

const msgIsLoading = (loading: boolean): msgLoadingAction => {
  return {
    type: ActionTypes.msgsLoading,
    payload: loading,
  };
};

const msgFetched = (msgs: Msg[]): msgFetchedAction => {
  return {
    type: ActionTypes.msgsFetched,
    payload: msgs,
  };
};

const addMsg = (msg: Msg): addMsgAction => {
  return {
    type: ActionTypes.addMsgs,
    payload: msg,
  };
};

const fetchMsgs = (token: string, classId: string) => {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(msgIsLoading(true));
      const res = await axios.get<Msg[]>(`${msgUrl}/${classId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      dispatch(msgIsLoading(false));
      dispatch(msgFetched(res.data));
    } catch (e) {
      dispatch(msgIsLoading(false));
      dispatch(msgHasErrored(true));
    }
  };
};

export {
  ActionTypes,
  msgErroredAction,
  msgLoadingAction,
  msgFetchedAction,
  addMsgAction,
  Msg,
  fetchMsgs,
  addMsg,
};
