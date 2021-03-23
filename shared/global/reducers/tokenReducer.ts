import {
  ActionTypes,
  RegisterTokenAction,
  RemoveTokenAction,
  RegisterFCMAction,
} from '../actions/token';

export const tokenReducer = (
  state: string | null = null,
  action: RegisterTokenAction | RemoveTokenAction,
) => {
  switch (action.type) {
    case ActionTypes.registerToken:
      return action.payload;
    case ActionTypes.removeToken:
      return action.payload;
    default:
      return state;
  }
};

export const fcmReducer = (
  state: {os: string; fcmToken: string} | null = null,
  action: RegisterFCMAction,
) => {
  switch (action.type) {
    case ActionTypes.registerFCM:
      return action.payload;
    default:
      return state;
  }
};
