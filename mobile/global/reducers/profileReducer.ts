import {ActionTypes, RegisterProfileAction} from '../actions/profile';

export const profileReducer = (
  state: {name: string; username: string; avatar: string} = {
    name: 'loading...',
    username: 'loading...',
    avatar: 'none',
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
