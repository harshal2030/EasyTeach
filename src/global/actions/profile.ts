/* eslint-disable no-undef */
enum ActionTypes {
  registerProfile = 'registerProfile',
}

interface RegisterProfileAction {
  type: ActionTypes.registerProfile;
  payload: {
    name: string;
    username: string;
  };
}

const registerProfile = (user: {
  name: string;
  username: string;
}): RegisterProfileAction => {
  return {
    type: ActionTypes.registerProfile,
    payload: user,
  };
};

export {registerProfile, ActionTypes, RegisterProfileAction};
