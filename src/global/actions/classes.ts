import {Dispatch} from 'redux';
import axios from 'axios';
import {classUrl} from '../../utils/urls';

/* eslint-disable no-undef */
enum ActionTypes {
  registerCurrentClass = 'registerCurrentClass',
  classesHasErrored = 'classes_has_errored',
  classesLoading = 'classes_loading',
  classesFetchSuccess = 'classes_fetched_success',
}

interface Class {
  name: string;
  about: string;
  owner: string;
  id: string;
  photo: string;
  collaborators: string[];
}

// return action types of each action
interface registerClassAction {
  type: ActionTypes.registerCurrentClass;
  payload: Class;
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
      dispatch(classesLoading(false));
      dispatch(classesFetchedSuccess(classes.data));
    } catch (e) {
      dispatch(classesHasErrored(true));
    }
  };
};

// For registering the current class
const registerCurrentClass = (currentClass: Class): registerClassAction => {
  return {
    type: ActionTypes.registerCurrentClass,
    payload: currentClass,
  };
};

export {
  Class,
  registerClassAction,
  registerCurrentClass,
  ActionTypes,
  fetchClasses,
  classHasErroredAction,
  classLoadingAction,
  classFetchedAction,
};
