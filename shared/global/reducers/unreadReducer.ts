import {
  setUnreadAction,
  ActionTypes,
  UnreadState,
  addUnreadAction,
  setUnreadZeroAction,
} from '../actions/unreads';

const initialState: UnreadState = {
  data: {},
  fetched: false,
};

export const unreadReducer = (
  state: UnreadState = initialState,
  action: setUnreadAction | addUnreadAction | setUnreadZeroAction,
) => {
  switch (action.type) {
    case ActionTypes.setUnread:
      return action.payload;
    case ActionTypes.addUnread:
      const temp = {...state};
      const unread = (temp.data[action.payload.classId]?.unread || 0) + 1;
      temp.data[action.payload.classId] = {
        classId: action.payload.classId,
        unread,
      };

      return temp;
    case ActionTypes.setUnreadZero:
      const tempState = {...state};
      tempState.data[action.payload.classId] = {
        classId: action.payload.classId,
        unread: 0,
      };

      return tempState;
    default:
      return state;
  }
};
