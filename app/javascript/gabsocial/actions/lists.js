import api from '../api'
import isObject from 'lodash/isObject'
import { importFetchedAccounts } from './importer'
import { List as ImmutableList } from 'immutable'
import { resetListEditor } from './list_editor'
import { me } from '../initial_state'
import {
  LISTS_SORTING_TYPE_ALPHABETICAL,
  LISTS_SORTING_TYPE_SUBS_DESC,
} from '../constants'

export const LIST_FETCH_REQUEST = 'LIST_FETCH_REQUEST'
export const LIST_FETCH_SUCCESS = 'LIST_FETCH_SUCCESS'
export const LIST_FETCH_FAIL    = 'LIST_FETCH_FAIL'

export const LISTS_FETCH_REQUEST = 'LISTS_FETCH_REQUEST'
export const LISTS_FETCH_SUCCESS = 'LISTS_FETCH_SUCCESS'
export const LISTS_FETCH_FAIL    = 'LISTS_FETCH_FAIL'

export const LIST_CREATE_REQUEST = 'LIST_CREATE_REQUEST'
export const LIST_CREATE_SUCCESS = 'LIST_CREATE_SUCCESS'
export const LIST_CREATE_FAIL    = 'LIST_CREATE_FAIL'

export const LIST_UPDATE_REQUEST = 'LIST_UPDATE_REQUEST'
export const LIST_UPDATE_SUCCESS = 'LIST_UPDATE_SUCCESS'
export const LIST_UPDATE_FAIL    = 'LIST_UPDATE_FAIL'

export const LIST_DELETE_REQUEST = 'LIST_DELETE_REQUEST'
export const LIST_DELETE_SUCCESS = 'LIST_DELETE_SUCCESS'
export const LIST_DELETE_FAIL    = 'LIST_DELETE_FAIL'

export const LIST_EDITOR_ADD_REQUEST = 'LIST_EDITOR_ADD_REQUEST'
export const LIST_EDITOR_ADD_SUCCESS = 'LIST_EDITOR_ADD_SUCCESS'
export const LIST_EDITOR_ADD_FAIL    = 'LIST_EDITOR_ADD_FAIL'

export const LIST_EDITOR_REMOVE_REQUEST = 'LIST_EDITOR_REMOVE_REQUEST'
export const LIST_EDITOR_REMOVE_SUCCESS = 'LIST_EDITOR_REMOVE_SUCCESS'
export const LIST_EDITOR_REMOVE_FAIL    = 'LIST_EDITOR_REMOVE_FAIL'

export const LIST_ADDER_LISTS_FETCH_REQUEST = 'LIST_ADDER_LISTS_FETCH_REQUEST'
export const LIST_ADDER_LISTS_FETCH_SUCCESS = 'LIST_ADDER_LISTS_FETCH_SUCCESS'
export const LIST_ADDER_LISTS_FETCH_FAIL    = 'LIST_ADDER_LISTS_FETCH_FAIL'

export const LIST_ACCOUNTS_MEMBER_LEAVE_REQUEST = 'LIST_ACCOUNTS_MEMBER_LEAVE_REQUEST'
export const LIST_ACCOUNTS_MEMBER_LEAVE_SUCCESS = 'LIST_ACCOUNTS_MEMBER_LEAVE_SUCCESS'
export const LIST_ACCOUNTS_MEMBER_LEAVE_FAIL    = 'LIST_ACCOUNTS_MEMBER_LEAVE_FAIL'

export const LIST_SUBSCRIBE_REQUEST = 'LIST_SUBSCRIBE_REQUEST'
export const LIST_SUBSCRIBE_SUCCESS = 'LIST_SUBSCRIBE_SUCCESS'
export const LIST_SUBSCRIBE_FAIL    = 'LIST_SUBSCRIBE_FAIL'

export const LIST_UNSUBSCRIBE_REQUEST = 'LIST_UNSUBSCRIBE_REQUEST'
export const LIST_UNSUBSCRIBE_SUCCESS = 'LIST_UNSUBSCRIBE_SUCCESS'
export const LIST_UNSUBSCRIBE_FAIL    = 'LIST_UNSUBSCRIBE_FAIL'

