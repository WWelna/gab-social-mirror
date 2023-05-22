import api, { getLinks } from '../api'
import debounce from 'lodash/debounce'
import IntlMessageFormat from 'intl-messageformat'
import { CancelToken, isCancel } from 'axios'
import noop from 'lodash/noop'
import get from 'lodash/get'
import isNil from 'lodash/isNil'
import { fetchRelationships } from './accounts'
import {
  importFetchedAccount,
  importFetchedAccounts,
  importFetchedStatus,
  importFetchedStatuses,
} from './importer'
import { defineMessages } from 'react-intl'
import { List as ImmutableList } from 'immutable'
import { unescapeHTML } from '../utils/html'
import { getFilters, regexFromFilters } from '../selectors'
import { me } from '../initial_state'
import { NOTIFICATION_FILTERS } from '../constants'
import { fetchGroupRelationships } from './groups'

export const NOTIFICATIONS_UPDATE = 'NOTIFICATIONS_UPDATE'

export const NOTIFICATIONS_EXPAND_REQUEST = 'NOTIFICATIONS_EXPAND_REQUEST'
export const NOTIFICATIONS_EXPAND_SUCCESS = 'NOTIFICATIONS_EXPAND_SUCCESS'
export const NOTIFICATIONS_EXPAND_FAIL = 'NOTIFICATIONS_EXPAND_FAIL'

export const NOTIFICATIONS_FILTER_SET = 'NOTIFICATIONS_FILTER_SET'

export const NOTIFICATIONS_CLEAR = 'NOTIFICATIONS_CLEAR'
export const NOTIFICATIONS_SCROLL_TOP = 'NOTIFICATIONS_SCROLL_TOP'
export const NOTIFICATIONS_MARK_READ = 'NOTIFICATIONS_MARK_READ'
export const NOTIFICATIONS_INCREMENT_UNREAD = 'NOTIFICATIONS_INCREMENT_UNREAD'

defineMessages({
  mention: { id: 'notification.mention', defaultMessage: '{name} mentioned you' },
  group: { id: 'notifications.group', defaultMessage: '{count} notifications' },
})

const fetchRelatedRelationships = (dispatch, notifications) => {
  const accountIds = notifications.filter(item => item.type === 'follow').map(item => item.account.id)

  if (accountIds.length > 0) {
    dispatch(fetchRelationships(accountIds))
  }
}

const excludeTypesFromFilter = filter => {
  if (filter === 'quote') filter = 'reblog'
  const allTypes = ImmutableList(['follow', 'favourite', 'reblog', 'mention', 'poll', 'group_moderation_event'])
  return allTypes.filterNot(item => item === filter).toJS()
}

/**
 * 
 */
export const updateNotifications = (notification, intlMessages, intlLocale) => (dispatch, getState) => {
  const showInColumn = getState().getIn(['notifications', 'filter', notification.type], true)

  if (showInColumn) {
    dispatch(importFetchedAccount(notification.account))

    if (notification.status) {
      dispatch(importFetchedStatus(notification.status))
    }

    if ('group_moderation_event' in notification) {
      const {
        acted_at,
        status_id,
        group_id,
        approved,
        rejected,
        removed
      } = notification.group_moderation_event

      const userRemoved1 = typeof group_id === 'string' &&
        group_id.length > 0 &&
        removed

      /*
      This is a workaround until we figure out why GroupRemovedAccount is not
      updated in app/services/group_moderation_service.rb remove_user. Even
      though it's marked removed we may be getting an old copy of the data.
      */
      const userRemoved2 = acted_at === null &&
        approved === false &&
        rejected === false &&
        removed === false &&
        status_id === ''

      const reloadRelationships = userRemoved1 || userRemoved2

      if (reloadRelationships) {
        dispatch(fetchGroupRelationships(group_id))
      }
    }

    dispatch({
      type: NOTIFICATIONS_UPDATE,
      notification,
    })
  }
}

let expandCancel = null

/**
 * 
 */
