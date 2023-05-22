import api from '../api'
import { importFetchedAccounts } from './importer'
import { fetchRelationships } from './accounts'
import { me, globalStatusContexts } from '../initial_state'

export const STATUS_CONTEXTS_GLOBAL_FETCH_REQUEST = 'STATUS_CONTEXTS_GLOBAL_FETCH_REQUEST'
export const STATUS_CONTEXTS_GLOBAL_FETCH_SUCCESS = 'STATUS_CONTEXTS_GLOBAL_FETCH_SUCCESS'
export const STATUS_CONTEXTS_GLOBAL_FETCH_FAIL    = 'STATUS_CONTEXTS_GLOBAL_FETCH_FAIL'

export const STATUS_CONTEXTS_GROUP_FETCH_REQUEST = 'STATUS_CONTEXTS_GROUP_FETCH_REQUEST'
export const STATUS_CONTEXTS_GROUP_FETCH_SUCCESS = 'STATUS_CONTEXTS_GROUP_FETCH_SUCCESS'
export const STATUS_CONTEXTS_GROUP_FETCH_FAIL    = 'STATUS_CONTEXTS_GROUP_FETCH_FAIL'

export const STATUS_CONTEXTS_GROUP_CREATE_REQUEST = 'STATUS_CONTEXTS_GROUP_CREATE_REQUEST'
export const STATUS_CONTEXTS_GROUP_CREATE_SUCCESS = 'STATUS_CONTEXTS_GROUP_CREATE_SUCCESS'
export const STATUS_CONTEXTS_GROUP_CREATE_FAIL    = 'STATUS_CONTEXTS_GROUP_CREATE_FAIL'

export const STATUS_CONTEXTS_GROUP_REMOVE_REQUEST = 'STATUS_CONTEXTS_GROUP_REMOVE_REQUEST'
export const STATUS_CONTEXTS_GROUP_REMOVE_SUCCESS = 'STATUS_CONTEXTS_GROUP_REMOVE_SUCCESS'
export const STATUS_CONTEXTS_GROUP_REMOVE_FAIL    = 'STATUS_CONTEXTS_GROUP_REMOVE_FAIL'

export const STATUS_CONTEXTS_HYDRATE_GLOBAL = 'STATUS_CONTEXTS_HYDRATE_GLOBAL'

/**
 * 
 */
export const hydrateGlobalStatusContexts = () => (dispatch) => {
  if (!globalStatusContexts || !Array.isArray(globalStatusContexts)) return

  dispatch({
    type: STATUS_CONTEXTS_HYDRATE_GLOBAL,
    statusContexts: globalStatusContexts,
  })
}

/**
 * 
 */
export const fetchGlobalStatusContexts = (dispatch, getState) => {
  dispatch(fetchGlobalStatusContextsRequest())

  api(getState).get('/api/v1/status_contexts').then((response) => {
    dispatch(fetchGlobalStatusContextsSuccess(response.data))
  }).catch(error => dispatch(fetchGlobalStatusContextsFail(error)))
}

const fetchGlobalStatusContextsRequest = () => ({
  type: STATUS_CONTEXTS_GLOBAL_FETCH_REQUEST,
})

const fetchGlobalStatusContextsSuccess = (statusContexts) => ({
  type: STATUS_CONTEXTS_GLOBAL_FETCH_SUCCESS,
  statusContexts,
})

const fetchGlobalStatusContextsFail = (error) => ({
  type: STATUS_CONTEXTS_GLOBAL_FETCH_FAIL,
  error,
})

/**
 * 
 */
export const fetchGroupStatusContexts = (groupId) => (dispatch, getState) => {
  dispatch(fetchGroupStatusContextsRequest(groupId))

  api(getState).get(`/api/v1/groups/${groupId}/status_contexts`).then((response) => {
    dispatch(fetchGroupStatusContextsSuccess(response.data, groupId))
  }).catch(error => dispatch(fetchGroupStatusContextsFail(error, groupId)))
}

const fetchGroupStatusContextsRequest = () => ({
  type: STATUS_CONTEXTS_GROUP_FETCH_REQUEST,
  groupId,
})

const fetchGroupStatusContextsSuccess = (statusContexts, groupId) => ({
  type: STATUS_CONTEXTS_GROUP_FETCH_SUCCESS,
  statusContexts,
  groupId,
})

const fetchGroupStatusContextsFail = (error, groupId) => ({
  type: STATUS_CONTEXTS_GROUP_FETCH_FAIL,
  error,
  groupId,
})

/**
 * 
 */
export const createGroupStatusContext = (groupId, options) => (dispatch, getState) => {
  dispatch(createGroupStatusContextRequest(groupId))

  api(getState).post(`/api/v1/groups/${groupId}/status_contexts`, { options }).then((response) => {
    dispatch(createGroupStatusContextSuccess(response.data, groupId))
  }).catch(error => dispatch(createGroupStatusContextFail(error, groupId)))
}

const createGroupStatusContextRequest = (groupId) => ({
  type: STATUS_CONTEXTS_GROUP_CREATE_REQUEST,
  groupId,
})

const createGroupStatusContextSuccess = (statusContext, groupId) => ({
  type: STATUS_CONTEXTS_GROUP_CREATE_SUCCESS,
  statusContext,
  groupId,
  showToast: true,
})

const createGroupStatusContextFail = (error, groupId) => ({
  type: STATUS_CONTEXTS_GROUP_CREATE_FAIL,
  error,
  groupId,
  showToast: true,
})

/**
 * 
 */
 export const removeGroupStatusContext = (groupId, statusContextId) => (dispatch, getState) => {
  dispatch(removeGroupStatusContextRequest(groupId, statusContextId))

  api(getState).post(`/api/v1/groups/${groupId}/status_contexts/${statusContextId}`).then((response) => {
    dispatch(removeGroupStatusContextSuccess(groupId, statusContextId))
  }).catch(error => dispatch(removeGroupStatusContextFail(error, groupId)))
}

const removeGroupStatusContextRequest = (groupId, statusContextId) => ({
  type: STATUS_CONTEXTS_GROUP_REMOVE_REQUEST,
  groupId,
  statusContextId,
})

const removeGroupStatusContextSuccess = (groupId, statusContextId) => ({
  type: STATUS_CONTEXTS_GROUP_REMOVE_SUCCESS,
  groupId,
  statusContextId,
  showToast: true,
})

const removeGroupStatusContextFail = (error, groupId, statusContextId) => ({
  type: STATUS_CONTEXTS_GROUP_REMOVE_FAIL,
  error,
  groupId,
  statusContextId,
  showToast: true,
})
