/* eslint-disable no-undef */
import {Dispatch} from 'redux';
import axios from 'axios';
import {StoreState} from '../index';
import {discussUrl} from '../../utils/urls';

enum ActionTypes {
  fetchedDiscuss = 'fetched_discuss',
  loadingDiscuss = 'loading_discuss',
  erroredDiscuss = 'errored_discuss',
}

type DiscussRes = {
  id: string;
  title: string;
  createdAt: string;
  author: string;
  closed: boolean;
  comments: number;
  closedPermanently: boolean;
};

type DiscussPayload = {
  loading: boolean;
  errored: boolean;
  discussions: DiscussRes[];
};

type DiscussState = {
  [classId: string]: DiscussPayload | undefined;
};

interface erroredAction {
  type: ActionTypes.erroredDiscuss;
  payload: {
    classId: string;
    errored: boolean;
  };
}

interface loadingAction {
  type: ActionTypes.loadingDiscuss;
  payload: {
    classId: string;
    loading: boolean;
  };
}

interface fetchedAction {
  type: ActionTypes.fetchedDiscuss;
  payload: {
    classId: string;
    data: DiscussRes[];
  };
}

const discussErrored = (errored: boolean, classId: string): erroredAction => {
  return {
    type: ActionTypes.erroredDiscuss,
    payload: {
      classId,
      errored,
    },
  };
};

const discussLoading = (loading: boolean, classId: string): loadingAction => {
  return {
    type: ActionTypes.loadingDiscuss,
    payload: {
      loading,
      classId,
    },
  };
};

const discussFetched = (data: DiscussRes[], classId: string): fetchedAction => {
  return {
    type: ActionTypes.fetchedDiscuss,
    payload: {
      data,
      classId,
    },
  };
};

const fetchDiscuss = (token: string, classId: string) => {
  return async (dispatch: Dispatch, getState: () => StoreState) => {
    const state = getState();
    const discuss = state.discussions[classId];

    if (discuss) {
      return;
    }

    try {
      dispatch(discussLoading(true, classId));
      const res = await axios.get(`${discussUrl}/${classId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      dispatch(discussFetched(res.data, classId));
    } catch (e) {
      dispatch(discussLoading(false, classId));
      dispatch(discussErrored(true, classId));
    }
  };
};

export {ActionTypes, fetchDiscuss};

export type {
  erroredAction,
  loadingAction,
  fetchedAction,
  DiscussPayload,
  DiscussState,
  DiscussRes,
};
