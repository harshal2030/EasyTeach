/* eslint-disable no-undef */
enum ActionTypes {
  registerToken = 'registerToken',
  removeToken = 'removeToken',
  registerFCM = 'registerFCM',
}

interface RegisterTokenAction {
  type: ActionTypes.registerToken;
  payload: string;
}

interface RemoveTokenAction {
  type: ActionTypes.removeToken;
  payload: null;
}

interface RegisterFCMAction {
  type: ActionTypes.registerFCM;
  payload: {
    os: string;
    fcmToken: string;
  };
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

const registerFCM = (fcm: {
  os: string;
  fcmToken: string;
}): RegisterFCMAction => {
  return {
    type: ActionTypes.registerFCM,
    payload: fcm,
  };
};

export {
  registerToken,
  removeToken,
  registerFCM,
  RegisterFCMAction,
  ActionTypes,
  RegisterTokenAction,
  RemoveTokenAction,
};
