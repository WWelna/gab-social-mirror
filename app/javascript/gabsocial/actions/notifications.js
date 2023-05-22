import api, { getLinks } from '../api'
import debounce from 'lodash.debounce'
import IntlMessageFormat from 'intl-messageformat'
import noop from 'lodash.noop'
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
export const NOTIFICATIONS_UPDATE_QUEUE = 'NOTIFICATIONS_UPDATE_QUEUE'
export const NOTIFICATIONS_DEQUEUE = 'NOTIFICATIONS_DEQUEUE'

export const NOTIFICATIONS_EXPAND_REQUEST = 'NOTIFICATIONS_EXPAND_REQUEST'
export const NOTIFICATIONS_EXPAND_SUCCESS = 'NOTIFICATIONS_EXPAND_SUCCESS'
export const NOTIFICATIONS_EXPAND_FAIL = 'NOTIFICATIONS_EXPAND_FAIL'

export const NOTIFICATIONS_FILTER_SET = 'NOTIFICATIONS_FILTER_SET'

export const NOTIFICATIONS_CLEAR = 'NOTIFICATIONS_CLEAR'
export const NOTIFICATIONS_SCROLL_TOP = 'NOTIFICATIONS_SCROLL_TOP'
export const NOTIFICATIONS_MARK_READ = 'NOTIFICATIONS_MARK_READ'

export const MAX_QUEUED_NOTIFICATIONS = 40

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

/**
 * 
 */
export const updateNotificationsQueue = (notification, intlMessages, intlLocale, curPath) => (dispatch, getState) => {
  // : todo :
  // const showAlert = getState().getIn(['settings', 'notifications', 'alerts', notification.type], true)
  const filters = getFilters(getState(), { contextType: 'notifications' })

  let filtered = false

  const isOnNotificationsPage = curPath === '/notifications'

  if (notification.type === 'mention') {
    const regex = regexFromFilters(filters)
    const searchIndex = notification.status.spoiler_text + '\n' + unescapeHTML(notification.status.content)
    filtered = regex && regex.test(searchIndex)
  }

  // Desktop notifications
  // : todo :
  // if (typeof window.Notification !== 'undefined' && showAlert && !filtered) {
  //   const title = new IntlMessageFormat(intlMessages[`notification.${notification.type}`], intlLocale).format({ name: notification.account.display_name.length > 0 ? notification.account.display_name : notification.account.username })
  //   const body = (notification.status && notification.status.spoiler_text.length > 0) ? notification.status.spoiler_text : unescapeHTML(notification.status ? notification.status.content : '')

  //   const notify = new Notification(title, { body, icon: notification.account.avatar, tag: notification.id })

  //   notify.addEventListener('click', () => {
  //     window.focus()
  //     notify.close()
  //   })
  // }

  if (isOnNotificationsPage) {
    dispatch({
      type: NOTIFICATIONS_UPDATE_QUEUE,
      notification,
      intlMessages,
      intlLocale,
    })
  } else {
    dispatch(updateNotifications(notification, intlMessages, intlLocale))
  }

}

/**
 * 
 */
export const forceDequeueNotifications = () => (dispatch) => {
  dispatch({
    type: NOTIFICATIONS_DEQUEUE,
  })
}

/**
 * 
 */
export const dequeueNotifications = () => (dispatch, getState) => {
  const queuedNotifications = getState().getIn(['notifications', 'queuedNotifications'], ImmutableList())
  const totalQueuedNotificationsCount = getState().getIn(['notifications', 'totalQueuedNotificationsCount'], 0)

  if (totalQueuedNotificationsCount === 0) {
    return
  } else if (totalQueuedNotificationsCount > 0 && totalQueuedNotificationsCount <= MAX_QUEUED_NOTIFICATIONS) {
    queuedNotifications.forEach((block) => {
      dispatch(updateNotifications(block.notification, block.intlMessages, block.intlLocale))
    })
  } else {
    dispatch(expandNotifications())
  }

  dispatch({
    type: NOTIFICATIONS_DEQUEUE,
  })
}

/**
 * 
 */
export const expandNotifications = ({ maxId } = {}, done = noop) => (dispatch, getState) => {
  if (!me) return

  const onlyVerified = getState().getIn(['notifications', 'filter', 'onlyVerified'])
  const onlyFollowing = getState().getIn(['notifications', 'filter', 'onlyFollowing'])
  const activeFilter = getState().getIn(['notifications', 'filter', 'active'])
  const notifications = getState().get('notifications')
  const isLoadingMore = !!maxId

  if (notifications.get('isLoading') || notifications.get('isError')|| activeFilter === 'follow_requests') {
    done()
    return
  }

  const params = {
    max_id: maxId,
    exclude_types: activeFilter === 'all' ? null : excludeTypesFromFilter(activeFilter),
  }

  if (!!onlyVerified) params.only_verified = onlyVerified
  if (!!onlyFollowing) params.only_following = onlyFollowing

  if (!maxId && notifications.get('items').size > 0) {
    params.since_id = notifications.getIn(['items', 0, 'id'])
  }

  const operation = params.since_id !== undefined ? 'load-prev' : 'load-next'

  dispatch(expandNotificationsRequest(isLoadingMore))

  api(getState).get('/api/v1/notifications', { params }).then(response => {
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

    dispatch(expandNotificationsSuccess({
      notifications,
      next,
      isLoadingMore,
      operation
    }))
    fetchRelatedRelationships(dispatch, notifications)
    done()
  }).catch((error) => {
    console.log(error)
    dispatch(expandNotificationsFail(error, isLoadingMore))
    done()
  })
}

const expandNotificationsRequest = (isLoadingMore) => ({
  type: NOTIFICATIONS_EXPAND_REQUEST,
  skipLoading: !isLoadingMore,
})

const expandNotificationsSuccess = ({
  notifications,
  next,
  isLoadingMore,
  operation
}) => ({
  type: NOTIFICATIONS_EXPAND_SUCCESS,
  notifications,
  next,
  skipLoading: !isLoadingMore,
  operation
})

const expandNotificationsFail = (error, isLoadingMore) => ({
  type: NOTIFICATIONS_EXPAND_FAIL,
  error,
  showToast: true,
  skipLoading: !isLoadingMore,
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
