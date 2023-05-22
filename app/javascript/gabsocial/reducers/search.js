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
  SEARCH_TAB_FEED,
  SEARCH_TAB_HASHTAG,
  searchTabs
} from '../constants'
import {
  fromJS,
  Map as ImmutableMap,
  List as ImmutableList,
} from 'immutable'
import { unique } from '../store/timelines'
import { parseQuerystring } from '../utils/querystring'

const initialValue = parseQuerystring({ q: '' }).q
const searchTab = searchTabs.find(item => item.to === window.location.pathname)

const initialState = ImmutableMap({
  value: initialValue,
  isLoading: false,
  isError: false,
  tab: (searchTab && searchTab.tab) || '',
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
    [SEARCH_TAB_FEED]: ImmutableMap({
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
    })
  case SEARCH_CLEAR:
    return initialState
  case SEARCH_EXPAND_SUCCESS:
  case SEARCH_FETCH_SUCCESS:
    return state.withMutations((mutable) => {
      if (action.results.accounts) {
        mutable.updateIn(['results', SEARCH_TAB_ACCOUNT, 'items'], (list) => list.concat(action.results.accounts.map(item => item.id)).filter(unique))
        mutable.setIn(['results', SEARCH_TAB_ACCOUNT, 'isFetched'], true)
        mutable.setIn(['results', SEARCH_TAB_ACCOUNT, 'next'], action.next)
      }
      if (action.results.statuses) {
        mutable.updateIn(['results', SEARCH_TAB_STATUS, 'items'], (list) => list.concat(action.results.statuses.map(item => item.id)).filter(unique))
        mutable.setIn(['results', SEARCH_TAB_STATUS, 'isFetched'], true)
        mutable.setIn(['results', SEARCH_TAB_STATUS, 'next'], action.next)
      }
      if (action.results.groups) {
        mutable.updateIn(['results', SEARCH_TAB_GROUP, 'items'], (list) => list.concat(action.results.groups.map(item => item.id)).filter(unique))
        mutable.setIn(['results', SEARCH_TAB_GROUP, 'isFetched'], true)
        mutable.setIn(['results', SEARCH_TAB_GROUP, 'next'], action.next)
      }
      if (action.results.links) {
        mutable.updateIn(['results', SEARCH_TAB_LINK, 'items'], (list) => list.concat(action.results.links.map(item => item.id)).filter(unique))
        mutable.setIn(['results', SEARCH_TAB_LINK, 'isFetched'], true)
        mutable.setIn(['results', SEARCH_TAB_LINK, 'next'], action.next)
      }
      if (action.results.lists) {
        mutable.updateIn(['results', SEARCH_TAB_FEED, 'items'], (list) => list.concat(action.results.lists.map(item => item.id)).filter(unique))
        mutable.setIn(['results', SEARCH_TAB_FEED, 'isFetched'], true)
        mutable.setIn(['results', SEARCH_TAB_FEED, 'next'], action.next)
      }
      if (action.results.hashtags) {
        mutable.setIn(['results', SEARCH_TAB_HASHTAG, 'items'], ImmutableList(fromJS(action.results.hashtags)).filter(unique))
        mutable.setIn(['results', SEARCH_TAB_HASHTAG, 'isFetched'], true)
        mutable.setIn(['results', SEARCH_TAB_HASHTAG, 'next'], null)
      }
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
