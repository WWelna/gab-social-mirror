import api, { getLinks } from '../api'
import { importFetchedAccounts } from './importer'
import { me } from '../initial_state'

export const LIST_SUBSCRIBERS_FETCH_REQUEST = 'LIST_SUBSCRIBERS_FETCH_REQUEST'
export const LIST_SUBSCRIBERS_FETCH_SUCCESS = 'LIST_SUBSCRIBERS_FETCH_SUCCESS'
export const LIST_SUBSCRIBERS_FETCH_FAIL    = 'LIST_SUBSCRIBERS_FETCH_FAIL'

export const LIST_SUBSCRIBERS_EXPAND_REQUEST = 'LIST_SUBSCRIBERS_EXPAND_REQUEST'
export const LIST_SUBSCRIBERS_EXPAND_SUCCESS = 'LIST_SUBSCRIBERS_EXPAND_SUCCESS'
export const LIST_SUBSCRIBERS_EXPAND_FAIL    = 'LIST_SUBSCRIBERS_EXPAND_FAIL'

export const LIST_MEMBERS_FETCH_REQUEST = 'LIST_MEMBERS_FETCH_REQUEST'
export const LIST_MEMBERS_FETCH_SUCCESS = 'LIST_MEMBERS_FETCH_SUCCESS'
export const LIST_MEMBERS_FETCH_FAIL    = 'LIST_MEMBERS_FETCH_FAIL'

export const LIST_MEMBERS_EXPAND_REQUEST = 'LIST_MEMBERS_EXPAND_REQUEST'
export const LIST_MEMBERS_EXPAND_SUCCESS = 'LIST_MEMBERS_EXPAND_SUCCESS'
export const LIST_MEMBERS_EXPAND_FAIL    = 'LIST_MEMBERS_EXPAND_FAIL'

/**
 * List owner only function to fetch the subscribers to a list by id
 */
export const fetchListSubscribers = (listId) => (dispatch, getState) => {
  if (!me) return

  if (getState().getIn(['user_lists', 'list_subscribers', listId, 'isLoading'])) {
    return
  }

  dispatch(fetchListSubscribersRequest(listId))

  api(getState).get(`/api/v1/lists/${listId}/subscribers`).then((response) => {
    const next = getLinks(response).refs.find(link => link.rel === 'next')
    dispatch(importFetchedAccounts(response.data))
    dispatch(fetchListSubscribersSuccess(listId, response.data, next ? next.uri : null))
  }).catch((err) => dispatch(fetchListSubscribersFail(listId, err)))
}

const fetchListSubscribersRequest = (id) => ({
  type: LIST_SUBSCRIBERS_FETCH_REQUEST,
  id,
})

const fetchListSubscribersSuccess = (id, accounts, next) => ({
  type: LIST_SUBSCRIBERS_FETCH_SUCCESS,
  id,
  accounts,
  next,
})

const fetchListSubscribersFail = (id, error) => ({
  type: LIST_SUBSCRIBERS_FETCH_FAIL,
  showToast: true,
  id,
  error,
})

/**
 * List owner only function to expand the subscribers to a list by id
 */
 export const expandListSubscribers = (listId) => (dispatch, getState) => {
  if (!me) return

  const url = getState().getIn(['user_lists', 'list_subscribers', listId, 'next'], null)
  if (url === null || getState().getIn(['user_lists', 'list_subscribers', listId, 'isLoading'])) {
    return
  }

  dispatch(expandListSubscribersRequest(listId))

  api(getState).get(url).then((response) => {
    const next = getLinks(response).refs.find(link => link.rel === 'next')
    dispatch(importFetchedAccounts(response.data))
    dispatch(expandListSubscribersSuccess(listId, response.data, next ? next.uri : null))
  }).catch((err) => dispatch(expandListSubscribersFail(listId, err)))
}

const expandListSubscribersRequest = (id) => ({
  type: LIST_SUBSCRIBERS_EXPAND_REQUEST,
  id,
})

const expandListSubscribersSuccess = (id, accounts, next) => ({
  type: LIST_SUBSCRIBERS_EXPAND_SUCCESS,
  id,
  accounts,
  next,
})

const expandListSubscribersFail = (id, error) => ({
  type: LIST_SUBSCRIBERS_EXPAND_FAIL,
  showToast: true,
  id,
  error,
})

/**
 * Fetch the members of a list by id
 */
 export const fetchListMembers = (listId) => (dispatch, getState) => {
  if (!me) return

  if (getState().getIn(['user_lists', 'list_members', listId, 'isLoading'])) {
    return
  }

  dispatch(fetchListMembersRequest(listId))

  api(getState).get(`/api/v1/lists/${listId}/accounts`).then((response) => {
    const next = getLinks(response).refs.find(link => link.rel === 'next')
    dispatch(importFetchedAccounts(response.data))
    dispatch(fetchListMembersSuccess(listId, response.data, next ? next.uri : null)) 
  }).catch((err) => dispatch(fetchListMembersFail(listId, err)))
}

const fetchListMembersRequest = (id) => ({
  type: LIST_MEMBERS_FETCH_REQUEST,
  id,
})

const fetchListMembersSuccess = (id, accounts, next) => ({
  type: LIST_MEMBERS_FETCH_SUCCESS,
  id,
  accounts,
  next,
})

const fetchListMembersFail = (id, error) => ({
  type: LIST_MEMBERS_FETCH_FAIL,
  showToast: true,
  id,
  error,
})

/**
 * Expand the members of a list by id
 */
 export const expandListMembers = (listId) => (dispatch, getState) => {
  if (!me) return

  const url = getState().getIn(['user_lists', 'list_members', listId, 'next'], null)
  if (url === null || getState().getIn(['user_lists', 'list_members', listId, 'isLoading'])) {
    return
  }

  dispatch(expandListMembersRequest(listId))

  api(getState).get(url).then((response) => {
    const next = getLinks(response).refs.find(link => link.rel === 'next')
    dispatch(importFetchedAccounts(response.data))
    dispatch(expandListMembersSuccess(listId, response.data, next ? next.uri : null))
  }).catch((err) => dispatch(expandListMembersFail(listId, err)))
}

const expandListMembersRequest = (id) => ({
  type: LIST_MEMBERS_EXPAND_REQUEST,
  id,
})

const expandListMembersSuccess = (id, accounts, next) => ({
  type: LIST_MEMBERS_EXPAND_SUCCESS,
  id,
  accounts,
  next,
})

const expandListMembersFail = (id, error) => ({
  type: LIST_MEMBERS_EXPAND_FAIL,
  showToast: true,
  id,
  error,
})
