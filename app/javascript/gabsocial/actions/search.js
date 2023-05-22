import api, { getLinks } from '../api'
import noop from 'lodash/noop'
import { fetchRelationships } from './accounts';
import { fetchGroupsSuccess, fetchGroupRelationships } from './groups'
import {
  importFetchedAccounts,
  importFetchedStatuses,
  importFetchedLists,
} from './importer';
import { importLinkCards } from './links'

export const SEARCH_CHANGE = 'SEARCH_CHANGE';
export const SEARCH_CLEAR  = 'SEARCH_CLEAR';
export const SEARCH_FOCUSED   = 'SEARCH_FOCUSED';

export const SEARCH_FETCH_REQUEST = 'SEARCH_FETCH_REQUEST';
export const SEARCH_FETCH_SUCCESS = 'SEARCH_FETCH_SUCCESS';
export const SEARCH_FETCH_FAIL    = 'SEARCH_FETCH_FAIL';

export const SEARCH_EXPAND_REQUEST = 'SEARCH_EXPAND_REQUEST'
export const SEARCH_EXPAND_SUCCESS = 'SEARCH_EXPAND_SUCCESS'
export const SEARCH_EXPAND_FAIL    = 'SEARCH_EXPAND_FAIL'

export const SEARCH_FILTER_SET = 'SEARCH_FILTER_SET'

export const SEARCH_TAB_SET = 'SEARCH_TAB_SET'

const processSearchResults = (dispatch, response) => {
  if (response.data.accounts) {
    dispatch(importFetchedAccounts(response.data.accounts))
    dispatch(fetchRelationships(response.data.accounts.map(item => item.id)))
  }
  if (response.data.statuses) {
    dispatch(importFetchedStatuses(response.data.statuses))
  }
  if (response.data.links) {
    dispatch(importLinkCards(response.data.links))
  }
  if (response.data.groups) {
    dispatch(fetchGroupsSuccess(response.data.groups))
    dispatch(fetchGroupRelationships(response.data.groups.map(item => item.id)))
  }
  if (response.data.lists) {
    dispatch(importFetchedLists(response.data.lists))
  }
}

/**
 * 
 */
export const changeSearch = (value) => ({
  type: SEARCH_CHANGE,
  value,
})

/**
 * 
 */
export const clearSearch = () => ({
  type: SEARCH_CLEAR,
})

/**
 * 
 */
export const submitSearch = () => (dispatch, getState) => {
  const state = getState()
  const value = state.getIn(['search', 'value'], '')
  const isLoading = state.getIn(['search', 'isLoading'])
  const tab = state.getIn(['search', 'tab']) || 'account'
  const onlyVerified = state.getIn(['search', 'filter', 'onlyVerified'])

  dispatch(fetchSearchRequest(tab))

  api(getState).get('/api/v3/search', {
    params: {
      type: tab,
      onlyVerified,
      q: value,
      resolve: true,
      page: 1,
    },
  }).then((response) => {
    const next = getLinks(response).refs.find(link => link.rel === 'next')
    processSearchResults(dispatch, response)
    dispatch(fetchSearchSuccess(response.data, next ? next.uri : null))
  }).catch((error) => {
    dispatch(fetchSearchFail(error))
  }) 
}

const fetchSearchRequest = (tab) => ({
  type: SEARCH_FETCH_REQUEST,
  tab,
})

const fetchSearchSuccess = (results, next) => ({
  type: SEARCH_FETCH_SUCCESS,
  results,
  next,
})

const fetchSearchFail = (error) => ({
  type: SEARCH_FETCH_FAIL,
  showToast: true,
  error,
})

/**
 * 
 */
 export const expandSearch = (tab, done = noop) => (dispatch, getState) => {
  const searchBlock = getState().getIn(['search'])
  const tabBlock = searchBlock.getIn(['results', tab])
  const next = !!tabBlock ? tabBlock.get('next') : null

  if (searchBlock.get('isLoading') || searchBlock.get('isError') || !next) {
    done()
    return
  }

  dispatch(expandSearchRequest(tab))

  api(getState).get(next).then((response) => {
    const next = getLinks(response).refs.find(link => link.rel === 'next')
    processSearchResults(dispatch, response)
    dispatch(expandSearchSuccess(response.data, tab, next ? next.uri : null))
    done()
  }).catch((error) => {
    dispatch(expandSearchFail(error, tab))
    done()
  })
}

const expandSearchRequest = (tab) => ({
  type: SEARCH_EXPAND_REQUEST,
  tab,
})

const expandSearchSuccess = (results, tab, next) => ({
  type: SEARCH_EXPAND_SUCCESS,
  results,
  tab,
  next,
})

const expandSearchFail = (error, tab) => ({
  type: SEARCH_EXPAND_FAIL,
  error,
  tab,
  showToast: true,
})

/**
 * 
 */
export const setFilter = (path, value, shouldSubmit) => (dispatch) => {
  dispatch({
    type: SEARCH_FILTER_SET,
    path: path,
    value: value,
  })
  if (shouldSubmit) dispatch(submitSearch())
}

export const toggleFocused = focused => ({ type: SEARCH_FOCUSED, focused })

/**
 * 
 */
export const setSearchTab = (tab, shouldSubmit) => (dispatch) => {
  dispatch({
    type: SEARCH_TAB_SET,
    tab,
  })
  if (shouldSubmit) dispatch(submitSearch())
}
