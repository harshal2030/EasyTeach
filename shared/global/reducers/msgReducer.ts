import {
  ActionTypes,
  msgErroredAction,
  msgLoadingAction,
  msgFetchedAction,
  addMsgAction,
  removeMsgAction,
  MsgState,
  endMsgAction,
} from '../actions/msgs';

type Action =
  | msgErroredAction
  | addMsgAction
  | msgFetchedAction
  | endMsgAction
  | removeMsgAction
  | msgLoadingAction;

const initialState: MsgState = {};

const msgsReducer = (
  state: MsgState = initialState,
  action: Action,
): MsgState => {
  const classMsgs = state[action.payload?.classId] || {
    loading: true,
    errored: false,
    end: false,
    msgs: [],
  };
  const {loading, errored, msgs, end} = classMsgs;
  const tempState = {...state};

  switch (action.type) {
    case ActionTypes.msgsErrored:
      const tempErrored = {
        loading,
        errored: action.payload.errored,
        msgs,
        end,
      };
      tempState[action.payload.classId] = tempErrored;

      return tempState;
    case ActionTypes.msgsEnd:
      const tempEnd = {
        loading,
        errored,
        msgs,
        end: action.payload.end,
      };

      tempState[action.payload.classId] = tempEnd;

      return tempState;
    case ActionTypes.msgsLoading:
      const tempLoad = {
        loading: action.payload.loading,
        errored,
        end,
        msgs,
      };

      tempState[action.payload.classId] = tempLoad;

      return tempState;
    case ActionTypes.msgsFetched:
      const tempMsg = {
        loading,
        errored,
        end,
        msgs: [...msgs, ...action.payload.msgs],
      };

      tempState[action.payload.classId] = tempMsg;

      return tempState;
    case ActionTypes.addMsgs:
      const tempAddMsg = {
        loading,
        errored,
        end,
        msgs: [action.payload.msg, ...msgs],
      };

      tempState[action.payload.classId] = tempAddMsg;

      return tempState;
    case ActionTypes.removeMsg:
      const removedMsgs = {
        loading,
        errored,
        end,
        msgs: msgs.filter((msg) => msg.id !== action.payload.msgId),
      };

      tempState[action.payload.classId] = removedMsgs;

      return tempState;
    default:
      return state;
  }
};

export {msgsReducer};
