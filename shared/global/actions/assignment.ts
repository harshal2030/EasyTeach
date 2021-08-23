enum ActionTypes {
  assignLoading = 'assign_loading',
  assignErrored = 'assign_errored',
  assignFetched = 'assign_fetched',
  assignAdd = 'assign_add',
  assignRemove = 'assign_remove',
}

type AssignRes = {
  id: string;
  title: string;
  description: string;
  file: string | null;
  dueDate: Date;
  allowLate: boolean;
};

type AssignPayload = {
  loading: boolean;
  errored: boolean;
  assignments: AssignRes[];
};

type AssignState = {
  [classId: string]: AssignPayload | undefined;
};

interface LoadingAction {
  type: ActionTypes.assignLoading;
  payload: {
    classId: string;
    loading: boolean;
  };
}

interface ErroredAction {
  type: ActionTypes.assignErrored;
  payload: {
    classId: string;
    errored: boolean;
  };
}

interface FetchedAssign {
  type: ActionTypes.assignFetched;
  payload: {
    classId: string;
    assignments: AssignRes[];
  };
}

const assignLoading = (loading: boolean, classId: string): LoadingAction => {
  return {
    type: ActionTypes.assignLoading,
    payload: {
      classId,
      loading,
    },
  };
};

const assignErrored = (errored: boolean, classId: string): ErroredAction => {
  return {
    type: ActionTypes.assignErrored,
    payload: {
      errored,
      classId,
    },
  };
};

const assignFetched = (
  assigns: AssignRes[],
  classId: string,
): FetchedAssign => {
  return {
    type: ActionTypes.assignFetched,
    payload: {
      assignments: assigns,
      classId,
    },
  };
};
