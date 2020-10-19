/* eslint-disable no-undef */
enum ActionTypes {
  registerToken = 'registerToken',
  removeToken = 'removeToken',
}

interface RegisterTokenAction {
  type: ActionTypes.registerToken;
  payload: string;
}

interface RemoveTokenAction {
  type: ActionTypes.removeToken;
  payload: null;
}

const registerToken = (token: string): RegisterTokenAction => {
  return {
    type: ActionTypes.registerToken,
    payload: token,
  };
};

const removeToken = (): RemoveTokenAction => {
  return {
    type: ActionTypes.removeToken,
    payload: null,
  };
};

export {
  registerToken,
  removeToken,
  ActionTypes,
  RegisterTokenAction,
  RemoveTokenAction,
};
