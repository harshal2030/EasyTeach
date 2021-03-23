import {
  ActionTypes,
  msgErroredAction,
  msgLoadingAction,
  msgFetchedAction,
  addMsgAction,
  Msg,
} from '../actions/msgs';

const msgErrored = (state: boolean = false, action: msgErroredAction) => {
  switch (action.type) {
    case ActionTypes.msgsErrored:
      return action.payload;
    default:
      return state;
  }
};

const msgLoading = (state: boolean = true, action: msgLoadingAction) => {
  switch (action.type) {
    case ActionTypes.msgsLoading:
      return action.payload;
    default:
      return state;
  }
};

const msgs = (state: Msg[] = [], action: msgFetchedAction | addMsgAction) => {
  switch (action.type) {
    case ActionTypes.msgsFetched:
      return action.payload;
    case ActionTypes.addMsgs:
      return [action.payload, ...state];
    default:
      return state;
  }
};

export {msgErrored, msgLoading, msgs};
