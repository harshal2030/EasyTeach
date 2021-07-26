import {combineReducers, createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';

import {Class} from './actions/classes';
import {MsgState} from './actions/msgs';
import {QuizRes} from './actions/quiz';
import {UnreadState} from './actions/unreads';

import {tokenReducer, fcmReducer} from './reducers/tokenReducer';
import {profileReducer} from './reducers/profileReducer';
import {
  classReducer,
  classHasErrored,
  classIsLoading,
  classes,
} from './reducers/classReducer';
import {msgsReducer} from './reducers/msgReducer';
import {quizErrored, quizLoading, quizzes} from './reducers/quizReducer';
import {unreadReducer} from './reducers/unreadReducer';

export interface StoreState {
  token: string | null;
  profile: {name: string; username: string; avatar: string};
  currentClass: Class | null;
  classes: Class[];
  classIsLoading: boolean;
  classHasErrored: boolean;
  quizErrored: boolean;
  quizLoading: boolean;
  quizzes: {
    live: QuizRes[];
    expired: QuizRes[];
    scored: QuizRes[];
  };
  fcm: {
    os: string;
    fcmToken: string;
  } | null;
  msgs: MsgState;
  unreads: UnreadState;
}

export const reducers = combineReducers<StoreState>({
  token: tokenReducer,
  profile: profileReducer,
  currentClass: classReducer,
  classHasErrored,
  classIsLoading,
  classes,
  quizErrored,
  quizLoading,
  quizzes,
  fcm: fcmReducer,
  msgs: msgsReducer,
  unreads: unreadReducer,
});

export const store = createStore(reducers, applyMiddleware(thunk));
