import { Map as ImmutableMap, List as ImmutableList } from 'immutable'
import get from 'lodash/get'
import throttle from 'lodash/throttle'
import Settings from '../settings'
import { importFetchedStatuses } from '../actions/importer'
import { fetchList } from '../actions/lists'
import { STATUS_DELETE_SUCCESS, STATUS_DELETE_FAIL } from '../actions/statuses'
import api, { getLinks } from '../api'
import {
  GROUP_TIMELINE_SORTING_TYPE_TOP,
  PRO_POLLS_TIMELINE_SORTING_TYPE_MOST_VOTES,
} from '../constants'

import {
  isBlockingGroupId,
} from '../utils/local_storage_blocks_mutes'
import { clearShortcutCountByTimelineId } from '../actions/shortcuts'

const { isList } = ImmutableList
const { isMap } = ImmutableMap
const settingsMemo = {}
const defaultLimit = 20

export const getSettings = timelineId =>
  settingsMemo[timelineId] ||
  (settingsMemo[timelineId] = new Settings(`timeline_${timelineId}`))

const isString = val => typeof val === 'string'
const isNumber = val => typeof val === 'number'
const isFunction = val => typeof val === 'function'
const isBoolean = val => typeof val === 'boolean'
const isArray = val => Array.isArray(val)
const hasCharacters = val => isString(val) && val.length > 0
const hasItems = arr => isArray(arr) && arr.length > 0

//
// actions
//

export const TIMELINE_DEQUEUE = 'TIMELINE_DEQUEUE'
export const TIMELINE_ITEMS = 'TIMELINE_ITEMS'
export const TIMELINE_PREPEND_ITEM = 'TIMELINE_PREPEND_ITEM'
export const TIMELINE_PINS = 'TIMELINE_PINS'
export const TIMELINE_QUEUE = 'TIMELINE_QUEUE'
export const TIMELINE_FAIL = 'TIMELINE_FAIL'
export const TIMELINE_SORT = 'TIMELINE_SORT'
export const TIMELINE_SORT_TOP = 'TIMELINE_SORT_TOP'
export const TIMELINE_CONFIGURE = 'TIMELINE_CONFIGURE'
export const TIMELINE_FETCH_PAGED = 'TIMELINE_FETCH_PAGED'
export const TIMELINE_FETCH_PINS = 'TIMELINE_FETCH_PINS'
export const TIMELINE_LOADING = 'TIMELINE_LOADING'
export const TIMELINE_REMOVE_STALE = 'TIMELINE_REMOVE_STALE'
export const TIMELINE_UNLOADED = 'TIMELINE_UNLOADED'
export const TIMELINE_STATUS_DELETE = 'TIMELINE_STATUS_DELETE'

export const timelineDequeue = timelineId => ({
  type: TIMELINE_DEQUEUE,
  timelineId
})

export const timelineItems = (timelineId, items) => ({
  type: TIMELINE_ITEMS,
  timelineId,
  items
})

export const timelinePrependItem = (timelineId, statusId) => ({
  type: TIMELINE_PREPEND_ITEM,
  timelineId,
  statusId
})

export const timelinePins = (timelineId, pins) => ({
  type: TIMELINE_PINS,
  timelineId,
  pins
})

export const timelineQueue = (timelineId, queuedItems) => ({
  type: TIMELINE_QUEUE,
  timelineId,
  queuedItems
})

export const timelineFail = (timelineId, error) => ({
  type: TIMELINE_FAIL,
  timelineId,
  error
})

export const timelineConfigure = (timelineId, opts) => ({
  type: TIMELINE_CONFIGURE,
  timelineId,
  opts
})

export const timelineFetchPaged = (timelineId, opts) => ({
  type: TIMELINE_FETCH_PAGED,
  timelineId,
  opts
})

export const timelineFetchPins = (timelineId, opts) => ({
  type: TIMELINE_FETCH_PINS,
  timelineId,
  opts
})

