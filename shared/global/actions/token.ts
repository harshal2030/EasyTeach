/* eslint-disable no-undef */
enum ActionTypes {
  registerToken = 'registerToken',
  removeToken = 'removeToken',
  registerFCM = 'registerFCM',
  redirected = 'link_redirected',
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

interface RedirectAction {
  type: ActionTypes.redirected;
}

const redirected = (): RedirectAction => {
  return {
    type: ActionTypes.redirected,
  };
};

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
  RedirectAction,
  redirected,
};
