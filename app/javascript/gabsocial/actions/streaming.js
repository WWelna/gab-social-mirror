import { streamingNotification } from './notifications'
import { manageIncomingChatMessage } from './chat_messages'
import { fetchFilters } from './filters'
import { timelinePrependItem, timelineQueue } from '../store/timelines'
import { importFetchedStatus } from './importer'
import { updateStatusStats } from './statuses'
import { timelineStatusDelete } from '../store/timelines'
import store from '../store/index'

let eventStream;
let dispatch;

export const connectAltStream = (d) => {
  dispatch = d
  if (!eventStream) {
    eventStream = new EventSource("/api/v4/streaming")
    eventStream.addEventListener('message', onReceive)
  }
}

function onReceive (data) {

  let state = store.getState()
 
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
    case 'delete_status':
      dispatch(timelineStatusDelete({ timelineId: 'home', statusId: payload.id}))
      dispatch(timelineStatusDelete({ timelineId: `account:${payload.account_id}`, statusId: payload.id}))
      dispatch(timelineStatusDelete({ timelineId: 'pro', statusId: payload.id}))
      dispatch(timelineStatusDelete({ timelineId: 'group_collection:member', statusId: payload.id}))
      break
    case 'notification':
      if (isChatRelated) {
        dispatch(manageIncomingChatMessage(payload))
      } else {
        dispatch(streamingNotification(payload))
      }
      break
    case 'filters_changed':
      dispatch(fetchFilters())
      break
    case 'post_group':
      let sort;
      if (payload.group && payload.group.id) {
        if (window.location.pathname === `/groups/${payload.group.id}`) {
          sort = state.getIn(['timelines', `group:${payload.group.id}`, 'sortByValue'])
          if (!sort || sort == 'newest') {
            dispatch(importFetchedStatus(payload))
            setTimeout(() => { inject(`group:${payload.group.id}`, payload.id) }, 250)
          }
        }
        if (window.location.pathname === `/groups`) {
          sort = state.getIn(['timelines', 'group_collection:member', 'sortByValue'])
          if (!sort || sort == 'newest') {
            dispatch(importFetchedStatus(payload))
            setTimeout(() => { inject(`group_collection:member`, payload.id) }, 250)
          }
        }
      }
      break
    case 'post_status':
      if (payload.in_reply_to_id) {
        // think... atm this is disabled server side...
      } else {
        let sort;
        if (window.location.pathname === `/${payload.account.username}`) {
          sort = state.getIn(['timelines', `account:${payload.account_id}`, 'sortByValue'])
          if (!sort || sort == 'newest' || (sort == 'no-reposts' && !payload.reblog)) {
            dispatch(importFetchedStatus(payload))
            setTimeout(() => { inject(`account:${payload.account_id}`, payload.id) }, 250)
          }
        }
        if (window.location.pathname === '/' || window.location.pathname === '/home') {
          sort = state.getIn(['timelines', 'home', 'sortByValue'])
          if (!sort || sort == 'newest' || (sort == 'no-reposts' && !payload.reblog)) {
            dispatch(importFetchedStatus(payload))
            setTimeout(() => { inject('home', payload.id) }, 250)
          }
        }
        if (payload.account.is_pro && window.location.pathname === '/timeline/pro') {
          sort = state.getIn(['timelines', 'pro', 'sortByValue'])
          if (sort == 'newest') {
            dispatch(importFetchedStatus(payload))
            setTimeout(() => { inject('pro', payload.id) }, 250)
          }
        }          
        if (payload.account.is_pro && payload.media_attachments) {
          if (window.location.pathname == '/timeline/photos') {
            let hasImage = payload.media_attachments.some(attachment => attachment.type === 'image')
            if (hasImage) {
              sort = state.getIn(['timelines', 'pro:photos', 'sortByValue'])
              if (sort == 'newest') {
                dispatch(importFetchedStatus(payload))
                setTimeout(() => { inject('pro:photos', payload.id) }, 250)
              }
            }
          }
          if (window.location.pathname == '/timeline/videos') {
            let hasVideo = payload.media_attachments.some(attachment => attachment.type === 'video')
            if (hasVideo) {
              sort = state.getIn(['timelines', 'pro:videos', 'sortByValue'])
              if (sort == 'newest') {
                dispatch(importFetchedStatus(payload))
                setTimeout(() => { inject('pro:videos', payload.id) }, 250)
              }
            }
          }            
        }
        if (payload.account.is_pro && payload.poll && window.location.pathname == '/timeline/polls') {
          sort = state.getIn(['timelines', 'polls', 'sortByValue'])
          if (!sort || sort == 'newest') {
            dispatch(importFetchedStatus(payload))
            setTimeout(() => { inject('polls', payload.id) }, 250)
          }
        }
      }
      break
    case 'edit_status':
      var existing = state.getIn(['statuses', payload.id])
      if (existing) {
        dispatch(importFetchedStatus(payload))
      }
      break
    case 'status_stat':
      var existing = state.getIn(['statuses', payload.status_id])
      if (existing) {
        dispatch(updateStatusStats(payload))
      }
      break
  }
}

function inject(timeline, payload) {
  //if (window.scrollY < 100) {
  //  dispatch(timelinePrependItem(timeline, payload))
  //} else {
    dispatch(timelineQueue(timeline, payload))
  //}
}
