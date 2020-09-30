/* eslint-disable no-undef */
enum ActionTypes {
  registerCurrentClass,
}

interface Class {
  name: string;
  about: string;
  owner: string;
  id: string;
  photo: string;
  collaborators: string[];
}

interface registerClassAction {
  type: ActionTypes.registerCurrentClass;
  payload: Class;
}

const registerCurrentClass = (currentClass: Class): registerClassAction => {
  return {
    type: ActionTypes.registerCurrentClass,
    payload: currentClass,
  };
};

export {Class, registerClassAction, registerCurrentClass, ActionTypes};
