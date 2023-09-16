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
  revokeCurrentClassAction,
} from '../actions/classes';

type classState = {
  loading: boolean;
  errored: boolean;
  classes: Class[];
};

const initialState: classState = {
  loading: true,
  errored: false,
  classes: [],
};

type ClassesAction =
  | classFetchedAction
  | addedClassAction
  | updatedClassAction
  | updateClassOwnerAction
  | removeClassAction
  | classHasErroredAction
  | classLoadingAction;

const classesReducer = (
  state: classState = initialState,
  action: ClassesAction,
): classState => {
  const {loading, errored, classes} = state;

  switch (action.type) {
    case ActionTypes.classesLoading:
      return {
        loading: action.payload,
        errored,
        classes,
      };
    case ActionTypes.classesHasErrored:
      return {
        loading,
        errored: action.payload,
        classes,
      };
    case ActionTypes.classesFetchSuccess:
      return {
        loading: false,
        errored,
        classes: action.payload.classes,
      };
    case ActionTypes.addClass:
      return {
        loading,
        errored,
        classes: [...classes, action.payload],
      };
    case ActionTypes.updateClass:
      const temp = [...state.classes];
      const classToUpdate = temp.findIndex(
        (cls) => cls.id === action.payload.id,
      );
      if (classToUpdate !== -1) {
        temp[classToUpdate] = action.payload;
      }
      return {
        loading,
        errored,
        classes: temp,
      };
    case ActionTypes.removeClass:
      return {
        loading,
        errored,
        classes: classes.filter((cls) => cls.id !== action.payload),
      };
    case ActionTypes.updateClassOwner:
      const tempClass = [...state.classes];
      tempClass.forEach((cls) => {
        if (cls.owner.username === action.payload.oldUsername) {
          cls.owner = action.payload.newUser;
        }
      });

      return {
        loading,
        errored,
        classes: tempClass,
      };
    default:
      return state;
  }
};

const classReducer = (
  state: Class | null = null,
  action:
    | registerClassAction
    | removeCurrentClassAction
    | revokeCurrentClassAction,
) => {
  switch (action.type) {
    case ActionTypes.registerCurrentClass:
      return action.payload;
    case ActionTypes.removeCurrentClass:
      return action.payload;
    case ActionTypes.revokeCurrentClass:
      const temp = action.payload;
      if (temp.length !== 0) {
        return temp[0];
      }

      return null;
    default:
      return state;
  }
};

export {classReducer, classesReducer};
