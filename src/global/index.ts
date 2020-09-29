import {combineReducers, createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';

import {tokenReducer} from './reducers/tokenReducer';
import {profileReducer} from './reducers/profileReducer';

export interface StoreState {
  token: string | null;
  profile: {name: string; username: string};
}

export const reducers = combineReducers<StoreState>({
  token: tokenReducer,
  profile: profileReducer,
});

export const store = createStore(reducers, applyMiddleware(thunk));
