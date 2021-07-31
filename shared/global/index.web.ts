import {combineReducers, createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';

import {Class} from './actions/classes';
import {MsgState} from './actions/msgs';
import {QuizRes} from './actions/quiz';
import {Question} from './actions/questions';
import {UnreadState} from './actions/unreads';

import {tokenReducer, fcmReducer} from './reducers/tokenReducer';
import {profileReducer} from './reducers/profileReducer';
import {classReducer, classesReducer} from './reducers/classReducer';
import {msgsReducer} from './reducers/msgReducer';
import {quizErrored, quizLoading, quizzes} from './reducers/quizReducer';
import {questions} from './reducers/questionReducer';
import {unreadReducer} from './reducers/unreadReducer';

export interface StoreState {
  token: string | null;
  profile: {name: string; username: string; avatar: string};
  currentClass: Class | null;
  classes: {
    loading: boolean;
    errored: boolean;
    classes: Class[];
  };
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
  unreads: UnreadState;
}

export const reducers = combineReducers<StoreState>({
  token: tokenReducer,
  profile: profileReducer,
  currentClass: classReducer,
  classes: classesReducer,
  quizErrored,
  quizLoading,
  quizzes,
  fcm: fcmReducer,
  msgs: msgsReducer,
  questions,
  unreads: unreadReducer,
});

export const store = createStore(reducers, applyMiddleware(thunk));
