import {
  ActionTypes,
  PeopleErroredAction,
  PeopleLoadingAction,
  PeopleFetchedAction,
  RemoveUserAction,
  PeopleState,
} from '../actions/people';

const initialState: PeopleState = {};

type Actions =
  | PeopleErroredAction
  | PeopleFetchedAction
  | PeopleLoadingAction
  | RemoveUserAction;

const peopleReducer = (
  state: PeopleState = initialState,
  action: Actions,
): PeopleState => {
  const people = state[action.payload?.classId] || {
    loading: true,
    errored: false,
    users: [],
    offset: 0,
  };
  const {loading, errored, users, offset} = people;

  const tempState = {...state};

  switch (action.type) {
    case ActionTypes.erroredPeople:
      tempState[action.payload.classId] = {
        loading,
        errored: action.payload.errored,
        offset,
        users,
      };

      return tempState;
    case ActionTypes.loadingPeople:
      tempState[action.payload.classId] = {
        loading: action.payload.loading,
        errored,
        offset,
        users,
      };

      return tempState;
    case ActionTypes.fetchPeople:
      tempState[action.payload.classId] = {
        loading: false,
        errored,
        offset: action.payload.currentOffset,
        users: action.payload.users,
      };

      return tempState;
    case ActionTypes.removeUser:
      tempState[action.payload.classId] = {
        loading,
        errored,
        offset,
        users: state[action.payload.classId]!.users.filter(
          (user) => user.username !== action.payload.username,
        ),
      };

      return tempState;
    default:
      return state;
  }
};

export {peopleReducer};
