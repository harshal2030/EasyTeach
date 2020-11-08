import {Dispatch} from 'redux';
import axios from 'axios';
import {classUrl} from '../../utils/urls';

/* eslint-disable no-undef */
enum ActionTypes {
  registerCurrentClass = 'registerCurrentClass',
  removeCurrentClass = 'remove_current_class',
  classesHasErrored = 'classes_has_errored',
  classesLoading = 'classes_loading',
  classesFetchSuccess = 'classes_fetched_success',
  addClass = 'add_class',
  classOwner = 'class_owner',
  updateClass = 'update_class',
}

interface Class {
  name: string;
  about: string;
  owner: {
    username: string;
    avatar: string;
    name: string;
  };
  subject: string;
  id: string;
  photo: string;
  collaborators: string[];
  joinCode: string;
  lockJoin: boolean;
}

// return action types of each action
interface registerClassAction {
  type: ActionTypes.registerCurrentClass;
  payload: Class;
}

interface removeClassAction {
  type: ActionTypes.removeCurrentClass;
  payload: null;
}

interface classHasErroredAction {
  type: ActionTypes.classesHasErrored;
  payload: boolean;
}

interface classLoadingAction {
  type: ActionTypes.classesLoading;
  payload: boolean;
}

interface classFetchedAction {
  type: ActionTypes.classesFetchSuccess;
  payload: Class[];
}

interface addedClassAction {
  type: ActionTypes.addClass;
  payload: Class;
}

interface updatedClassAction {
  type: ActionTypes.updateClass;
  payload: Class;
}

// for getting list of classes enrolled by user or owned
const classesHasErrored = (bool: boolean): classHasErroredAction => {
  return {
    type: ActionTypes.classesHasErrored,
    payload: bool,
  };
};

const classesLoading = (bool: boolean): classLoadingAction => {
  return {
    type: ActionTypes.classesLoading,
    payload: bool,
  };
};

const classesFetchedSuccess = (classes: Class[]): classFetchedAction => {
  return {
    type: ActionTypes.classesFetchSuccess,
    payload: classes,
  };
};

const fetchClasses = (token: string) => {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(classesLoading(true));

      const classes = await axios.get<Class[]>(classUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (classes.data.length !== 0) {
        dispatch(registerCurrentClass(classes.data[0]));
      }
      dispatch(classesLoading(false));
      dispatch(classesFetchedSuccess(classes.data));
    } catch (e) {
      dispatch(classesHasErrored(true));
    }
  };
};

const addClass = (room: Class): addedClassAction => {
  return {
    type: ActionTypes.addClass,
    payload: room,
  };
};

// For registering the current class
const registerCurrentClass = (currentClass: Class): registerClassAction => {
  return {
    type: ActionTypes.registerCurrentClass,
    payload: currentClass,
  };
};

const removeCurrentClass = (): removeClassAction => {
  return {
    type: ActionTypes.removeCurrentClass,
    payload: null,
  };
};

const updateClasses = (classToUpdate: Class): updatedClassAction => {
  return {
    type: ActionTypes.updateClass,
    payload: classToUpdate,
  };
};

export {
  Class,
  registerClassAction,
  removeClassAction,
  removeCurrentClass,
  registerCurrentClass,
  ActionTypes,
  fetchClasses,
  addClass,
  classHasErroredAction,
  classLoadingAction,
  classFetchedAction,
  addedClassAction,
  updateClasses,
  updatedClassAction,
};
