import {Dispatch} from 'redux';
import {StoreState} from '../index.web';
/* eslint-disable no-undef */
enum ActionTypes {
  addUnread = 'add_unread',
  setUnread = 'set_unread',
  setUnreadZero = 'set_unread_zero',
}

type UnreadPayload = {
  [classId: string]: {classId: string; unread: number} | null;
};

type UnreadState = {
  data: UnreadPayload;
  fetched: boolean;
};

interface setUnreadAction {
  type: ActionTypes.setUnread;
  payload: UnreadState;
}

interface addUnreadAction {
  type: ActionTypes.addUnread;
  payload: {
    classId: string;
  };
}

interface setUnreadZeroAction {
  type: ActionTypes.setUnreadZero;
  payload: {
    classId: string;
  };
}

const setUnreadZero = (classId: string): setUnreadZeroAction => {
  return {
    type: ActionTypes.setUnreadZero,
    payload: {
      classId,
    },
  };
};

const addUnreadByOne = (classId: string): addUnreadAction => {
  return {
    type: ActionTypes.addUnread,
    payload: {
      classId,
    },
  };
};

const addUnread = (classId: string) => {
  return async (dispatch: Dispatch, getState: () => StoreState) => {
    if (getState().currentClass?.id !== classId) {
      dispatch(addUnreadByOne(classId));
    }
  };
};

const setUnread = (data: UnreadPayload, fetched: boolean): setUnreadAction => {
  return {
    type: ActionTypes.setUnread,
    payload: {
      data,
      fetched,
    },
  };
};

export {ActionTypes, setUnread, addUnread, setUnreadZero};

export type {
  UnreadPayload,
  UnreadState,
  setUnreadAction,
  addUnreadAction,
  setUnreadZeroAction,
};
