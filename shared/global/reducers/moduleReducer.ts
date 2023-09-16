import {
  ActionTypes,
  ModuleErroredAction,
  ModuleFetchedAction,
  ModuleLoadingAction,
  ModuleState,
  AddModuleAction,
  UpdateModuleAction,
  RemoveModuleAction,
} from '../actions/modules';

const initialState: ModuleState = {};

type Action =
  | ModuleErroredAction
  | ModuleFetchedAction
  | ModuleLoadingAction
  | AddModuleAction
  | UpdateModuleAction
  | RemoveModuleAction;

const moduleReducer = (
  state: ModuleState = initialState,
  action: Action,
): ModuleState => {
  const module = state[action.payload?.classId] || {
    loading: true,
    errored: false,
    modules: [],
  };
  const {loading, errored, modules} = module;

  const tempState = {...state};

  switch (action.type) {
    case ActionTypes.erroredModules:
      tempState[action.payload.classId] = {
        loading,
        errored: action.payload.errored,
        modules,
      };

      return tempState;
    case ActionTypes.loadingModules:
      tempState[action.payload.classId] = {
        loading: action.payload.loading,
        errored,
        modules,
      };

      return tempState;
    case ActionTypes.fetchedModules:
      tempState[action.payload.classId] = {
        loading: false,
        errored,
        modules: action.payload.modules,
      };

      return tempState;
    case ActionTypes.addModule:
      tempState[action.payload.classId] = {
        loading,
        errored,
        modules: [
          ...tempState[action.payload.classId]!.modules,
          action.payload.module,
        ],
      };

      return tempState;
    case ActionTypes.updateModule:
      const moduleIndex = module.modules.findIndex(
        (val) => val.id === action.payload.module.id,
      );

      if (moduleIndex !== -1) {
        tempState[action.payload.classId]!.modules[moduleIndex] =
          action.payload.module;
      }

      return tempState;
    case ActionTypes.removeModule:
      tempState[action.payload.classId] = {
        loading,
        errored,
        modules: modules.filter((val) => val.id !== action.payload.moduleId),
      };

      return tempState;
    default:
      return state;
  }
};

export {moduleReducer};
