import {combineReducers, createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';

import {Class} from './actions/classes';
import {QuizRes} from './actions/quiz';

import {tokenReducer} from './reducers/tokenReducer';
import {profileReducer} from './reducers/profileReducer';
import {
  classReducer,
  classHasErrored,
  classIsLoading,
  classes,
} from './reducers/classReducer';
import {quizErrored, quizLoading, quizzes} from './reducers/quizReducer';

export interface StoreState {
  token: string | null;
  profile: {name: string; username: string; avatar: string};
  currentClass: Class | null;
  classes: Class[];
  classIsLoading: boolean;
  classHasErrored: boolean;
  quizErrored: boolean;
  quizLoading: boolean;
  quizzes: QuizRes[];
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
});

export const store = createStore(reducers, applyMiddleware(thunk));
