import api, { getLinks } from '../api'
import { fetchRelationships } from './accounts'
import { importFetchedAccounts } from './importer'
import { me } from '../initial_state'
import {
  setIsBlockingIds,
  setIsMutingIds,
  setIsBlockedByIds,
} from '../utils/local_storage_blocks_mutes'
import isObject from 'lodash.isobject'

export const BLOCKS_FETCH_REQUEST = 'BLOCKS_FETCH_REQUEST'
export const BLOCKS_FETCH_SUCCESS = 'BLOCKS_FETCH_SUCCESS'
export const BLOCKS_FETCH_FAIL    = 'BLOCKS_FETCH_FAIL'

export const BLOCKS_EXPAND_REQUEST = 'BLOCKS_EXPAND_REQUEST'
export const BLOCKS_EXPAND_SUCCESS = 'BLOCKS_EXPAND_SUCCESS'
export const BLOCKS_EXPAND_FAIL    = 'BLOCKS_EXPAND_FAIL'

/**
 * 
 */
export const fetchBlocks = () => (dispatch, getState) => {
  if (!me) return

  dispatch(fetchBlocksRequest())

  api(getState).get('/api/v1/blocks').then(response => {
    const next = getLinks(response).refs.find(link => link.rel === 'next')
    dispatch(importFetchedAccounts(response.data))
    dispatch(fetchBlocksSuccess(response.data, next ? next.uri : null))
    dispatch(fetchRelationships(response.data.map(item => item.id)))
  }).catch(error => dispatch(fetchBlocksFail(error)))
}

export const fetchBlocksRequest = () => ({
  type: BLOCKS_FETCH_REQUEST,
})

export const fetchBlocksSuccess = (accounts, next) => {
  return {
    type: BLOCKS_FETCH_SUCCESS,
    accounts,
    next,
  }
}

export const fetchBlocksFail = (error) => ({
  type: BLOCKS_FETCH_FAIL,
  showToast: true,
  error,
})

/**
 * 
 */
export const expandBlocks = () => (dispatch, getState) => {
  if (!me) return
  
  const url = getState().getIn(['user_lists', 'blocks', me, 'next'])
  const isLoading = getState().getIn(['user_lists', 'blocks', me, 'isLoading'])

  if (url === null || isLoading) return

  dispatch(expandBlocksRequest())

  api(getState).get(url).then(response => {
    const next = getLinks(response).refs.find(link => link.rel === 'next')
    dispatch(importFetchedAccounts(response.data))
    dispatch(expandBlocksSuccess(response.data, next ? next.uri : null))
    dispatch(fetchRelationships(response.data.map(item => item.id)))
  }).catch(error => dispatch(expandBlocksFail(error)))
}

export const expandBlocksRequest = () => ({
  type: BLOCKS_EXPAND_REQUEST,
})

export const expandBlocksSuccess = (accounts, next) => ({
  type: BLOCKS_EXPAND_SUCCESS,
  accounts,
  next,
})

export const expandBlocksFail = (error) => ({
  type: BLOCKS_EXPAND_FAIL,
  showToast: true,
  error,
})

/**
 * Fetch blocks, blocked_by and mutes for user, save to localStorage
 * Doesn't necessarily have to be in actions/blocks...
 */
export const fetchBlocksAndMutes = (dispatch, getState) => {
  if (!me) return

  api(getState).get('/api/v1/blocks_and_mutes').then(({ data }) => {
    if (isObject(data)) {
      if (Array.isArray(data.bb)) setIsBlockedByIds(data.bb)
      if (Array.isArray(data.b)) setIsBlockingIds(data.b)
      if (Array.isArray(data.m)) setIsMutingIds(data.m)
    }
  })
}