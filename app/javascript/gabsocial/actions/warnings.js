import noop from 'lodash/noop'
import api, { getLinks } from '../api'
import { me, newUnreadWarningsCount } from '../initial_state'

export const WARNINGS_EXPAND_REQUEST = 'WARNINGS_EXPAND_REQUEST'
export const WARNINGS_EXPAND_SUCCESS = 'WARNINGS_EXPAND_SUCCESS'
export const WARNINGS_EXPAND_FAIL = 'WARNINGS_EXPAND_FAIL'

export const WARNING_CLEAR_REQUEST = 'WARNING_CLEAR_REQUEST'
export const WARNING_CLEAR_SUCCESS = 'WARNING_CLEAR_SUCCESS'
export const WARNING_CLEAR_FAIL = 'WARNING_CLEAR_FAIL'

export const WARNINGS_UNREAD_COUNT_FETCH_SUCCESS = 'WARNINGS_UNREAD_COUNT_FETCH_SUCCESS'
export const WARNINGS_UNREAD_COUNT_FETCH_FAIL = 'WARNINGS_UNREAD_COUNT_FETCH_FAIL'

/**
 * 
 */
export const expandWarnings = ({ maxId } = {}, done = noop) => (dispatch, getState) => {
  if (!me) return

  const warnings = getState().get('warnings')
  const isLoadingMore = !!maxId

  if (warnings.get('isLoading')) {
    done()
    return
  }

  dispatch(expandWarningsRequest(isLoadingMore))

  api(getState).get('/api/v1/warnings', { max_id: maxId }).then((response) => {
    const next = getLinks(response).refs.find(link => link.rel === 'next')
    dispatch(expandWarningsSuccess(response.data, next ? next.uri : null, isLoadingMore))
    done()
  }).catch((error) => {
    dispatch(expandWarningsFail(error, isLoadingMore))
    done()
  })
}

const expandWarningsRequest = (isLoadingMore) => ({
  type: WARNINGS_EXPAND_REQUEST,
  skipLoading: !isLoadingMore,
})

const expandWarningsSuccess = (warnings, next, isLoadingMore) => ({
  type: WARNINGS_EXPAND_SUCCESS,
  warnings,
  next,
  skipLoading: !isLoadingMore,
})

const expandWarningsFail = (error, isLoadingMore) => ({
  type: WARNINGS_EXPAND_FAIL,
  error,
  skipLoading: !isLoadingMore,
})

/**
 * 
 */
export const clearWarning = (warningId) => (dispatch, getState) => {
  if (!me) return

  dispatch(clearWarningRequest(warningId))

  api(getState).delete(`/api/v1/warnings/${warningId}`).then((response) => {
    dispatch(clearWarningSuccess(response.data))
  }).catch((error) => {
    dispatch(clearWarningFail(error))
  })
}

const clearWarningRequest = (warningId) => ({
  type: WARNING_CLEAR_REQUEST,
  showToast: true,
  warningId,
})

const clearWarningSuccess = (warningId) => ({
  type: WARNING_CLEAR_SUCCESS,
  warningId,
})

const clearWarningFail = (error) => ({
  type: WARNING_CLEAR_FAIL,
  showToast: true,
  error,
})

/**
 * 
 */
export const fetchUnreadWarningsCount = () => (dispatch, getState) => {
  if (!me) return

  dispatch(fetchUnreadWarningsCountSuccess(newUnreadWarningsCount))
}

const fetchUnreadWarningsCountSuccess = (count) => ({
  type: WARNINGS_UNREAD_COUNT_FETCH_SUCCESS,
  count,
})

const fetchUnreadWarningsCountFail = (error) => ({
  type: WARNINGS_UNREAD_COUNT_FETCH_FAIL,
  error,
})