export const timelineLoading = (timelineId, isLoading = true) => ({
  type: TIMELINE_LOADING,
  timelineId,
  isLoading
})

export const timelineSort = (timelineId, sortByValue) => ({
  type: TIMELINE_SORT,
  timelineId,
  sortByValue
})

export const timelineSortTop = (timelineId, sortByTopValue, sortByValue = 'top') => ({
  type: TIMELINE_SORT_TOP,
  timelineId,
  sortByTopValue,
  sortByValue,
})

export const timelineRemoveStale = timelineId => ({
  type: TIMELINE_REMOVE_STALE,
  timelineId
})

export const timelineUnloaded = timelineId => ({
  type: TIMELINE_UNLOADED,
  timelineId
})

export const timelineStatusDelete = ({ timelineId, statusId }) => ({
  type: TIMELINE_STATUS_DELETE,
  timelineId,
  statusId
})

//
// reducer
//

/**
 * Unique filter for immutable List or Array
 * @param {string} item status id
 * @param {number} index
 * @param {List} list
 * @returns {boolean}
 */
export const unique = (item, index, list) => list.indexOf(item) === index

/**
 * Create a timelime
 * @param {object} options
 * @param {string} options.timelineId
 * @returns {object}
 */
export function createTimeline() {
  return ImmutableMap({
    isFetched: false,
    isLoading: false,
    queuedItems: ImmutableList(),
    items: ImmutableList(),
    pins: ImmutableList(),
    sortByValue: null,
    sortByTopValue: null,
    endpoint: null,
    nextUri: null,
    hasNext: null,
    prevUri: null,
    hasPrev: null,
    error: null,
    page: null
  })
}

function deleteStatusFromTimeline(timeline, statusId) {
  if (isMap(timeline)) {
    ;['items', 'queuedItems', 'pins'].forEach(function (key) {
      const list = timeline.get(key)
      if (isList(list) && list.includes(statusId)) {
        timeline = timeline.set(
          key,
          list.filter(item => item !== statusId)
        )
      }
    })
  }
  return timeline
}

