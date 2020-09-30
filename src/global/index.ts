import {combineReducers, createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';

import {Class} from './actions/classes';

import {tokenReducer} from './reducers/tokenReducer';
import {profileReducer} from './reducers/profileReducer';
import {classReducer} from './reducers/classReducer';

export interface StoreState {
  token: string | null;
  profile: {name: string; username: string};
  classes: Class | null;
}

export const reducers = combineReducers<StoreState>({
  token: tokenReducer,
  profile: profileReducer,
  classes: classReducer,
});

export const store = createStore(reducers, applyMiddleware(thunk));