export const LIST_RELATIONSHIPS_FETCH_REQUEST = 'LIST_RELATIONSHIPS_FETCH_REQUEST'
export const LIST_RELATIONSHIPS_FETCH_SUCCESS = 'LIST_RELATIONSHIPS_FETCH_SUCCESS'
export const LIST_RELATIONSHIPS_FETCH_FAIL    = 'LIST_RELATIONSHIPS_FETCH_FAIL'

export const LIST_SORT = 'LIST_SORT'


/**
 * Fetch list by id
 */
export const fetchList = (id) => (dispatch, getState) => {
  // if list exists already, return
  if (getState().getIn(['lists', 'items', id])) return

  dispatch(fetchListRequest(id))

  api(getState).get(`/api/v1/lists/${id}`)
    .then(({ data }) => {
      dispatch(fetchListSuccess(data))
      if (data) {
        if (data.account) dispatch(importFetchedAccounts([data.account]))
      }
    })
    .catch((err) => dispatch(fetchListFail(id, err)))
}

const fetchListRequest = id => ({
  type: LIST_FETCH_REQUEST,
  id,
})

const fetchListSuccess = list => ({
  type: LIST_FETCH_SUCCESS,
  list,
})

const fetchListFail = (id, error) => ({
  type: LIST_FETCH_FAIL,
  id,
  error,
})

/**
 * Fetch all lists by tab
 */
export const fetchLists = (tab) => (dispatch, getState) => {
  const block = getState().getIn(['lists_lists', tab])
  // must be valid tab
  if (!block) return false
  // if already got or fetched dont do again
  if (block && (block.get('isLoading') || block.get('isFetched'))) return false

  dispatch(fetchListsRequest(tab))

  api(getState).get(`/api/v2/lists?type=${tab}`).then(({ data }) => {
    dispatch(fetchListsSuccess(data, tab))
    const accts = Array.isArray(data) ? data.map((list) => list.account) : null
    if (accts) dispatch(importFetchedAccounts(accts))
  }).catch((err) => {
    dispatch(fetchListsFail(err, tab))
  }) 
}

const fetchListsRequest = (tab) => ({
  type: LISTS_FETCH_REQUEST,
  tab,
})

const fetchListsSuccess = (data, tab) => ({
  type: LISTS_FETCH_SUCCESS,
  tab,
  data,
})

const fetchListsFail = (error, tab) => ({
  type: LISTS_FETCH_FAIL,
  showToast: false,
  tab,
  error,
})

/**
 * Create a list with given params
 */
 export const createList = (title, visibility, shouldReset, routerHistory) => (dispatch, getState) => {
  if (!me) return
  // private by default
  if (!visibility) visibility = 'private'

  dispatch(createListRequest())

  api(getState).post('/api/v1/lists', { title, visibility }).then(({ data }) => {
    dispatch(createListSuccess(data))
    if (shouldReset) dispatch(resetListEditor())
    if (routerHistory && data) routerHistory.push(`/feeds/${data.id}`) 
  }).catch((err) => dispatch(createListFail(err)))
}

const createListRequest = () => ({
  type: LIST_CREATE_REQUEST,
})

const createListSuccess = (list) => ({
  type: LIST_CREATE_SUCCESS,
  showToast: true,
  list,
})

const createListFail = (error) => ({
  type: LIST_CREATE_FAIL,
  showToast: true,
  error,
})

/**
 * Update list with id with given params
 */
 export const updateList = (id, title, slug, visibility, shouldReset) => (dispatch, getState) => {
  if (!me) return

  dispatch(updateListRequest(id))

  api(getState).put(`/api/v1/lists/${id}`, {
    slug,
    title,
    visibility,
  }).then(({ data }) => {
    dispatch(updateListSuccess(data))

    if (shouldReset) dispatch(resetListEditor())
  }).catch((err) => dispatch(updateListFail(id, err)))
}

const updateListRequest = id => ({
  type: LIST_UPDATE_REQUEST,
  id,
})

const updateListSuccess = list => ({
  type: LIST_UPDATE_SUCCESS,
  showToast: true,
  list,
})

const updateListFail = (id, error) => ({
  type: LIST_UPDATE_FAIL,
  showToast: true,
  id,
  error,
})

/**
 * Delete a list with given id
 */
export const deleteList = (id) => (dispatch, getState) => {
  if (!me) return

  dispatch(deleteListRequest(id))

  api(getState).delete(`/api/v1/lists/${id}`)
    .then(() => dispatch(deleteListSuccess(id)))
    .catch((err) => dispatch(deleteListFail(id, err)))
}

