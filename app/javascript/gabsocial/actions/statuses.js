import debounce from 'lodash/debounce'
import api, { getLinks } from '../api'
import openDB from '../storage/db'
import { evictStatus } from '../storage/modifier'
import { importFetchedStatus, importFetchedStatuses, importAccount, importStatus } from './importer'
import { openModal } from './modal'
import { me } from '../initial_state'
import { COMMENT_SORTING_TYPE_NEWEST, MODAL_COMPOSE } from '../constants'
import { fetchBlocks } from './blocks'

export const STATUS_FETCH_REQUEST = 'STATUS_FETCH_REQUEST'
export const STATUS_FETCH_SUCCESS = 'STATUS_FETCH_SUCCESS'
export const STATUS_FETCH_FAIL    = 'STATUS_FETCH_FAIL'

export const STATUS_DELETE_REQUEST = 'STATUS_DELETE_REQUEST'
export const STATUS_DELETE_SUCCESS = 'STATUS_DELETE_SUCCESS'
export const STATUS_DELETE_FAIL    = 'STATUS_DELETE_FAIL'

export const CONTEXT_FETCH_REQUEST = 'CONTEXT_FETCH_REQUEST'
export const CONTEXT_FETCH_SUCCESS = 'CONTEXT_FETCH_SUCCESS'
export const CONTEXT_FETCH_FAIL    = 'CONTEXT_FETCH_FAIL'

export const STATUS_MUTE_REQUEST = 'STATUS_MUTE_REQUEST'
export const STATUS_MUTE_SUCCESS = 'STATUS_MUTE_SUCCESS'
export const STATUS_MUTE_FAIL    = 'STATUS_MUTE_FAIL'

export const STATUS_UNMUTE_REQUEST = 'STATUS_UNMUTE_REQUEST'
export const STATUS_UNMUTE_SUCCESS = 'STATUS_UNMUTE_SUCCESS'
export const STATUS_UNMUTE_FAIL    = 'STATUS_UNMUTE_FAIL'

export const COMMENTS_FETCH_REQUEST = 'COMMENTS_FETCH_REQUEST'
export const COMMENTS_FETCH_SUCCESS = 'COMMENTS_FETCH_SUCCESS'
export const COMMENTS_FETCH_FAIL    = 'COMMENTS_FETCH_FAIL'

export const STATUS_REVEAL = 'STATUS_REVEAL'
export const STATUS_HIDE   = 'STATUS_HIDE'

export const STATUS_SHOW_ANYWAYS         = 'STATUS_SHOW_ANYWAYS'
export const STATUS_SHOW_ACCOUNT_ANYWAYS = 'STATUS_SHOW_ACCOUNT_ANYWAYS'

export const STATUS_EDIT = 'STATUS_EDIT'

export const UPDATE_STATUS_STATS = 'UPDATE_STATUS_STATS'

export const CLEAR_ALL_COMMENTS = 'CLEAR_ALL_COMMENTS'

export const STATUS_REACTIONS_FETCH_REQUEST = 'STATUS_REACTIONS_FETCH_REQUEST'
export const STATUS_REACTIONS_FETCH_SUCCESS = 'STATUS_REACTIONS_FETCH_SUCCESS'
export const STATUS_REACTIONS_FETCH_FAIL    = 'STATUS_REACTIONS_FETCH_FAIL'

export const CONVERSATION_OWNER_FETCH_REQUEST = 'CONVERSATION_OWNER_FETCH_REQUEST'
export const CONVERSATION_OWNER_FETCH_SUCCESS = 'CONVERSATION_OWNER_FETCH_SUCCESS'
export const CONVERSATION_OWNER_FETCH_FAIL = 'CONVERSATION_OWNER_FETCH_FAIL'

export const REMOVE_REPLY_REQUEST = 'REMOVE_REPLY_REQUEST'
export const REMOVE_REPLY_SUCCESS = 'REMOVE_REPLY_SUCCESS'
export const REMOVE_REPLY_FAIL = 'REMOVE_REPLY_FAIL'

export const FETCH_STATUS_STATS_FAIL = 'FETCH_STATUS_STATS_FAIL'

/**
 *
 */
