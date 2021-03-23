import {
  ActionTypes,
  registerClassAction,
  Class,
  classHasErroredAction,
  classLoadingAction,
  classFetchedAction,
  addedClassAction,
  removeCurrentClassAction,
  updatedClassAction,
  removeClassAction,
  updateClassOwnerAction,
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

type ClassesAction =
  | classFetchedAction
  | addedClassAction
  | updatedClassAction
  | updateClassOwnerAction
  | removeClassAction;

const classes = (state: Class[] = [], action: ClassesAction) => {
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
    case ActionTypes.removeClass:
      return state.filter((cls) => cls.id !== action.payload);
    case ActionTypes.updateClassOwner:
      const tempClass = [...state];
      tempClass.forEach((cls) => {
        if (cls.owner.username === action.payload.oldUsername) {
          cls.owner = action.payload.newUser;
        }
      });

      return tempClass;
    default:
      return state;
  }
};

const classReducer = (
  state: Class | null = null,
  action: registerClassAction | removeCurrentClassAction,
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