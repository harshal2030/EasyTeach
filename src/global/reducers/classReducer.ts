import {ActionTypes, registerClassAction, Class} from '../actions/classes';

export const classReducer = (
  state: Class | null = null,
  action: registerClassAction,
) => {
  switch (action.type) {
    case ActionTypes.registerCurrentClass:
      return action.payload;
    default:
      return state;
  }
};
