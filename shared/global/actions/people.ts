import {Dispatch} from 'redux';
import axios from 'axios';
import {StoreState} from '..';
import {studentUrl} from '../../utils/urls';
/* eslint-disable no-undef */
enum ActionTypes {
  fetchPeople = 'fetch_people',
  loadingPeople = 'loading_people',
  erroredPeople = 'errored_people',
  removeUser = 'remove_user',
}

type User = {
  name: string;
  username: string;
  avatar: string;
};

type PeoplePayload = {
  loading: boolean;
  errored: boolean;
  offset: number;
  users: User[];
};

type PeopleState = {
  [classId: string]: PeoplePayload | undefined;
};

interface PeopleLoadingAction {
  type: ActionTypes.loadingPeople;
  payload: {
    classId: string;
    loading: boolean;
  };
}

interface PeopleErroredAction {
  type: ActionTypes.erroredPeople;
  payload: {
    classId: string;
    errored: boolean;
  };
}

interface PeopleFetchedAction {
  type: ActionTypes.fetchPeople;
  payload: {
    classId: string;
    currentOffset: number;
    users: User[];
  };
}

interface RemoveUserAction {
  type: ActionTypes.removeUser;
  payload: {
    classId: string;
    username: string;
  };
}

const peopleErrored = (
  errored: boolean,
  classId: string,
): PeopleErroredAction => {
  return {
    type: ActionTypes.erroredPeople,
    payload: {
      errored,
      classId,
    },
  };
};

const peopleLoading = (
  loading: boolean,
  classId: string,
): PeopleLoadingAction => {
  return {
    type: ActionTypes.loadingPeople,
    payload: {
      loading,
      classId,
    },
  };
};

const peopleFetched = (
  users: User[],
  classId: string,
  currentOffset: number,
): PeopleFetchedAction => {
  return {
    type: ActionTypes.fetchPeople,
    payload: {
      classId,
      users,
      currentOffset,
    },
  };
};

const removeUser = (username: string, classId: string): RemoveUserAction => {
  return {
    type: ActionTypes.removeUser,
    payload: {
      username,
      classId,
    },
  };
};

const fetchPeople = (classId: string, offsetChange: number = 0) => {
  return async (dispatch: Dispatch, getState: () => StoreState) => {
    const store = getState();
    const people = store.people[classId];
    const offset = people ? offsetChange + people.offset : offsetChange;

    if (people && offset === people.offset) {
      return;
    }

    try {
      dispatch(peopleLoading(true, classId));
      const res = await axios.get<User[]>(`${studentUrl}/${classId}`, {
        headers: {
          Authorization: `Bearer ${store.token}`,
        },
        params: {
          offset,
        },
      });

      dispatch(peopleFetched(res.data, classId, offset));
    } catch (e) {
      dispatch(peopleLoading(false, classId));
      dispatch(peopleErrored(true, classId));
    }
  };
};

export {ActionTypes, fetchPeople, removeUser};

export type {
  PeopleErroredAction,
  PeopleFetchedAction,
  PeopleLoadingAction,
  PeoplePayload,
  PeopleState,
  RemoveUserAction,
};
