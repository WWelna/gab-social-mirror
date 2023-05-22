import {
  SEARCH_CHANGE,
  SEARCH_CLEAR,
  SEARCH_FETCH_REQUEST,
  SEARCH_FETCH_FAIL,
  SEARCH_FETCH_SUCCESS,
  SEARCH_FILTER_SET,
  SEARCH_TAB_SET,
  SEARCH_FOCUSED,
  SEARCH_EXPAND_REQUEST,
  SEARCH_EXPAND_SUCCESS,
  SEARCH_EXPAND_FAIL,
} from '../actions/search'
import {
  SEARCH_TAB_ACCOUNT,
  SEARCH_TAB_STATUS,
  SEARCH_TAB_GROUP,
  SEARCH_TAB_LINK,
  SEARCH_TAB_LIST,
  SEARCH_TAB_HASHTAG,
} from '../constants'
import {
  fromJS,
  Map as ImmutableMap,
  List as ImmutableList,
} from 'immutable'

const initialState = ImmutableMap({
  value: '',
  submitted: false,
  isLoading: false,
  isError: false,
  tab: '',
  results: ImmutableMap({
    [SEARCH_TAB_ACCOUNT]: ImmutableMap({
      isFetched: false,
      items: ImmutableList(),
      next: null,
    }),
    [SEARCH_TAB_STATUS]: ImmutableMap({
      isFetched: false,
      items: ImmutableList(),
      next: null,
    }),
    [SEARCH_TAB_GROUP]: ImmutableMap({
      isFetched: false,
      items: ImmutableList(),
      next: null,
    }),
    [SEARCH_TAB_LINK]: ImmutableMap({
      isFetched: false,
      items: ImmutableList(),
      next: null,
    }),
    [SEARCH_TAB_LIST]: ImmutableMap({
      isFetched: false,
      items: ImmutableList(),
      next: null,
    }),
    [SEARCH_TAB_HASHTAG]: ImmutableMap({
      isFetched: false,
      items: ImmutableList(),
      next: null,
    }),
  }),
  filter: ImmutableMap({
    onlyVerified: false,
  }),
  focused: false
})

export default function search(state = initialState, action) {
  switch(action.type) {
  case SEARCH_FETCH_REQUEST:
    return state.withMutations((map) => {
      map.set('isError', false)
      map.set('isLoading', true)
      // reset results
      map.set('results', initialState.get('results'))
    })
  case SEARCH_EXPAND_FAIL:
  case SEARCH_FETCH_FAIL:
    return state.withMutations((map) => {
      map.set('isError', true)
      map.set('isLoading', false)
    })
  case SEARCH_CHANGE:
    return state.withMutations((map) => {
      map.set('value', action.value)
      map.set('submitted', false)
    })
  case SEARCH_CLEAR:
    return initialState
  case SEARCH_EXPAND_SUCCESS:
  case SEARCH_FETCH_SUCCESS:
    return state.withMutations((mutable) => {
      if (action.results.accounts) {
        mutable.updateIn(['results', SEARCH_TAB_ACCOUNT, 'items'], (list) => list.concat(action.results.accounts.map(item => item.id)))
        mutable.setIn(['results', SEARCH_TAB_ACCOUNT, 'isFetched'], true)
        mutable.setIn(['results', SEARCH_TAB_ACCOUNT, 'next'], action.next)
      }
      if (action.results.statuses) {
        mutable.updateIn(['results', SEARCH_TAB_STATUS, 'items'], (list) => list.concat(action.results.statuses.map(item => item.id)))
        mutable.setIn(['results', SEARCH_TAB_STATUS, 'isFetched'], true)
        mutable.setIn(['results', SEARCH_TAB_STATUS, 'next'], action.next)
      }
      if (action.results.groups) {
        mutable.updateIn(['results', SEARCH_TAB_GROUP, 'items'], (list) => list.concat(action.results.groups.map(item => item.id)))
        mutable.setIn(['results', SEARCH_TAB_GROUP, 'isFetched'], true)
        mutable.setIn(['results', SEARCH_TAB_GROUP, 'next'], action.next)
      }
      if (action.results.links) {
        mutable.updateIn(['results', SEARCH_TAB_LINK, 'items'], (list) => list.concat(action.results.links.map(item => item.id)))
        mutable.setIn(['results', SEARCH_TAB_LINK, 'isFetched'], true)
        mutable.setIn(['results', SEARCH_TAB_LINK, 'next'], action.next)
      }
      if (action.results.lists) {
        mutable.updateIn(['results', SEARCH_TAB_LIST, 'items'], (list) => list.concat(action.results.lists.map(item => item.id)))
        mutable.setIn(['results', SEARCH_TAB_LIST, 'isFetched'], true)
        mutable.setIn(['results', SEARCH_TAB_LIST, 'next'], action.next)
      }
      if (action.results.hashtags) {
        mutable.setIn(['results', SEARCH_TAB_HASHTAG, 'items'], ImmutableList(fromJS(action.results.hashtags)))
        mutable.setIn(['results', SEARCH_TAB_HASHTAG, 'isFetched'], true)
        mutable.setIn(['results', SEARCH_TAB_HASHTAG, 'next'], null)
      }
      
      mutable.set('submitted', true)
      mutable.set('isLoading', false)
      mutable.set('isError', false)
    })
  case SEARCH_EXPAND_REQUEST:
    return state.withMutations((map) => {
      map.set('isLoading', false)
    })
  case SEARCH_FILTER_SET:
    return state.withMutations((mutable) => {
      mutable.setIn(['filter', action.path], action.value)
    })
  case SEARCH_TAB_SET:
    return state.set('tab', action.tab)
  case SEARCH_FOCUSED:
    return state.set('focused', action.focused || (!state.get('focused')))
  default:
    return state
  }
}
