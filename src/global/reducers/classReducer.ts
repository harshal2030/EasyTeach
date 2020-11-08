import {
  ActionTypes,
  registerClassAction,
  Class,
  classHasErroredAction,
  classLoadingAction,
  classFetchedAction,
  addedClassAction,
  removeClassAction,
  updatedClassAction,
} from '../actions/classes';

const classHasErrored = (
  state: boolean = false,
  action: classHasErroredAction,
) => {
  switch (action.type) {
    case ActionTypes.classesHasErrored:
      return action.payload;
    default:
      return state;
  }
};

const classIsLoading = (state: boolean = true, action: classLoadingAction) => {
  switch (action.type) {
    case ActionTypes.classesLoading:
      return action.payload;
    default:
      return state;
  }
};

const classes = (
  state: Class[] = [],
  action: classFetchedAction | addedClassAction | updatedClassAction,
) => {
  switch (action.type) {
    case ActionTypes.classesFetchSuccess:
      return action.payload;
    case ActionTypes.addClass:
      return [...state, action.payload];
    case ActionTypes.updateClass:
      const temp = [...state];
      const classToUpdate = temp.findIndex(
        (cls) => cls.id === action.payload.id,
      );
      if (classToUpdate !== -1) {
        temp[classToUpdate] = action.payload;
      }
      return temp;
    default:
      return state;
  }
};

const classReducer = (
  state: Class | null = null,
  action: registerClassAction | removeClassAction,
) => {
  switch (action.type) {
    case ActionTypes.registerCurrentClass:
      return action.payload;
    case ActionTypes.removeCurrentClass:
      return action.payload;
    default:
      return state;
  }
};

export {classReducer, classHasErrored, classes, classIsLoading};