export const expandNotifications = ({ maxId } = {}) => (dispatch, getState) => {
  if (!me) return

  const onlyVerified = getState().getIn(['notifications', 'filter', 'onlyVerified'])
  const onlyFollowing = getState().getIn(['notifications', 'filter', 'onlyFollowing'])
  const activeFilter = getState().getIn(['notifications', 'filter', 'active'])
  const notifications = getState().get('notifications')

  if (notifications.get('isLoading') || notifications.get('isError')) {
    return
  }

  const params = {
    max_id: maxId,
    exclude_types: activeFilter === 'all' ? null : excludeTypesFromFilter(activeFilter),
  }

  if (activeFilter === 'quote') params.quote = true
  if (!!onlyVerified) params.only_verified = onlyVerified
  if (!!onlyFollowing) params.only_following = onlyFollowing

  if (!maxId && notifications.get('items').size > 0) {
    params.since_id = notifications.getIn(['items', 0, 'id'])
  }

  const operation = params.since_id !== undefined ? 'load-prev' : 'load-next'

  dispatch(expandNotificationsRequest())

  const cancelWarn = err =>
    console.warn("error canceling notification request", err)

  if (typeof expandCancel === 'function') {
    try {
      expandCancel()
      expandCancel = null
    } catch (cancelErr) {
      cancelWarn(cancelErr)
    }
  }

  const getOpts = {
    params,
    cancelToken: new CancelToken(c => (expandCancel = c))
  }

  api(getState).get('/api/v1/notifications', getOpts).then(response => {
    let next = getLinks(response).refs.find(link => link.rel === 'next')
    next = next && next.uri
    const notifications = response.data
    const notBlank = item => item !== undefined && item !== null
    const accounts = notifications
      .map(item => item.account)
      .filter(notBlank)
    const statuses = notifications
      .map(item => item.status)
      .filter(notBlank)

    if (accounts.length > 0) {
      dispatch(importFetchedAccounts(accounts))
    }

    if (statuses.length > 0) {
      dispatch(importFetchedStatuses(statuses))
    }

    dispatch(expandNotificationsSuccess({ notifications, next, operation }))
    fetchRelatedRelationships(dispatch, notifications)
  }).catch((error) => {
    if (isCancel(error)) {
      return cancelWarn(error)
    }
    console.log(error)
    dispatch(expandNotificationsFail(error))
  })
}

const expandNotificationsRequest = () => ({
  type: NOTIFICATIONS_EXPAND_REQUEST
})

const expandNotificationsSuccess = ({ notifications, next, operation }) => ({
  type: NOTIFICATIONS_EXPAND_SUCCESS,
  notifications,
  next,
  operation
})

const expandNotificationsFail = error => ({
  type: NOTIFICATIONS_EXPAND_FAIL,
  error,
  showToast: true
})

/**
 * 
 */
// : todo : implement with alert/warning
export const clearNotifications = () => (dispatch, getState) => {
  if (!me) return

  dispatch({
    type: NOTIFICATIONS_CLEAR,
  })

  api(getState).post('/api/v1/notifications/clear')
}

export const markReadNotifications = (force) => (dispatch, getState) => {
  if (!me) return
  debouncedMarkReadNotifications(dispatch, getState, force)
}

export const debouncedMarkReadNotifications = debounce((dispatch, getState, force) => {
  if (!me) return

  api(getState).post('/api/v1/notifications/mark_read', {}).then(() => {
    dispatch({
      type: NOTIFICATIONS_MARK_READ,
    })
  })
}, 3000, { leading: true })

/**
 * 
 */
export const setFilter = (path, value) => (dispatch) => {
  if (path === 'active' && NOTIFICATION_FILTERS.indexOf(value) === -1) return

  dispatch({
    type: NOTIFICATIONS_FILTER_SET,
    path: path,
    value: value,
  })
  dispatch(expandNotifications())
}

/**
 * When a notification arrives via altstream this increments the notification
 * count and updates status reactions, quotes, and reports counts.
 */
export const streamingNotification = notification => dispatch => {
  const statusId = get(notification, 'status.id')
  if (isNil(statusId) === false) {
    dispatch(importFetchedStatus(notification.status))
  }
  dispatch({ type: NOTIFICATIONS_INCREMENT_UNREAD })
}
