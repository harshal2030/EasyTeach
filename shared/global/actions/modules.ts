/* eslint-disable no-undef */
import {Dispatch} from 'redux';
import axios from 'axios';
import {StoreState} from '..';
import {moduleUrl} from '../../utils/urls';

enum ActionTypes {
  fetchedModules = 'fetch_modules',
  loadingModules = 'loading_modules',
  erroredModules = 'errored_modules',
  addModule = 'add_module',
  updateModule = 'update_modules',
  removeModule = 'remove_module',
}

type Module = {
  id: string;
  title: string;
  classId: string;
};

type ModulePayload = {
  loading: boolean;
  errored: boolean;
  modules: Module[];
};

type ModuleState = {
  [classId: string]: ModulePayload | undefined;
};

interface ModuleErroredAction {
  type: ActionTypes.erroredModules;
  payload: {
    errored: boolean;
    classId: string;
  };
}

interface ModuleLoadingAction {
  type: ActionTypes.loadingModules;
  payload: {
    loading: boolean;
    classId: string;
  };
}

interface ModuleFetchedAction {
  type: ActionTypes.fetchedModules;
  payload: {
    classId: string;
    modules: Module[];
  };
}

interface AddModuleAction {
  type: ActionTypes.addModule;
  payload: {
    classId: string;
    module: Module;
  };
}

interface UpdateModuleAction {
  type: ActionTypes.updateModule;
  payload: {
    classId: string;
    module: Module;
  };
}

interface RemoveModuleAction {
  type: ActionTypes.removeModule;
  payload: {
    classId: string;
    moduleId: string;
  };
}

const addModule = (module: Module, classId: string): AddModuleAction => {
  return {
    type: ActionTypes.addModule,
    payload: {
      classId,
      module,
    },
  };
};

const updateModule = (module: Module, classId: string): UpdateModuleAction => {
  return {
    type: ActionTypes.updateModule,
    payload: {
      classId,
      module,
    },
  };
};

const removeModule = (
  moduleId: string,
  classId: string,
): RemoveModuleAction => {
  return {
    type: ActionTypes.removeModule,
    payload: {
      classId,
      moduleId,
    },
  };
};

const moduleErrored = (
  errored: boolean,
  classId: string,
): ModuleErroredAction => {
  return {
    type: ActionTypes.erroredModules,
    payload: {
      errored,
      classId,
    },
  };
};

const moduleLoading = (
  loading: boolean,
  classId: string,
): ModuleLoadingAction => {
  return {
    type: ActionTypes.loadingModules,
    payload: {
      loading,
      classId,
    },
  };
};

const moduleFetched = (
  modules: Module[],
  classId: string,
): ModuleFetchedAction => {
  return {
    type: ActionTypes.fetchedModules,
    payload: {
      modules,
      classId,
    },
  };
};

const fetchModules = (classId: string) => {
  return async (dispatch: Dispatch, getState: () => StoreState) => {
    const state = getState();

    if (state.modules[classId]) {
      return;
    }

    try {
      dispatch(moduleLoading(true, classId));

      const res = await axios.get<Module[]>(`${moduleUrl}/${classId}`, {
        headers: {
          Authorization: `Bearer ${state.token}`,
        },
      });

      dispatch(moduleFetched(res.data, classId));
    } catch (e) {
      dispatch(moduleLoading(false, classId));
      dispatch(moduleErrored(true, classId));
    }
  };
};

export {ActionTypes, fetchModules, removeModule, addModule, updateModule};

export type {
  ModuleErroredAction,
  ModuleFetchedAction,
  ModuleLoadingAction,
  RemoveModuleAction,
  AddModuleAction,
  UpdateModuleAction,
  ModulePayload,
  ModuleState,
  Module,
};
