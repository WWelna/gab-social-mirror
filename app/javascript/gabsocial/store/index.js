import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import appReducer from '../reducers'
import loadingBarMiddleware from '../middleware/loading_bar'
import errorsMiddleware from '../middleware/errors'
import popoverMiddleware from '../middleware/popover'
import { timelinesMiddleware } from './timelines'
import staleMiddleware from './stale'

// middleware are like functions that can react to messages
const middleware = applyMiddleware(
  popoverMiddleware,
  timelinesMiddleware,
  staleMiddleware,
  thunk, // thunk can allow actions to get state
  loadingBarMiddleware({ promiseTypeSuffixes: ['REQUEST', 'SUCCESS', 'FAIL'] }),
  errorsMiddleware()
)

// optionally add redux-devtools-extension
// https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd
// https://github.com/zalmoxisus/redux-devtools-extension
const enhancers =
  typeof window.__REDUX_DEVTOOLS_EXTENSION__ === 'function'
    ? compose(middleware, window.__REDUX_DEVTOOLS_EXTENSION__())
    : compose(middleware)

const store = createStore(appReducer, enhancers)

export default store
