import {combineReducers, createStore, applyMiddleware} from 'redux';
import thunkMiddleware from 'redux-thunk';
import promiseMiddleware from 'redux-promise';
import info from './info';

const middleware = [thunkMiddleware, promiseMiddleware];

export default createStore(combineReducers({info}), {}, applyMiddleware(...middleware));