export default function timelinesReducer(state = ImmutableMap(), action) {
  const { type, timelineId } = action

  //
  // delete a status from ALL timelines
  //

  if (
    (type === STATUS_DELETE_SUCCESS ||
      (type === STATUS_DELETE_FAIL &&
        get(action, 'error.response.status') === 404)) &&
    hasCharacters(action.id)
  ) {
    const { id: statusId } = action
    return state.mapEntries(function ([timelineId, timeline]) {
      return [timelineId, deleteStatusFromTimeline(timeline, statusId)]
    })
  }

  if (type.startsWith('TIMELINE_') === false || timelineId === undefined) {
    // skip
    return state
  }

  //
  // single timeline operations
  //

  let timeline = state.get(timelineId) || createTimeline()
  const pins = timeline.get('pins')

  if (timeline.get('error') !== null) {
    timeline = timeline.set('error', null)
  }

  /**
   * Ensures normal status items are not in pins.
   * @param {string} item status id
   * @returns {boolean}
   */
  const notInPins = item => pins.includes(item) === false

  const notInItems = item => timeline.get('items').includes(item) === false

  function notLoading() {
    timeline = timeline.set('isLoading', false).set('isFetched', true)
  }

  function dequeue() {
    notLoading()
    const newItems = ImmutableList()
      .concat(timeline.get('queuedItems'))
      .concat(timeline.get('items'))
      .filter(notInPins)
      .filter(unique)
    timeline = timeline.set('items', newItems)
    timeline = timeline.set('queuedItems', ImmutableList())
  }

  function appendItems({ items }) {
    notLoading()
    const newItems = ImmutableList()
      .concat(timeline.get('items'))
      .concat(items)
      .filter(notInPins)
      .filter(unique)
    timeline = timeline.set('items', newItems)
  }

  function prependOne({ statusId }) {
    const newItems = ImmutableList()
      .concat([statusId])
      .concat(timeline.get('items'))
      .filter(notInPins)
      .filter(unique)
    timeline = timeline.set('items', newItems)
  }

  function prependPins({ pins }) {
    const newPins = ImmutableList().concat(pins)
    timeline = timeline.set('pins', newPins)
  }

  function queue({ queuedItems }) {
    notLoading()
    const newQueuedItems = ImmutableList()
      .concat(queuedItems)
      .concat(timeline.get('queuedItems'))
      .filter(notInPins)
      .filter(notInItems)
      .filter(unique)
    timeline = timeline.set('queuedItems', newQueuedItems)
  }

  function fail({ error }) {
    notLoading()
    timeline = timeline.set('error', error)
  }

  function sort({ sortByValue }) {
    const currentSort = timeline.get('sortByValue')
    if (currentSort !== sortByValue) {
      const existingPins = timeline.get('pins')
      // the data is cleared if the sort changes
      timeline = createTimeline()
      timeline = timeline.set('sortByValue', sortByValue)
      if (existingPins.size > 0) {
        timeline = timeline.set('pins', existingPins)
      }
    }
    if ([GROUP_TIMELINE_SORTING_TYPE_TOP, PRO_POLLS_TIMELINE_SORTING_TYPE_MOST_VOTES].indexOf(sortByValue) > -1) {
      timeline = timeline.set('sortByTopValue', 'today')
    } else {
      timeline = timeline.set('sortByTopValue', null)
    }
  }

  function sortTop({ sortByValue = 'top', sortByTopValue }) {
    const currentSortTop = timeline.get('sortByTopValue')
    if (currentSortTop !== sortByTopValue) {
      const existingPins = timeline.get('pins')
      // the data is cleared if the sort changes
      timeline = createTimeline()
      timeline = timeline
        .set('sortByValue', sortByValue)
        .set('sortByTopValue', sortByTopValue)
      if (existingPins.size > 0) {
        timeline = timeline.set('pins', existingPins)
      }
    }
  }

  function configure({ opts }) {
    ;['prevUri', 'hasPrev', 'nextUri', 'hasNext', 'page'].forEach(function (
      key
    ) {
      const val = opts[key]
      if (val !== undefined && timeline.get(key) !== val) {
        timeline = timeline.set(key, val)
      }
    })
  }

  function loading({ isLoading }) {
    timeline = timeline.set('isLoading', isLoading)
  }

  function statusDelete({ statusId }) {
    timeline = deleteStatusFromTimeline(timeline, statusId)
  }

  function removeStale() {
    if (state.get('currentTimelineId') !== timelineId) {
      // it's not the timeline we're looking at
      state = state.delete(timelineId)
    }
  }

  function unloaded() {
    if (state.get('currentTimelineId') === timelineId) {
      state = state.delete('currentTimelineId')
    }
  }

  const transformMap = {
    [TIMELINE_DEQUEUE]: dequeue,
    [TIMELINE_ITEMS]: appendItems,
    [TIMELINE_PREPEND_ITEM]: prependOne,
    [TIMELINE_PINS]: prependPins,
    [TIMELINE_QUEUE]: queue,
    [TIMELINE_FAIL]: fail,
    [TIMELINE_SORT]: sort,
    [TIMELINE_SORT_TOP]: sortTop,
    [TIMELINE_CONFIGURE]: configure,
    [TIMELINE_LOADING]: loading,
    [TIMELINE_STATUS_DELETE]: statusDelete,
    [TIMELINE_REMOVE_STALE]: removeStale,
    [TIMELINE_UNLOADED]: unloaded
  }

  const transform = transformMap[type]

  if (typeof transform === 'function') {
    transform(action)
    if (type !== TIMELINE_UNLOADED) {
      state = state
        .set(timelineId, timeline)
        .set('currentTimelineId', timelineId)
    }
  }

  return state
}

//
// middleware
//

function getLinkUri(res, rel) {
  const link = getLinks(res).refs.find(link => link.rel === rel)
  const defaultValue = null
  return get(link, 'uri', defaultValue)
}

