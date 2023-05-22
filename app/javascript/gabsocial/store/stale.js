/*

The idea here is that we only want to cache certain things for a while but
not permanently while the window is open. The goal here is to expire information
like timelines and ads after a while and force new information.

*/

import { timelineRemoveStale } from './timelines'
import {
  ADVERTISEMENT_PAGE_POSITION,
  removePagePosition,
} from '../actions/advertisements'

const timers = {}
const scheduleMs = 3600000 // 1hr

function resetTimer(key, fn) {
  if (timers[key] !== undefined) {
    clearTimeout(timers[key])
  }
  timers[key] = setTimeout(fn, scheduleMs)
}

const staleMiddleware = ({ dispatch }) => next => function(action) {
  next(action) // do whatever mutations the messages do first

  const { type, timelineId, pageKey, position } = action

  if (typeof type !== 'string') {
    return
  }

  if (type.startsWith('TIMELINE_') && typeof timelineId === 'string') {
    resetTimer(timelineId, function() {
      dispatch(timelineRemoveStale(timelineId))
    })
  }

  if (
    type === ADVERTISEMENT_PAGE_POSITION &&
    typeof pageKey === 'string' &&
    typeof position !== undefined
  ) {
    const pagePositionKey = `${pageKey}-${position}`
    resetTimer(pagePositionKey, function() {
      dispatch(removePagePosition(pagePositionKey))
    })
  }
}

export default staleMiddleware;
