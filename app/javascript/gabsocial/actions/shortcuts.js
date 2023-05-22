import { me } from '../initial_state'
import api from '../api'

export const SHORTCUTS_FETCH_REQUEST = 'SHORTCUTS_FETCH_REQUEST'
export const SHORTCUTS_FETCH_SUCCESS = 'SHORTCUTS_FETCH_SUCCESS'
export const SHORTCUTS_FETCH_FAIL    = 'SHORTCUTS_FETCH_FAIL'

export const SHORTCUTS_ADD_REQUEST = 'SHORTCUTS_ADD_REQUEST'
export const SHORTCUTS_ADD_SUCCESS = 'SHORTCUTS_ADD_SUCCESS'
export const SHORTCUTS_ADD_FAIL    = 'SHORTCUTS_ADD_FAIL'

export const SHORTCUTS_REMOVE_REQUEST = 'SHORTCUTS_REMOVE_REQUEST'
export const SHORTCUTS_REMOVE_SUCCESS = 'SHORTCUTS_REMOVE_SUCCESS'
export const SHORTCUTS_REMOVE_FAIL    = 'SHORTCUTS_REMOVE_FAIL'

export const SHORTCUTS_CLEAR_COUNT_REQUEST = 'SHORTCUTS_CLEAR_COUNT_REQUEST'
export const SHORTCUTS_CLEAR_COUNT_SUCCESS = 'SHORTCUTS_CLEAR_COUNT_SUCCESS'
export const SHORTCUTS_CLEAR_COUNT_FAIL    = 'SHORTCUTS_CLEAR_COUNT_FAIL'

/**
 * 
 */
export const fetchShortcuts = () => (dispatch, getState) => {
  if (!me) return
  
  const isFetched = getState().getIn(['shortcuts', 'isFetched'], false)
  if (isFetched) return

  dispatch(fetchShortcutsRequest())

  api(getState).get('/api/v1/shortcuts').then(response => {
    dispatch(fetchShortcutsSuccess(response.data))
  }).catch(error => dispatch(fetchShortcutsFail(error)))
}

const fetchShortcutsRequest = () => ({
  type: SHORTCUTS_FETCH_REQUEST,
})

const fetchShortcutsSuccess = (shortcuts) => ({
  type: SHORTCUTS_FETCH_SUCCESS,
  shortcuts,
})

const fetchShortcutsFail = (error) => ({
  type: SHORTCUTS_FETCH_FAIL,
  error,
})

/**
 * 
 */
export const addShortcut = (shortcutType, shortcutId) => (dispatch, getState) => {
  if (!me) return

  dispatch(addShortcutsRequest())

  api(getState).post('/api/v1/shortcuts', {
    shortcut_type: shortcutType,
    shortcut_id: shortcutId,
  }).then(response => {
    dispatch(addShortcutsSuccess(response.data))
  }).catch(error => dispatch(addShortcutsFail(error)))
}

const addShortcutsRequest = () => ({
  type: SHORTCUTS_ADD_REQUEST,
})

const addShortcutsSuccess = (shortcut) => ({
  type: SHORTCUTS_ADD_SUCCESS,
  showToast: true,
  shortcut,
})

const addShortcutsFail = (error) => ({
  type: SHORTCUTS_ADD_FAIL,
  showToast: true,
  error,
})

/**
 * 
 */
export const removeShortcut = (shortcutObjectId, shortcutType, shortcutId) => (dispatch, getState) => {
  if (!me) return
  
  let id
  if (shortcutObjectId) {
    id = shortcutObjectId
  } else if (shortcutType && shortcutId) {
    const shortcuts = getState().getIn(['shortcuts', 'items'])
    const shortcut = shortcuts.find((s) => {
      return s.get('shortcut_id') == shortcutId && s.get('shortcut_type') === shortcutType
    })
    if (!!shortcut) {
      id = shortcut.get('id')
    }
  }

  if (!id) return

  dispatch(removeShortcutsRequest())

  api(getState).delete(`/api/v1/shortcuts/${id}`).then(response => {
    dispatch(removeShortcutsSuccess(response.data.id))
  }).catch(error => dispatch(removeShortcutsFail(error)))
}

const removeShortcutsRequest = () => ({
  type: SHORTCUTS_REMOVE_REQUEST,
})

const removeShortcutsSuccess = (shortcutId) => ({
  type: SHORTCUTS_REMOVE_SUCCESS,
  showToast: true,
  shortcutId,
})

const removeShortcutsFail = (error) => ({
  type: SHORTCUTS_REMOVE_FAIL,
  showToast: true,
  error,
})

/**
 * 
 */
 export const clearShortcutCount = (shortcutObjectId) => (dispatch, getState) => {
  if (!me || !shortcutObjectId) return

  dispatch(clearShortcutCountRequest(shortcutObjectId))

  api(getState).post(`/api/v1/shortcuts/${shortcutObjectId}/clear_count`).then(() => {
    dispatch(clearShortcutCountSuccess())
  }).catch(() => dispatch(clearShortcutCountFail()))
}

const clearShortcutCountRequest = (shortcutId) => ({
  type: SHORTCUTS_CLEAR_COUNT_REQUEST,
  shortcutId,
})

const clearShortcutCountSuccess = () => ({
  type: SHORTCUTS_CLEAR_COUNT_SUCCESS,
})

const clearShortcutCountFail = () => ({
  type: SHORTCUTS_CLEAR_COUNT_FAIL,
})

// 
export const clearShortcutCountByTimelineId = (timelineId) => (dispatch, getState) => {
  if (!me || !timelineId) return

  // destructure
  const splits = timelineId.toLowerCase().split(':')
  if (!Array.isArray(splits) || splits.length !== 2) return
  
  let entityType = splits[0]
  const entityId = splits[1]

  // name correction
  if (entityType === 'hashtag') entityType = 'tag'

  const shortcuts = getState().getIn(['shortcuts', 'items'])
  const foundShortcut = shortcuts.find((s) => {
    return `${s.get('shortcut_id')}`.toLowerCase() == entityId && s.get('shortcut_type').toLowerCase() === entityType
  })

  // clear if found and has unread_count
  if (foundShortcut && foundShortcut.get('unread_count') > 0) {
    dispatch(clearShortcutCount(foundShortcut.get('id')))
  } 
}