function getFromDB(dispatch, getState, accountIndex, index, id) {
  return new Promise((resolve, reject) => {
    const request = index.get(id)

    request.onerror = reject

    request.onsuccess = () => {
      const promises = []

      if (!request.result) {
        reject()
        return
      }

      dispatch(importStatus(request.result))

      if (getState().getIn(['accounts', request.result.account], null) === null) {
        promises.push(new Promise((accountResolve, accountReject) => {
          const accountRequest = accountIndex.get(request.result.account)

          accountRequest.onerror = accountReject
          accountRequest.onsuccess = () => {
            if (!request.result) {
              accountReject()
              return
            }

            dispatch(importAccount(accountRequest.result))
            accountResolve()
          }
        }))
      }

      if (request.result.reblog && getState().getIn(['statuses', request.result.reblog], null) === null) {
        promises.push(getFromDB(dispatch, getState, accountIndex, index, request.result.reblog))
      }

      resolve(Promise.all(promises))
    }
  })
}

/**
 *
 */
export const fetchStatus = (id) => (dispatch, getState) => {
  if (!id) return

  const skipLoading = getState().getIn(['statuses', id], null) !== null
  if (skipLoading) return

  dispatch(fetchStatusRequest(id, skipLoading))

  openDB().then((db) => {
    const transaction = db.transaction(['accounts', 'statuses'], 'read')
    const accountIndex = transaction.objectStore('accounts').index('id')
    const index = transaction.objectStore('statuses').index('id')

    return getFromDB(dispatch, getState, accountIndex, index, id).then(() => {
      db.close()
    }, (error) => {
      db.close()
      throw error
    })
  }).then(() => {
    dispatch(fetchStatusSuccess(skipLoading))
  }, () => api(getState).get(`/api/v1/statuses/${id}`).then((response) => {
    dispatch(importFetchedStatus(response.data))
    dispatch(fetchStatusSuccess(skipLoading))
  })).catch((error) => {
    dispatch(fetchStatusFail(id, error, skipLoading))
  })
}

const fetchStatusRequest = (id, skipLoading) => ({
  type: STATUS_FETCH_REQUEST,
  id,
  skipLoading,
})

const fetchStatusSuccess = (skipLoading) => ({
  type: STATUS_FETCH_SUCCESS,
  skipLoading,
})

const fetchStatusFail = (id, error, skipLoading) => ({
  type: STATUS_FETCH_FAIL,
  id,
  error,
  skipLoading,
  skipAlert: true,
})


/**
 *
 */
export const editStatus = (status) => (dispatch) => {
  dispatch({
    type: STATUS_EDIT,
    status,
  })

  dispatch(openModal(MODAL_COMPOSE, { editStatus: status, isEditing: true }))
}

/**
 *
 */
export const deleteStatus = (id) => (dispatch, getState) => {
  if (!me || !id) return

  let status = getState().getIn(['statuses', id])
  let replyToId = status.get('in_reply_to_id')
  let topLevelOPStatusId = status.get('conversation_owner_status_id')

  if (status.get('poll')) {
    status = status.set('poll', getState().getIn(['polls', status.get('poll')]))
  }

  dispatch(deleteStatusRequest(id))

  api(getState).delete(`/api/v1/statuses/${id}`).then(() => {
    evictStatus(id)
    dispatch(deleteStatusSuccess(id))
    if (replyToId) {
      setTimeout(() => { dispatch(fetchStatusStats(replyToId)) }, 5000)
    }
    if (topLevelOPStatusId && topLevelOPStatusId !== replyToId) {
      setTimeout(() => { dispatch(fetchStatusStats(topLevelOPStatusId)) }, 5000)
    }
  }).catch((error) => {
    dispatch(deleteStatusFail(id, error))
  })
}

const deleteStatusRequest = (id) => ({
  type: STATUS_DELETE_REQUEST,
  id: id,
})

const deleteStatusSuccess = (id) => ({
  type: STATUS_DELETE_SUCCESS,
  id: id,
})

const deleteStatusFail = (id, error) => ({
  type: STATUS_DELETE_FAIL,
  id: id,
  error,
})


/**
 *
 */
 export const fetchStatusStats = (id) => (dispatch, getState) => {
  if (!me || !id) return

  const skipLoading = getState().getIn(['statuses', id], null) == null
  if (skipLoading) return

  api(getState).get(`/api/v1/status_stats/${id}`).then((response) => {
    dispatch(updateStatusStats(response.data))
  }).catch((error) => {
    console.log(error)
    dispatch(fetchStatusStatsFail(id, error))
  })
}

const fetchStatusStatsFail = (id, error) => ({
  type: FETCH_STATUS_STATS_FAIL,
  id: id,
  error,
})



/**
 *
 */
