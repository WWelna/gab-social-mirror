import { connectStream } from '../stream'
import {
  deleteFromTimelines,
  connectTimeline,
  disconnectTimeline,
  updateTimelineQueue,
} from './timelines'
import { updateNotificationsQueue } from './notifications'
import { manageIncomingChatMessage } from './chat_messages'
import { fetchFilters } from './filters'
import { getLocale } from '../locales'
import { handleComposeSubmit } from './compose'

const { messages } = getLocale()

/**
 * 
 */
export const connectTimelineStream = (timelineId, path, pollingRefresh = null, accept = null) => {

  return connectStream (path, pollingRefresh, (dispatch, getState) => {
    const locale = getState().getIn(['meta', 'locale'])

    return {
      onConnect() {
        dispatch(connectTimeline(timelineId))
      },
      onDisconnect() {
        dispatch(disconnectTimeline(timelineId))
      },
      onReceive (data) {
        switch(data.event) {
        case 'update':
          const update = JSON.parse(data.payload)
          console.log(update)
          //dispatch(updateTimelineQueue(timelineId, JSON.parse(data.payload), accept))
          break
        case 'delete':
          dispatch(deleteFromTimelines(data.payload))
          break
        case 'notification':
          const notification = JSON.parse(data.payload)
          notification.messageSource = 'websocket'
          dispatch(updateNotificationsQueue(notification, messages, locale, window.location.pathname))
          break
        case 'filters_changed':
          dispatch(fetchFilters())
          break
        }
      },
    }
  })
}

/**
 * 
 */
export const connectStatusUpdateStream = () => {

  return connectStream('statuscard', null, (dispatch, getState) => {

    return {
      onConnect() {},
      onDisconnect() {},
      onReceive (data) {
        if (!data['event'] || !data['payload']) return
        if (data.event === 'update') {
          // this simulates an axios response for the message
          const response = {data: JSON.parse(data.payload)}
          response.data.showToast = false
          handleComposeSubmit(dispatch, getState, response, null)
        }
      },
    }
  })
}

/**
 * 
 */
export const connectUserStream = () => connectTimelineStream('home', 'user')

/**
 * 
 */
export const connectChatMessagesStream = (accountId) => {
  return connectStream(`chat_messages`, null, (dispatch, getState) => {
    return {
      onConnect() {},
      onDisconnect() {},
      onReceive (data) {
        if (!data['event'] || !data['payload']) return
        if (data.event === 'notification') {
          // : todo :
          //Play sound
          dispatch(manageIncomingChatMessage(JSON.parse(data.payload)))
        }
      },
    }
  })
}
