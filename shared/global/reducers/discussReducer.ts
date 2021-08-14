import {
  ActionTypes,
  DiscussState,
  loadingAction,
  erroredAction,
  fetchedAction,
} from '../actions/discuss';

const initialState: DiscussState = {};

type Actions = loadingAction | erroredAction | fetchedAction;

export const discussReducer = (
  state: DiscussState = initialState,
  action: Actions,
): DiscussState => {
  const discuss = state[action.payload?.classId] || {
    loading: true,
    errored: false,
    discussions: [],
  };
  const {loading, errored, discussions} = discuss;
  const tempState = {...state};

  switch (action.type) {
    case ActionTypes.loadingDiscuss:
      tempState[action.payload.classId] = {
        loading: action.payload.loading,
        errored,
        discussions,
      };

      return tempState;

    case ActionTypes.erroredDiscuss:
      tempState[action.payload.classId] = {
        loading,
        errored: action.payload.errored,
        discussions,
      };

      return tempState;

    case ActionTypes.fetchedDiscuss:
      tempState[action.payload.classId] = {
        loading: false,
        errored,
        discussions: action.payload.data,
      };

      return tempState;
    default:
      return state;
  }
};
