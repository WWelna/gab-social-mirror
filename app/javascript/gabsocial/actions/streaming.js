// import {
// deleteFromTimelines,
// connectTimeline,
// disconnectTimeline,
// updateTimelineQueue,
// } from './timelines'
import { updateNotificationsQueue } from './notifications'
import { manageIncomingChatMessage } from './chat_messages'
import { fetchFilters } from './filters'
import { getLocale } from '../locales'

const { messages } = getLocale()

let eventStream;
let dispatch;
let locale;

export const connectAltStream = (d, l) => {
  dispatch = d
  locale = l
  if (!eventStream) {
    eventStream = new EventSource("/api/v4/streaming")
    eventStream.addEventListener('message', onReceive)
  }
}


function onReceive (data) {
 
  let event = JSON.parse(data.data)
  
  let isPing = event.type === 'ping'
  if (isPing) { return }

  let payload = event.payload
  let isChatRelated = payload.chat_conversation_id !== undefined

  switch(event.event) {
    case 'update':
      //const update = JSON.parse(data.payload)
      //dispatch(updateTimelineQueue(timelineId, JSON.parse(data.payload), accept))
      break
    case 'delete':
      // dispatch(deleteFromTimelines(data.payload))
      break
    case 'notification':
      if (isChatRelated) {
        dispatch(manageIncomingChatMessage(payload))
      } else {
        payload.messageSource = 'websocket'
        dispatch(updateNotificationsQueue(payload, messages, locale, window.location.pathname))
      }
      break
    case 'filters_changed':
      dispatch(fetchFilters())
      break
  }
}