export const fetchContext = (id, ensureIsReply) => (dispatch, getState) => {
  if (!id) return

  if (ensureIsReply) {
    const isReply = !!getState().getIn(['statuses', id, 'in_reply_to_id'], null)
    if (!isReply) return
  }

  dispatch(fetchContextRequest(id))

  api(getState).get(`/api/v1/statuses/${id}/context`).then((response) => {
    dispatch(importFetchedStatuses(response.data.ancestors.concat(response.data.descendants).concat(response.data.quoted)))
    dispatch(fetchContextSuccess(id, response.data.ancestors, response.data.descendants))
  }).catch((error) => {
    dispatch(fetchContextFail(id, error))
  })
}

/**
 *
 */
const fetchContextRequest = (id) => ({
  type: CONTEXT_FETCH_REQUEST,
  id,
})

const fetchContextSuccess = (id, ancestors, descendants) => ({
  type: CONTEXT_FETCH_SUCCESS,
  id,
  ancestors,
  descendants,
  statuses: ancestors.concat(descendants),
})

const fetchContextFail = (id, error) => ({
  type: CONTEXT_FETCH_FAIL,
  id,
  error,
  skipAlert: true,
})

/**
 *
 */
export const fetchComments = (id, forceNewest, ignoreFetched) => (dispatch, getState) => {
  debouncedFetchComments(id, forceNewest, ignoreFetched, dispatch, getState)
}

export const debouncedFetchComments = debounce((id, forceNewest, ignoreFetched, dispatch, getState) => {
  if (!id) return

  const sort = forceNewest ? COMMENT_SORTING_TYPE_NEWEST : getState().getIn(['settings', 'commentSorting'])
  const fetchNext = getState().getIn(['contexts', 'nexts', id])
  const fetchedStatusParts = getState().getIn(['contexts', 'fetchedStatusParts', id])
  if (fetchedStatusParts && !ignoreFetched) return

  dispatch(fetchCommentsRequest(id))

  const url = !!fetchNext ? fetchNext : `/api/v1/status_comments/${id}?sort_by=${sort}`

  api(getState).get(url).then((response) => {
    const next = getLinks(response).refs.find(link => link.rel === 'next')
    dispatch(importFetchedStatuses(response.data))
    dispatch(fetchCommentsSuccess(id, response.data, next.uri))
  }).catch((error) => {
    if (error.response && error.response.status === 404) {
      // dispatch(deleteFromTimelines(id))
    }

    dispatch(fetchCommentsFail(id, error))
  })
}, 650, { leading: true })

const fetchCommentsRequest = (id) => ({
  type: COMMENTS_FETCH_REQUEST,
  id,
})

export const fetchCommentsSuccess = (id, descendants, next) => ({
  type: COMMENTS_FETCH_SUCCESS,
  id,
  descendants,
  next,
})

const fetchCommentsFail = (id, error) => ({
  type: COMMENTS_FETCH_FAIL,
  id,
  error,
  skipAlert: true,
})

// clearAllComments
export const clearAllComments = (id) => (dispatch) => {
  if (!id) return

  dispatch({
    type: CLEAR_ALL_COMMENTS,
    id,
  })
}

/**
 *
 */
export const hideStatus = (ids) => {
  if (!Array.isArray(ids)) {
    ids = [ids]
  }

  return {
    type: STATUS_HIDE,
    ids,
  }
}

/**
 *
 */
export const revealStatus = (ids) => {
  if (!Array.isArray(ids)) {
    ids = [ids]
  }

  return {
    type: STATUS_REVEAL,
    ids,
  }
}

/**
 *
 */
export const showStatusAnyways = (statusId) => ({
  type: STATUS_SHOW_ANYWAYS,
  statusId,
})

export const toggleAccountStatusAnyways = (accountId, onOrOff) => ({
  type: STATUS_SHOW_ACCOUNT_ANYWAYS,
  accountId,
  onOrOff,
})

/**
 * 
 */
export const updateStatusStats = (data) => ({
  type: UPDATE_STATUS_STATS,
  data,
})

/**
 *
 */
export const muteStatus = (id) => (dispatch, getState) => {
  dispatch(muteStatusRequest(id))

  api(getState).post(`/api/v1/statuses/${id}/mute`).then(() => {
    dispatch(muteStatusSuccess(id))
  }).catch((error) => {
    dispatch(muteStatusFail(id, error))
  })
}

const muteStatusRequest = (id) => ({
  type: STATUS_MUTE_REQUEST,
  id,
})

