import {ActionTypes, RegisterProfileAction} from '../actions/profile';

export const profileReducer = (
  state: {name: string; username: string} = {
    name: 'loading...',
    username: 'loading...',
  },
  action: RegisterProfileAction,
) => {
  switch (action.type) {
    case ActionTypes.registerProfile:
      return action.payload;
    default:
      return state;
  }
};
