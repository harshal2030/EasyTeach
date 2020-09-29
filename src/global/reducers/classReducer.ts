import {fetchClassAction, classActionTypes, Class} from '../actions/classes';

export const classReducer = (state: Class[] = [], action: fetchClassAction) => {
  switch (action.type) {
    case classActionTypes.fetchClass:
      return action.payload;
    default:
      return state;
  }
};
