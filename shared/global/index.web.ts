import {combineReducers, createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';

import {Class} from './actions/classes';
import {MsgState} from './actions/msgs';
import {QuizState} from './actions/quiz';
import {Question} from './actions/questions';
import {UnreadState} from './actions/unreads';
import {PeopleState} from './actions/people';

import {tokenReducer, fcmReducer} from './reducers/tokenReducer';
import {profileReducer} from './reducers/profileReducer';
import {classReducer, classesReducer} from './reducers/classReducer';
import {msgsReducer} from './reducers/msgReducer';
import {quizzesReducer} from './reducers/quizReducer';
import {questions} from './reducers/questionReducer';
import {unreadReducer} from './reducers/unreadReducer';
import {peopleReducer} from './reducers/peopleReducer';

export interface StoreState {
  token: string | null;
  profile: {name: string; username: string; avatar: string};
  currentClass: Class | null;
  classes: {
    loading: boolean;
    errored: boolean;
    classes: Class[];
  };
  quizzes: QuizState;
  fcm: {
    os: string;
    fcmToken: string;
  } | null;
  msgs: MsgState;
  questions: Question[];
  unreads: UnreadState;
  people: PeopleState;
}

export const reducers = combineReducers<StoreState>({
  token: tokenReducer,
  profile: profileReducer,
  currentClass: classReducer,
  classes: classesReducer,
  quizzes: quizzesReducer,
  fcm: fcmReducer,
  msgs: msgsReducer,
  questions,
  unreads: unreadReducer,
  people: peopleReducer,
});

export const store = createStore(reducers, applyMiddleware(thunk));