// load list(feed) side panel info
const loadList = throttle(
  (dispatch, listId) => dispatch(fetchList(listId)),
  1000
)

export const timelinesMiddleware =
  ({ getState, dispatch }) =>
  next =>
    function (action) {
      next(action) // do whatever mutations the messages do first

      const { type, timelineId } = action

      if (
        isString(type) === false ||
        type.startsWith('TIMELINE_') === false ||
        timelineId === undefined
      ) {
        // skip
        return
      }

      const state = getState()
      const timeline =
        state.getIn(['timelines', timelineId]) || createTimeline()

      // Is it a list(feed) timeline? Then it also needs the panel info.
      const isListTimeline = timelineId.startsWith('list:')
      if (isListTimeline) {
        const listId = timelineId.substring(5)
        const list = state.getIn(['lists', 'items', listId])
        if (!list) {
          loadList(dispatch, listId)
        }
      }

      function fetchError(error) {
        const { message, stack } = error
        console.error(
          'error fetching timeline:',
          timeline.toJS(),
          'action:',
          action,
          message,
          stack
        )
        dispatch(timelineFail(timelineId, error))
      }

      function fetchPins({ opts = {} }) {
        const { pinsEndpoint, endpoint } = opts
        const params = { pinned: true }
        return api(getState)
          .get(pinsEndpoint || endpoint, { params })
          .then(function ({ data: statuses }) {
            dispatch(importFetchedStatuses(statuses))
            const ids = statuses.map(({ id }) => id)
            dispatch(timelinePins(timelineId, ids))
          })
          .catch(fetchError)
      }

      function fetchPaged({ opts = {} }) {
        const combined = Object.assign({}, timeline.toJS(), opts)
        let page = timeline.get('page') || 1

        const {
          prevUri,
          nextUri,
          endpoint,
          isLoading,
          isComments,
          mediaType,
          maxPages,
          queueResults,
          dequeueResults,
          createParams,
          sorts = [],
          topSorts = [],
          withReplies,
          limit = defaultLimit,
          maxId,
          only_media
        } = combined

        if (isNumber(maxPages) && page >= maxPages) {
          return
        }

        if (isLoading) {
          return
        }

        dispatch(timelineLoading(timelineId))
        // if has shortcut for this timeline and if shortcut has unread count
        dispatch(clearShortcutCountByTimelineId(timelineId))

        const defaultSort = sorts.find(item => item.isDefault) || {}
        const defaultTopSort = topSorts.find(item => item.isDefault) || {}
        const settings = getSettings(timelineId)

        // can be undefined for timelines with no sort options dropdown
        const sortByValue =
          combined.sortByValue || settings.get('sortByValue') || defaultSort.key

        let sortByTopValue
        if ([GROUP_TIMELINE_SORTING_TYPE_TOP, PRO_POLLS_TIMELINE_SORTING_TYPE_MOST_VOTES].indexOf(sortByValue) > -1) {
          sortByTopValue =
            combined.sortByTopValue ||
            settings.get('sortByTopValue') ||
            defaultTopSort.key
        }

        combined.sortByValue = sortByValue
        combined.sortByTopValue = sortByTopValue

        //
        // fix wrong sort values
        //

        if (sorts.length > 0 && hasCharacters(sortByValue)) {
          const sortKeys = sorts.map(({ key }) => key)
          if (
            sortKeys.includes(sortByValue) === false &&
            hasCharacters(defaultSort.key)
          ) {
            // the value is not in our list
            return dispatch(timelineSort(timelineId, defaultSort.key))
          }
        }

        if (topSorts.length > 0 && hasCharacters(sortByTopValue)) {
          const topSortKeys = topSorts.map(({ key }) => key)
          if (
            topSortKeys.includes(sortByTopValue) === false &&
            hasCharacters(defaultTopSort.key)
          ) {
            // the value is not in our list
            return dispatch(timelineSortTop(timelineId, defaultTopSort.key))
          }
        }

        //
        // update sorts if it had none but it needs it
        //

        if (
          sortByValue !== undefined &&
          sortByValue !== timeline.get('sortByValue')
        ) {
          dispatch(timelineSort(timelineId, sortByValue))
        }

        if (
          sortByTopValue !== undefined &&
          sortByTopValue !== timeline.get('sortByTopValue')
        ) {
          dispatch(timelineSortTop(timelineId, sortByTopValue, sortByValue))
        }

        let pathname
        let params = {}

        if (queueResults && hasCharacters(prevUri)) {
          // prev is a link to a previous page provided by rails endpoints
          pathname = prevUri
        } else if (hasCharacters(nextUri)) {
          // next page
          pathname = nextUri
        } else {
          if (maxId !== undefined) {
            params.max_id = maxId
          } else if (page > 1) {
            params.page = page
          }
          pathname = endpoint
        }

        if (isComments) {
          params.only_comments = true
        }

        if (hasCharacters(mediaType)) {
          params.media_type = mediaType
          params.only_media = true
        }

        if (only_media) {
          params.only_media = true
        }

        if (isNumber(limit) && limit !== defaultLimit) {
          params.limit = limit
        }

        if (isBoolean(withReplies)) {
          params.with_replies = withReplies
        }

        if (isFunction(createParams)) {
          // createParams is provided by the timeline component
          params = Object.assign(params, createParams(combined))
        }

        api(getState)
          .get(pathname, { params })
          .then(function (res) {
            const { data: statusesTemp } = res
            const statuses = statusesTemp.filter(status => {
              if (timelineId !== 'home' && !timelineId.startsWith('group_collection:')) {
                return true
              }
              if (!status.group || !status.group.id) return true
              const groupId = status.group.id
              if (groupId === undefined) {
                return true
              }
              return !isBlockingGroupId(groupId)
            })
            const ids = statuses.map(({ id }) => id)
            const prevUri = getLinkUri(res, 'prev') || combined.prevUri
            const hasPrev = hasCharacters(prevUri)
            dispatch(importFetchedStatuses(statuses))
            if (queueResults) {
              // polling for queued items
              dispatch(timelineConfigure(timelineId, { prevUri, hasPrev }))
              dispatch(timelineQueue(timelineId, ids))
              if (dequeueResults) {
                // it might seem confusing but the user is PTR-ing so we get previous
                // page and immediately dequeue
                dispatch(timelineDequeue(timelineId))
              }
            } else {
              // loading new items at the bottom
              const nextUri = getLinkUri(res, 'next')

              /**
               * Does the response have all items that are already in our list?
               */
              const alreadyHaveThese = ids.every(
                id => timeline.get('items').includes(id)
              )

              // is there a next page? items not blank
              const hasNext = hasItems(ids) && !alreadyHaveThese

              page += 1
              const configOpts = { nextUri, hasNext, page }
              if (hasPrev && timeline.get('prevUri') === null) {
                // normal request can only set prevUri the first time, next time
                // is done by queue
                Object.assign(configOpts, { prevUri, hasPrev })
              }
              dispatch(timelineConfigure(timelineId, configOpts))
              dispatch(timelineItems(timelineId, ids))
            }
          })
          .catch(fetchError)
      }

      function sort({ sortByValue }) {
        const settings = getSettings(timelineId)
        if (hasCharacters(sortByValue)) {
          settings.set('sortByValue', sortByValue)
        } else {
          settings.remove(sortByValue)
        }
      }

      function sortTop({ sortByTopValue }) {
        const settings = getSettings(timelineId)
        if (hasCharacters(sortByTopValue)) {
          settings.set('sortByTopValue', sortByTopValue)
        } else {
          settings.remove(sortByTopValue)
        }
      }

      const reactionMap = {
        [TIMELINE_SORT]: sort,
        [TIMELINE_SORT_TOP]: sortTop,
        [TIMELINE_FETCH_PAGED]: fetchPaged,
        [TIMELINE_FETCH_PINS]: fetchPins
      }

      const reaction = reactionMap[type]

      if (isFunction(reaction)) {
        reaction(action)
      }
    }