const muteStatusSuccess = (id) => ({
  type: STATUS_MUTE_SUCCESS,
  id,
})

const muteStatusFail = (id, error) => ({
  type: STATUS_MUTE_FAIL,
  id,
  error,
})

/**
 *
 */
export const unmuteStatus = (id) => (dispatch, getState) => {
  dispatch(unmuteStatusRequest(id))

  api(getState).post(`/api/v1/statuses/${id}/unmute`).then(() => {
    dispatch(unmuteStatusSuccess(id))
  }).catch((error) => {
    dispatch(unmuteStatusFail(id, error))
  })
}

const unmuteStatusRequest = (id) => ({
  type: STATUS_UNMUTE_REQUEST,
  id,
})

const unmuteStatusSuccess = (id) => ({
  type: STATUS_UNMUTE_SUCCESS,
  id,
})

const unmuteStatusFail = (id, error) => ({
  type: STATUS_UNMUTE_FAIL,
  id,
  error,
})

export const fetchStatusReactions = (statusId) => (dispatch, getState) => {
  dispatch(fetchReactionsRequest(statusId))

  api(getState).get(`/api/v1/statuses/${statusId}/reactions`).then((response) => {
    dispatch(fetchReactionsSuccess(statusId, response.data))
  }).catch((error) => {
    dispatch(fetchReactionsFail(statusId, error))
  })
}

const fetchReactionsRequest = (statusId) => ({
  type: STATUS_REACTIONS_FETCH_REQUEST,
  statusId,
})

const fetchReactionsSuccess = (statusId, reactions) => ({
  type: STATUS_REACTIONS_FETCH_SUCCESS,
  statusId,
  reactions,
})

const fetchReactionsFail = (statusId, error) => ({
  type: STATUS_REACTIONS_FETCH_FAIL,
  statusId,
  error,
})

export const fetchConversationOwner = (statusId, conversationId, update_after) => (dispatch, getState) => {
  dispatch(fetchConversationOwnerRequest(statusId, conversationId))

  api(getState).get(`/api/v1/conversation_owner/${conversationId}`).then(({ data }) => {
    dispatch(fetchConversationOwnerSuccess(statusId, conversationId, data.account_id, data.coversation_owner_status_id))
    if (update_after && statusId != data.coversation_owner_status_id) {
      dispatch(fetchStatusStats(data.coversation_owner_status_id))
    }
  }).catch((error) => {
    dispatch(fetchConversationOwnerFail(statusId, conversationId, error))
  })
}

const fetchConversationOwnerRequest = (statusId, conversationId) => ({
  type: CONVERSATION_OWNER_FETCH_REQUEST,
  statusId,
  conversationId,
})

const fetchConversationOwnerSuccess = (statusId, conversationId, owner, ownerStatusId) => ({
  type: CONVERSATION_OWNER_FETCH_SUCCESS,
  statusId,
  conversationId,
  owner,
  ownerStatusId,
})

const fetchConversationOwnerFail = (statusId, conversationId, error) => ({
  type: CONVERSATION_OWNER_FETCH_FAIL,
  statusId,
  conversationId,
  error,
})


/**
 * 
 */
 export const removeReply = (statusId, block) => (dispatch, getState) => {
  if (!me || !statusId) return
  
  const topLevelOPStatusId = getState().getIn(['statuses', `${statusId}`, 'conversation_owner_status_id'])
  if (!topLevelOPStatusId) return

  dispatch(removeReplyRequest(statusId, topLevelOPStatusId, block))

  api(getState).post(`/api/v1/statuses/${statusId}/remove`, { block }).then((response) => {
    dispatch(removeReplySuccess(statusId, topLevelOPStatusId, block))
    dispatch(fetchStatusStats(topLevelOPStatusId))
    if (block) {
      dispatch(fetchBlocks())
    }
  }).catch((error) => {
    console.log(error)
    dispatch(removeReplyFail(statusId, block, error))
  })
}

const removeReplyRequest = (statusId, topLevelOPStatusId, block) => ({
  type: REMOVE_REPLY_REQUEST,
  statusId,
  topLevelOPStatusId,
  block,
})

const removeReplySuccess = (statusId, topLevelOPStatusId, block) => ({
  type: REMOVE_REPLY_SUCCESS,
  showToast: true,
  statusId,
  topLevelOPStatusId,
  block
})

const removeReplyFail = (statusId, block, error) => ({
  type: REMOVE_REPLY_FAIL,
  showToast: true,
  statusId,
  block,
  error
})
