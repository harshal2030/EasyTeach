import {combineReducers, createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';

import {Class} from './actions/classes';
import {Msg} from './actions/msgs';
import {QuizRes} from './actions/quiz';

import {tokenReducer, fcmReducer} from './reducers/tokenReducer';
import {profileReducer} from './reducers/profileReducer';
import {
  classReducer,
  classHasErrored,
  classIsLoading,
  classes,
} from './reducers/classReducer';
import {msgErrored, msgLoading, msgs} from './reducers/msgReducer';
import {quizErrored, quizLoading, quizzes} from './reducers/quizReducer';

export interface StoreState {
  token: string | null;
  profile: {name: string; username: string; avatar: string};
  currentClass: Class | null;
  classes: Class[];
  classIsLoading: boolean;
  classHasErrored: boolean;
  quizErrored: {
    live: boolean;
    expired: boolean;
    scored: boolean;
  };
  quizLoading: {
    live: boolean;
    expired: boolean;
    scored: boolean;
  };
  quizzes: {
    live: QuizRes[];
    expired: QuizRes[];
    scored: QuizRes[];
  };
  fcm: {
    os: string;
    fcmToken: string;
  } | null;
  msgErrored: boolean;
  msgLoading: boolean;
  msgs: Msg[];
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
  msgErrored,
  msgLoading,
  msgs,
});

export const store = createStore(reducers, applyMiddleware(thunk));
