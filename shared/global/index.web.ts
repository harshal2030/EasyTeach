import {combineReducers, createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';

import {Class} from './actions/classes';
import {MsgState} from './actions/msgs';
import {QuizRes} from './actions/quiz';
import {Question} from './actions/questions';

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
import {questions} from './reducers/questionReducer';

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
  questions: Question[];
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
  questions,
});

export const store = createStore(reducers, applyMiddleware(thunk));
