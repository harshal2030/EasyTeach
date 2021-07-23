/* eslint-disable no-undef */
import {Dispatch} from 'redux';
import axios from 'axios';
import {StoreState} from '../index.web';

import {msgUrl} from '../../utils/urls';
import {setUnread, UnreadPayload, setUnreadZero} from './unreads';

enum ActionTypes {
  msgsErrored = 'msgs_errored',
  msgsLoading = 'msgs_loading',
  msgsFetched = 'msgs_fetched',
  addMsgs = 'msgs_add',
  msgsEnd = 'msgs_end',
}

type MsgPayload = {
  loading: boolean;
  errored: boolean;
  end: boolean;
  msgs: Msg[];
};

type MsgState = {
  [classId: string]: MsgPayload | undefined;
};

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
  payload: {
    classId: string;
    errored: boolean;
  };
}

interface msgLoadingAction {
  type: ActionTypes.msgsLoading;
  payload: {
    classId: string;
    loading: boolean;
  };
}

interface msgFetchedAction {
  type: ActionTypes.msgsFetched;
  payload: {
    msgs: Msg[];
    classId: string;
  };
}

interface addMsgAction {
  type: ActionTypes.addMsgs;
  payload: {
    msg: Msg;
    classId: string;
  };
}

interface endMsgAction {
  type: ActionTypes.msgsEnd;
  payload: {
    end: boolean;
    classId: string;
  };
}

const msgHasEnd = (end: boolean, classId: string): endMsgAction => {
  return {
    type: ActionTypes.msgsEnd,
    payload: {
      end,
      classId,
    },
  };
};

const msgHasErrored = (errored: boolean, classId: string): msgErroredAction => {
  return {
    type: ActionTypes.msgsErrored,
    payload: {
      errored,
      classId,
    },
  };
};

const msgIsLoading = (loading: boolean, classId: string): msgLoadingAction => {
  return {
    type: ActionTypes.msgsLoading,
    payload: {
      loading,
      classId,
    },
  };
};

const msgFetched = (msgs: Msg[], classId: string): msgFetchedAction => {
  return {
    type: ActionTypes.msgsFetched,
    payload: {
      msgs,
      classId,
    },
  };
};

const addMsg = (msg: Msg, classId: string): addMsgAction => {
  return {
    type: ActionTypes.addMsgs,
    payload: {
      msg,
      classId,
    },
  };
};

const fetchMsgs = (token: string, classId: string, endReached = false) => {
  return async (dispatch: Dispatch, getState: () => StoreState) => {
    const state = getState();
    const msg = state.msgs[classId];
    if (!state.unreads.fetched) {
      try {
        const res = await axios.get<UnreadPayload>(`${msgUrl}/unread`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        dispatch(setUnread(res.data, true));
      } catch (e) {
        null;
      }
    }

    const unreads = state.unreads.data[classId]?.unread;

    console.log(unreads, state.currentClass);

    if (unreads && unreads !== 0) {
      dispatch(setUnreadZero(classId));

      try {
        await axios.post(
          `${msgUrl}/unread/${classId}`,
          {
            lastMessageDate: new Date(),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      } catch (e) {
        null;
      }
    }

    if (msg && !endReached) {
      return;
    }

    if (msg && msg.end) {
      return;
    }

    const lastMessage = msg?.msgs[msg.msgs.length - 1];

    try {
      dispatch(msgIsLoading(true, classId));

      const params = lastMessage ? {after: lastMessage.id} : null;

      const res = await axios.get<Msg[]>(`${msgUrl}/${classId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      if (res.data.length === 0) {
        dispatch(msgHasEnd(true, classId));
      }

      dispatch(msgIsLoading(false, classId));
      dispatch(msgFetched(res.data, classId));
    } catch (e) {
      dispatch(msgIsLoading(false, classId));
      dispatch(msgHasErrored(true, classId));
    }
  };
};

export {ActionTypes, fetchMsgs, addMsg};

export type {
  msgErroredAction,
  msgLoadingAction,
  msgFetchedAction,
  addMsgAction,
  endMsgAction,
  Msg,
  MsgState,
  MsgPayload,
};