const deleteListRequest = (id) => ({
  type: LIST_DELETE_REQUEST,
  id,
})

const deleteListSuccess = (id) => ({
  type: LIST_DELETE_SUCCESS,
  showToast: true,
  id,
})

const deleteListFail = (id, error) => ({
  type: LIST_DELETE_FAIL,
  showToast: true,
  id,
  error,
})

/**
 *
 */
export const addToList = (listId, accountId) => (dispatch, getState) => {
  if (!me) return

  dispatch(addToListRequest(listId, accountId))

  api(getState).post(`/api/v1/lists/${listId}/accounts`, { account_id: accountId })
    .then(({data}) => {
      dispatch(addToListSuccess(listId, accountId, data.member_count))
    })
    .catch((err) => dispatch(addToListFail(listId, accountId, err)))
}

const addToListRequest = (listId, accountId) => ({
  type: LIST_EDITOR_ADD_REQUEST,
  listId,
  accountId,
})

const addToListSuccess = (listId, accountId, memberCount) => ({
  type: LIST_EDITOR_ADD_SUCCESS,
  showToast: true,
  listId,
  accountId,
  memberCount,
})

const addToListFail = (listId, accountId, error) => ({
  type: LIST_EDITOR_ADD_FAIL,
  showToast: true,
  listId,
  accountId,
  error,
})

/**
 *
 */
export const removeFromList = (listId, accountId) => (dispatch, getState) => {
  if (!me) return

  dispatch(removeFromListRequest(listId, accountId))

  api(getState).delete(`/api/v1/lists/${listId}/accounts`, { params: { account_id: accountId } })
    .then(({data}) => {
      dispatch(removeFromListSuccess(listId, accountId, data.member_count))
    })
    .catch((err) => dispatch(removeFromListFail(listId, accountId, err)))
}

const removeFromListRequest = (listId, accountId) => ({
  type: LIST_EDITOR_REMOVE_REQUEST,
  listId,
  accountId,
})

const removeFromListSuccess = (listId, accountId, memberCount) => ({
  type: LIST_EDITOR_REMOVE_SUCCESS,
  showToast: true,
  listId,
  accountId,
  memberCount,
})

const removeFromListFail = (listId, accountId, error) => ({
  type: LIST_EDITOR_REMOVE_FAIL,
  showToast: true,
  listId,
  accountId,
  error,
})

/**
 *
 */
export const fetchAccountLists = (accountId) => (dispatch, getState) => {
  if (!me) return

  dispatch(fetchAccountListsRequest(accountId))

  api(getState).get(`/api/v1/accounts/${accountId}/lists`)
    .then(({ data }) => dispatch(fetchAccountListsSuccess(accountId, data)))
    .catch((err) => dispatch(fetchAccountListsFail(accountId, err)))
}

const fetchAccountListsRequest = (id) => ({
  type:LIST_ADDER_LISTS_FETCH_REQUEST,
  id,
})

const fetchAccountListsSuccess = (id, lists) => ({
  type: LIST_ADDER_LISTS_FETCH_SUCCESS,
  id,
  lists,
})

const fetchAccountListsFail = (id, error) => ({
  type: LIST_ADDER_LISTS_FETCH_FAIL,
  showToast: true,
  id,
  error,
})

/**
 * 
 */
 export const sortLists = (tab, sortType) => (dispatch, getState) => {
  const listIdsByTab = getState().getIn(['lists_lists', tab, 'items'], ImmutableList()).toJS()
  const listsByTab = []
  
  for (let i = 0; i < listIdsByTab.length; i++) {
    const listId = listIdsByTab[i]
    const list = getState().getIn(['lists', 'items', listId])
    if (list) {
      listsByTab.push(list.toJS())
    }
  }

  if (sortType === LISTS_SORTING_TYPE_ALPHABETICAL) {
    listsByTab.sort((a, b) => a.title.localeCompare(b.title))
  } else if (sortType === LISTS_SORTING_TYPE_SUBS_DESC) {
    listsByTab.sort((a, b) => (a.subscriber_count < b.subscriber_count) ? 1 : -1)
  }

  const sortedListsIdsByTab = listsByTab.map((list) => list.id)

  dispatch(listsSort(tab, sortedListsIdsByTab))
}

