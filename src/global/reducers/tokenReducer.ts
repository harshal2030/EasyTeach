import {
  ActionTypes,
  RegisterTokenAction,
  RemoveTokenAction,
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
