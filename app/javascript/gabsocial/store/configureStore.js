import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import appReducer from '../reducers';
import loadingBarMiddleware from '../middleware/loading_bar';
import errorsMiddleware from '../middleware/errors';
import popoverMiddleware from '../middleware/popover'

export default function configureStore() {
  return createStore(appReducer, compose(applyMiddleware(
    popoverMiddleware,
    thunk,
    loadingBarMiddleware({ promiseTypeSuffixes: ['REQUEST', 'SUCCESS', 'FAIL'] }),
    errorsMiddleware(),
  ), window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f));
};