export const listsSort = (tab, listIds) =>({
  type: LIST_SORT,
  tab,
  listIds,
})

/**
 *
 */
export const subscribeToList = (listId) => (dispatch, getState) => {
  if (!me) return

  dispatch(subscribeToListRequest(listId))

  api(getState).post(`/api/v1/lists/${listId}/subscribers`)
    .then(({ data }) => dispatch(subscribeToListSuccess(listId, data.subscriber_count)))
    .catch((err) => dispatch(subscribeToListFail(listId, err)))
}

const subscribeToListRequest = (id) => ({
  type: LIST_SUBSCRIBE_REQUEST,
  id,
})

const subscribeToListSuccess = (id, subscriberCount) => ({
  type: LIST_SUBSCRIBE_SUCCESS,
  showToast: true,
  subscriberCount,
  id,
})

const subscribeToListFail = (id, error) => ({
  type: LIST_SUBSCRIBE_FAIL,
  showToast: true,
  id,
  error,
})

/**
 *
 */
 export const unsubscribeFromList = (listId) => (dispatch, getState) => {
  console.log("unsubscribeFromList:",listId)
  if (!me) return

  dispatch(unsubscribeFromListRequest(listId))

  api(getState).delete(`/api/v1/lists/${listId}/subscribers`)
    .then(({ data }) => dispatch(unsubscribeFromListSuccess(listId, data.subscriber_count)))
    .catch((err) => dispatch(unsubscribeFromListFail(listId, err)))
}

const unsubscribeFromListRequest = (id) => ({
  type: LIST_UNSUBSCRIBE_REQUEST,
  id,
})

const unsubscribeFromListSuccess = (id, subscriberCount) => ({
  type: LIST_UNSUBSCRIBE_SUCCESS,
  showToast: true,
  subscriberCount,
  id,
})

const unsubscribeFromListFail = (id, error) => ({
  type: LIST_UNSUBSCRIBE_FAIL,
  showToast: true,
  id,
  error,
})

/**
 *
 */
 export const leaveList = (listId) => (dispatch, getState) => {
  if (!me) return

  dispatch(leaveListRequest(listId))

  api(getState).delete(`/api/v1/lists/${listId}/accounts/leave`)
    .then(({ data }) => dispatch(leaveListSuccess(listId)))
    .catch((err) => dispatch(leaveListFail(listId, err)))
}

const leaveListRequest = (id) => ({
  type: LIST_ACCOUNTS_MEMBER_LEAVE_REQUEST,
  id,
})

const leaveListSuccess = (id) => ({
  type: LIST_ACCOUNTS_MEMBER_LEAVE_SUCCESS,
  showToast: true,
  id,
})

const leaveListFail = (id, error) => ({
  type: LIST_ACCOUNTS_MEMBER_LEAVE_FAIL,
  showToast: true,
  id,
  error,
})

/**
 * @description Fetch relationships for the given listIds and current user. For example
 *              if the current user is a member, admin, mod or not.
 * @param {Array} listIds
 */
 export const fetchListRelationships = (listIds) => (dispatch, getState) => {
  if (!me || !Array.isArray(listIds)) return

  const loadedRelationships = getState().get('list_relationships')
  let newListIds = listIds.filter((id) => loadedRelationships.get(id, null) === null)

  if (newListIds.length === 0) return

  // Unique
  newListIds = Array.from(new Set(newListIds))

  dispatch(fetchListRelationshipsRequest(newListIds))

  api(getState).post('/api/v1/list_relationships', {
    listIds: newListIds,
  }).then((response) => {
    dispatch(fetchListRelationshipsSuccess(response.data))
  }).catch((error) => {
    dispatch(fetchListRelationshipsFail(error))
  })
}

const fetchListRelationshipsRequest = (listIds) => ({
  type: LIST_RELATIONSHIPS_FETCH_REQUEST,
  listIds,
})

const fetchListRelationshipsSuccess = (relationships) => ({
  type: LIST_RELATIONSHIPS_FETCH_SUCCESS,
  relationships,
})

const fetchListRelationshipsFail = (error) => ({
  type: LIST_RELATIONSHIPS_FETCH_FAIL,
  error,
})

/**
 * @description Import a list into redux
 * @param {ImmutableMap} list
 */
export const importList = (list) => (dispatch) => {
  dispatch(fetchListSuccess(list))
}
