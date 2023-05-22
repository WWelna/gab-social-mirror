import api, { getLinks } from '../api'
import debounce from 'lodash/debounce'
import {
  importFetchedAccounts,
  importFetchedChatMessages,
} from './importer'
import { closeModal } from './modal'
import { setChatConversationSelected } from './chats'
import { me } from '../initial_state'

//

export const CHAT_CONVERSATIONS_APPROVED_FETCH_REQUEST = 'CHAT_CONVERSATIONS_APPROVED_FETCH_REQUEST'
export const CHAT_CONVERSATIONS_APPROVED_FETCH_SUCCESS = 'CHAT_CONVERSATIONS_APPROVED_FETCH_SUCCESS'
export const CHAT_CONVERSATIONS_APPROVED_FETCH_FAIL    = 'CHAT_CONVERSATIONS_APPROVED_FETCH_FAIL'

export const CHAT_CONVERSATIONS_APPROVED_EXPAND_REQUEST = 'CHAT_CONVERSATIONS_APPROVED_EXPAND_REQUEST'
export const CHAT_CONVERSATIONS_APPROVED_EXPAND_SUCCESS = 'CHAT_CONVERSATIONS_APPROVED_EXPAND_SUCCESS'
export const CHAT_CONVERSATIONS_APPROVED_EXPAND_FAIL    = 'CHAT_CONVERSATIONS_APPROVED_EXPAND_FAIL'

export const CHAT_CONVERSATION_APPROVED_UNREAD_COUNT_FETCH_SUCCESS = 'CHAT_CONVERSATION_APPROVED_UNREAD_COUNT_FETCH_SUCCESS'

export const CHAT_CONVERSATION_UNREAD_COUNT_RESET_SUCCESS = 'CHAT_CONVERSATION_UNREAD_COUNT_RESET_SUCCESS'

export const CHAT_CONVERSATION_APPROVED_SEARCH_FETCH_SUCCESS = 'CHAT_CONVERSATION_APPROVED_SEARCH_FETCH_SUCCESS'

//

export const CHAT_CONVERSATION_FETCH_REQUEST = 'CHAT_CONVERSATION_FETCH_REQUEST'
export const CHAT_CONVERSATION_FETCH_SUCCESS = 'CHAT_CONVERSATION_FETCH_SUCCESS'
export const CHAT_CONVERSATION_FETCH_FAIL    = 'CHAT_CONVERSATION_FETCH_FAIL'

//

export const CHAT_CONVERSATIONS_CREATE_REQUEST = 'CHAT_CONVERSATIONS_CREATE_REQUEST'
export const CHAT_CONVERSATIONS_CREATE_SUCCESS = 'CHAT_CONVERSATIONS_CREATE_SUCCESS'
export const CHAT_CONVERSATIONS_CREATE_FAIL    = 'CHAT_CONVERSATIONS_CREATE_FAIL'

export const CHAT_CONVERSATIONS_DELETE_REQUEST = 'CHAT_CONVERSATIONS_DELETE_REQUEST'
export const CHAT_CONVERSATIONS_DELETE_SUCCESS = 'CHAT_CONVERSATIONS_DELETE_SUCCESS'
export const CHAT_CONVERSATIONS_DELETE_FAIL    = 'CHAT_CONVERSATIONS_DELETE_FAIL'

//

export const CHAT_CONVERSATION_REQUESTED_COUNT_FETCH_SUCCESS = 'CHAT_CONVERSATION_REQUESTED_COUNT_FETCH_SUCCESS'

export const CHAT_CONVERSATIONS_REQUESTED_FETCH_REQUEST = 'CHAT_CONVERSATIONS_REQUESTED_FETCH_REQUEST'
export const CHAT_CONVERSATIONS_REQUESTED_FETCH_SUCCESS = 'CHAT_CONVERSATIONS_REQUESTED_FETCH_SUCCESS'
export const CHAT_CONVERSATIONS_REQUESTED_FETCH_FAIL    = 'CHAT_CONVERSATIONS_REQUESTED_FETCH_FAIL'

export const CHAT_CONVERSATIONS_REQUESTED_EXPAND_REQUEST = 'CHAT_CONVERSATIONS_REQUESTED_EXPAND_REQUEST'
export const CHAT_CONVERSATIONS_REQUESTED_EXPAND_SUCCESS = 'CHAT_CONVERSATIONS_REQUESTED_EXPAND_SUCCESS'
export const CHAT_CONVERSATIONS_REQUESTED_EXPAND_FAIL    = 'CHAT_CONVERSATIONS_REQUESTED_EXPAND_FAIL'

//

export const CHAT_CONVERSATIONS_MUTED_FETCH_REQUEST = 'CHAT_CONVERSATIONS_MUTED_FETCH_REQUEST'
export const CHAT_CONVERSATIONS_MUTED_FETCH_SUCCESS = 'CHAT_CONVERSATIONS_MUTED_FETCH_SUCCESS'
export const CHAT_CONVERSATIONS_MUTED_FETCH_FAIL    = 'CHAT_CONVERSATIONS_MUTED_FETCH_FAIL'

export const CHAT_CONVERSATIONS_MUTED_EXPAND_REQUEST = 'CHAT_CONVERSATIONS_MUTED_EXPAND_REQUEST'
export const CHAT_CONVERSATIONS_MUTED_EXPAND_SUCCESS = 'CHAT_CONVERSATIONS_MUTED_EXPAND_SUCCESS'
export const CHAT_CONVERSATIONS_MUTED_EXPAND_FAIL    = 'CHAT_CONVERSATIONS_MUTED_EXPAND_FAIL'

//

export const CHAT_CONVERSATION_REQUEST_APPROVE_SUCCESS = 'CHAT_CONVERSATION_REQUEST_APPROVE_SUCCESS'
export const CHAT_CONVERSATION_REQUEST_APPROVE_FAIL    = 'CHAT_CONVERSATION_REQUEST_APPROVE_FAIL'

export const CHAT_CONVERSATION_DELETE_REQUEST = 'CHAT_CONVERSATION_DELETE_REQUEST'
export const CHAT_CONVERSATION_DELETE_SUCCESS = 'CHAT_CONVERSATION_DELETE_SUCCESS'
export const CHAT_CONVERSATION_DELETE_FAIL    = 'CHAT_CONVERSATION_DELETE_FAIL'

//

export const CHAT_CONVERSATION_MARK_READ_FETCH = 'CHAT_CONVERSATION_MARK_READ_FETCH'
export const CHAT_CONVERSATION_MARK_READ_SUCCESS = 'CHAT_CONVERSATION_MARK_READ_SUCCESS'
export const CHAT_CONVERSATION_MARK_READ_FAIL = 'CHAT_CONVERSATION_MARK_READ_FAIL'

export const CHAT_CONVERSATION_HIDE_FETCH = 'CHAT_CONVERSATION_HIDE_FETCH'
export const CHAT_CONVERSATION_HIDE_SUCCESS = 'CHAT_CONVERSATION_HIDE_SUCCESS'
export const CHAT_CONVERSATION_HIDE_FAIL = 'CHAT_CONVERSATION_HIDE_FAIL'

//

export const SET_CHAT_CONVERSATION_EXPIRATION_REQUEST = 'SET_CHAT_CONVERSATION_EXPIRATION_REQUEST'
export const SET_CHAT_CONVERSATION_EXPIRATION_SUCCESS = 'SET_CHAT_CONVERSATION_EXPIRATION_SUCCESS'
export const SET_CHAT_CONVERSATION_EXPIRATION_FAIL    = 'SET_CHAT_CONVERSATION_EXPIRATION_FAIL'

/**
 * @description Fetch paginated active chat conversations, import accounts and set chat conversations
 */
export const fetchChatConversations = params => (dispatch, getState) => {
  if (!me) return

  dispatch(fetchChatConversationsRequest(params))

  api(getState).get('/api/v1/chat_conversations/approved_conversations', { params }).then((response) => {
    const next = getLinks(response).refs.find(link => link.rel === 'next')
    const { data: convos } = response
    const conversationsAccounts = [].concat.apply([], convos.map((c) => c.other_accounts))
    const conversationsChatMessages = convos.map((c) => c.last_chat_message).filter(c => !!c)

    dispatch(importFetchedAccounts(conversationsAccounts))
    dispatch(importFetchedChatMessages(conversationsChatMessages))
    dispatch(fetchChatConversationsSuccess({
      chatConversations: convos,
      next: next ? next.uri : null,
      pinned: params && params.pinned
    }))
  }).catch((error) => {
    dispatch(fetchChatConversationsFail(error))
  })
}

export const fetchChatConversationsRequest = opts => ({
  type: CHAT_CONVERSATIONS_APPROVED_FETCH_REQUEST,
  ...opts
})

export const fetchChatConversationsSuccess = ({ chatConversations, next, pinned }) => ({
  type: CHAT_CONVERSATIONS_APPROVED_FETCH_SUCCESS,
  chatConversations,
  next,
  pinned
})

export const fetchChatConversationsFail = (error) => ({
  type: CHAT_CONVERSATIONS_APPROVED_FETCH_FAIL,
  showToast: true,
  error,
})

/**
 * @description Fetch single chat conversations, import accounts and set chat conversation
 */
 export const fetchChatConversation = (chatConversationId) => (dispatch, getState) => {
  if (!me || !chatConversationId) return

  dispatch(fetchChatConversationRequest())

  api(getState).get(`/api/v1/chat_conversation/${chatConversationId}`).then((response) => {
    dispatch(importFetchedAccounts(response.data.other_accounts))
    dispatch(fetchChatConversationSuccess(response.data))
  }).catch((error) => {
    dispatch(fetchChatConversationFail(error))
  })
}

export const fetchChatConversationRequest = () => ({
  type: CHAT_CONVERSATION_FETCH_REQUEST,
})

export const fetchChatConversationSuccess = (chatConversation) => ({
  type: CHAT_CONVERSATION_FETCH_SUCCESS,
  chatConversation,
})

export const fetchChatConversationFail = (error) => ({
  type: CHAT_CONVERSATION_FETCH_FAIL,
  error,
})

/**
 * @description Expand paginated active chat conversations, import accounts and set chat conversations
 */
export const expandChatConversations = () => (dispatch, getState) => {
  if (!me) return
  
  const url = getState().getIn(['chat_conversation_lists', 'approved', 'next'])
  const isLoading = getState().getIn(['chat_conversation_lists', 'approved', 'isLoading'])

  if (!url || url === null || isLoading) return

  dispatch(expandChatConversationsRequest())

  api(getState).get(url).then(response => {
    const next = getLinks(response).refs.find(link => link.rel === 'next')
    const conversationsAccounts = [].concat.apply([], response.data.map((c) => c.other_accounts))
    const conversationsChatMessages = response.data.map((c) => c.last_chat_message).filter(c => !!c)

    dispatch(importFetchedAccounts(conversationsAccounts))
    dispatch(importFetchedChatMessages(conversationsChatMessages))
    dispatch(expandChatConversationsSuccess(response.data, next ? next.uri : null))
  }).catch((error) => dispatch(expandChatConversationsFail(error)))
}

export const expandChatConversationsRequest = () => ({
  type: CHAT_CONVERSATIONS_APPROVED_EXPAND_SUCCESS,
})

export const expandChatConversationsSuccess = (chatConversations, next) => ({
  type: CHAT_CONVERSATIONS_APPROVED_EXPAND_SUCCESS,
  chatConversations,
  next,
})

export const expandChatConversationsFail = (error) => ({
  type: CHAT_CONVERSATIONS_APPROVED_EXPAND_SUCCESS,
  showToast: true,
  error,
})

/**
 * @description Fetch paginated requested chat conversations, import accounts and set chat conversations
 */
export const fetchChatConversationRequested = () => (dispatch, getState) => {
  if (!me) return

  dispatch(fetchChatConversationRequestedRequest())

  api(getState).get('/api/v1/chat_conversations/requested_conversations').then((response) => {
    const next = getLinks(response).refs.find(link => link.rel === 'next')
    const conversationsAccounts = [].concat.apply([], response.data.map((c) => c.other_accounts))
    const conversationsChatMessages = response.data.map((c) => c.last_chat_message).filter(c => !!c)

    dispatch(importFetchedAccounts(conversationsAccounts))
    dispatch(importFetchedChatMessages(conversationsChatMessages))
    dispatch(fetchChatConversationRequestedSuccess(response.data, next ? next.uri : null))
  }).catch((error) => {
    dispatch(fetchChatConversationRequestedFail(error))
  })
}

export const fetchChatConversationRequestedRequest = () => ({
  type: CHAT_CONVERSATIONS_REQUESTED_FETCH_REQUEST,
})

export const fetchChatConversationRequestedSuccess = (chatConversations, next) => ({
  type: CHAT_CONVERSATIONS_REQUESTED_FETCH_SUCCESS,
  chatConversations,
  next,
})

export const fetchChatConversationRequestedFail = (error) => ({
  type: CHAT_CONVERSATIONS_REQUESTED_FETCH_FAIL,
  showToast: true,
  error,
})

/**
 * @description Expand paginated requested chat conversations, import accounts and set chat conversations
 */
export const expandChatConversationRequested = () => (dispatch, getState) => {
  if (!me) return
  
  const url = getState().getIn(['chat_conversation_lists', 'requested', 'next'])
  const isLoading = getState().getIn(['chat_conversation_lists', 'requested', 'isLoading'])

  if (!url || url === null || isLoading) return

  dispatch(expandChatConversationRequestedRequest())

  api(getState).get(url).then(response => {
    const next = getLinks(response).refs.find(link => link.rel === 'next')
    const conversationsAccounts = [].concat.apply([], response.data.map((c) => c.other_accounts))
    const conversationsChatMessages = response.data.map((c) => c.last_chat_message).filter(c => !!c)

    dispatch(importFetchedAccounts(conversationsAccounts))
    dispatch(importFetchedChatMessages(conversationsChatMessages))
    dispatch(expandChatConversationRequestedSuccess(response.data, next ? next.uri : null))
  }).catch(error => {
    dispatch(expandChatConversationRequestedFail(error))
  })
}

export const expandChatConversationRequestedRequest = () => ({
  type: CHAT_CONVERSATIONS_REQUESTED_EXPAND_REQUEST,
})

export const expandChatConversationRequestedSuccess = (chatConversations, next) => ({
  type: CHAT_CONVERSATIONS_REQUESTED_EXPAND_SUCCESS,
  chatConversations,
  next,
})

export const expandChatConversationRequestedFail = (error) => ({
  type: CHAT_CONVERSATIONS_REQUESTED_EXPAND_FAIL,
  showToast: true,
  error,
})

/**
 * @description Fetch paginated muted chat conversations, import accounts and set chat conversations
 */
export const fetchChatConversationMuted = () => (dispatch, getState) => {
  if (!me) return

  dispatch(fetchChatConversationMutedRequest())

  api(getState).get('/api/v1/chat_conversations/muted_conversations').then((response) => {
    const next = getLinks(response).refs.find(link => link.rel === 'next')
    const conversationsAccounts = [].concat.apply([], response.data.map((c) => c.other_accounts))
    const conversationsChatMessages = response.data.map((c) => c.last_chat_message).filter(c => !!c)

    dispatch(importFetchedAccounts(conversationsAccounts))
    dispatch(importFetchedChatMessages(conversationsChatMessages))
    dispatch(fetchChatConversationMutedSuccess(response.data, next ? next.uri : null))
  }).catch((error) => {
    dispatch(fetchChatConversationMutedFail(error))
  })
}

export const fetchChatConversationMutedRequest = () => ({
  type: CHAT_CONVERSATIONS_MUTED_FETCH_REQUEST,
})

export const fetchChatConversationMutedSuccess = (chatConversations, next) => ({
  type: CHAT_CONVERSATIONS_MUTED_FETCH_SUCCESS,
  chatConversations,
  next,
})

export const fetchChatConversationMutedFail = (error) => ({
  type: CHAT_CONVERSATIONS_MUTED_FETCH_FAIL,
  showToast: true,
  error,
})

/**
 * @description Expand paginated muted chat conversations, import accounts and set chat conversations
 */
export const expandChatConversationMuted = () => (dispatch, getState) => {
  if (!me) return
  
  const url = getState().getIn(['chat_conversation_lists', 'muted', 'next'])
  const isLoading = getState().getIn(['chat_conversation_lists', 'muted', 'isLoading'])

  if (!url || url === null || isLoading) return

  dispatch(expandChatConversationMutedRequest())

  api(getState).get(url).then(response => {
    const next = getLinks(response).refs.find(link => link.rel === 'next')
    const conversationsAccounts = [].concat.apply([], response.data.map((c) => c.other_accounts))
    const conversationsChatMessages = response.data.map((c) => c.last_chat_message).filter(c => !!c)

    dispatch(importFetchedAccounts(conversationsAccounts))
    dispatch(importFetchedChatMessages(conversationsChatMessages))
    dispatch(expandChatConversationMutedSuccess(response.data, next ? next.uri : null))
  }).catch(error => dispatch(expandChatConversationMutedFail(error)))
}

export const expandChatConversationMutedRequest = () => ({
  type: CHAT_CONVERSATIONS_MUTED_EXPAND_REQUEST,
})

export const expandChatConversationMutedSuccess = (chatConversations, next) => ({
  type: CHAT_CONVERSATIONS_MUTED_EXPAND_SUCCESS,
  chatConversations,
  next,
})

export const expandChatConversationMutedFail = (error) => ({
  type: CHAT_CONVERSATIONS_MUTED_EXPAND_FAIL,
  showToast: true,
  error,
})

/**
 * @description Create a chat conversation with given accountId. May fail because of blocks.
 * @param {String} accountId
 */
export const createChatConversation = (accountId, routerHistory, done) => (dispatch, getState) => {
  if (!me || !accountId) return

  dispatch(createChatConversationRequest())

  api(getState).post('/api/v1/chat_conversation', { account_id: accountId }).then((response) => {
    dispatch(createChatConversationSuccess(response.data))
    dispatch(closeModal())
    dispatch(setChatConversationSelected(response.data.chat_conversation_id))
    if (routerHistory) routerHistory.push(`/messages/${response.data.chat_conversation_id}`)
    if (done) done(response.data.chat_conversation_id)
  }).catch((error) => {
    dispatch(createChatConversationFail(error))
  })
}

export const createChatConversationRequest = () => ({
  type: CHAT_CONVERSATIONS_CREATE_REQUEST,
})

export const createChatConversationSuccess = (chatConversation) => ({
  type: CHAT_CONVERSATIONS_CREATE_SUCCESS,
  showToast: true,
  chatConversation,
})

export const createChatConversationFail = (error) => ({
  type: CHAT_CONVERSATIONS_CREATE_FAIL,
  showToast: true,
  error,
})

/**
 * @description Delete a chat conversation with given chatConversationId.
 * @param {String} chatConversationId
 */
export const deleteChatConversation = (chatConversationId) => (dispatch, getState) => {
  if (!me || !chatConversationId) return

  dispatch(deleteChatConversationRequest(conversationId))

  api(getState).delete(`/api/v1/chat_conversation/${chatConversationId}`).then((response) => {
    dispatch(deleteChatConversationSuccess())
  }).catch((error) => {
    dispatch(deleteChatConversationFail(error))
  })
}

export const deleteChatConversationRequest = (conversationId) => ({
  type: CHAT_CONVERSATIONS_DELETE_REQUEST,
  conversationId,
})

export const deleteChatConversationSuccess = () => ({
  type: CHAT_CONVERSATIONS_DELETE_SUCCESS,
})

export const deleteChatConversationFail = (error) => ({
  type: CHAT_CONVERSATIONS_DELETE_FAIL,
  error,
})

/**
 * 
 */
export const fetchChatConversationRequestedCount = () => (dispatch, getState) => {
  if (!me) return

  api(getState).get('/api/v1/chat_conversations/requested_conversations/count').then(response => {
    dispatch({
      type: CHAT_CONVERSATION_REQUESTED_COUNT_FETCH_SUCCESS,
      count: response.data,
    })
  }).catch(() => {
    /** */
  })
}

/**
 * 
 */
export const fetchChatConversationUnreadCount = () => (dispatch, getState) => {
  if (!me) return

  api(getState).get('/api/v1/chat_conversations/approved_conversations/unread_count').then(response => {
    dispatch({
      type: CHAT_CONVERSATION_APPROVED_UNREAD_COUNT_FETCH_SUCCESS,
      count: response.data,
    })
  }).catch(() => {
    /** */
  })
}

/**
 * 
 */
export const chatConversationUnreadCountReset = () => (dispatch, getState) => {
  if (!me) return

  api(getState).post('/api/v1/chat_conversations/approved_conversations/reset_all_unread_count').then(() => {
    dispatch({
      type: CHAT_CONVERSATION_UNREAD_COUNT_RESET_SUCCESS,
    })
  }).catch(() => {
    /** */
  })
}

/**
 * 
 */
export const approveChatConversationRequest = (chatConversationId) => (dispatch, getState) => {
  if (!me|| !chatConversationId) return

  api(getState).post(`/api/v1/chat_conversation/${chatConversationId}/mark_chat_conversation_approved`).then((response) => {
    dispatch(approveChatConversationRequestSuccess(response.data))
  }).catch((error) => dispatch(approveChatConversationRequestFail(error)))
}

export const approveChatConversationRequestSuccess = (chatConversation) => ({
  type: CHAT_CONVERSATION_REQUEST_APPROVE_SUCCESS,
  chatConversation,
})

export const approveChatConversationRequestFail = () => ({
  type: CHAT_CONVERSATION_REQUEST_APPROVE_FAIL,
})

/**
 * 
 */
export const hideChatConversation = (chatConversationId) => (dispatch, getState) => {
  if (!me|| !chatConversationId) return

  dispatch(hideChatConversationFetch(chatConversationId))

  api(getState).post(`/api/v1/chat_conversation/${chatConversationId}/mark_chat_conversation_hidden`).then((response) => {
    dispatch(hideChatConversationSuccess(chatConversationId))
  }).catch((error) => dispatch(hideChatConversationFail(error)))
}

export const hideChatConversationFetch = (chatConversationId) => ({
  type: CHAT_CONVERSATION_HIDE_FETCH,
  chatConversationId,
})

export const hideChatConversationSuccess = (chatConversationId) => ({
  type: CHAT_CONVERSATION_HIDE_SUCCESS,
  chatConversationId,
  showToast: true,
})

export const hideChatConversationFail = () => ({
  type: CHAT_CONVERSATION_HIDE_FAIL,
  showToast: true,
})

/**
 * 
 */
export const readChatConversation = (chatConversationId) => (dispatch, getState) => {
  if (!me|| !chatConversationId) return

  const chatConversation = getState().getIn(['chat_conversations', chatConversationId])
  if (!chatConversation) return
  if (chatConversation.get('unread_count') < 1) return

  dispatch(readChatConversationFetch(chatConversation))

  api(getState).post(`/api/v1/chat_conversation/${chatConversationId}/mark_chat_conversation_read`).then((response) => {
    dispatch(readChatConversationSuccess(response.data))
  }).catch((error) => dispatch(readChatConversationFail(error)))
}

export const readChatConversationFetch = (chatConversation) => ({
  type: CHAT_CONVERSATION_MARK_READ_FETCH,
  chatConversation,
})

export const readChatConversationSuccess = (chatConversation) => ({
  type: CHAT_CONVERSATION_MARK_READ_SUCCESS,
  chatConversation,
})

export const readChatConversationFail = () => ({
  type: CHAT_CONVERSATION_MARK_READ_FAIL,
})

/**
 * 
 */
export const setChatConversationExpiration = (chatConversationId, expiration) => (dispatch, getState) => {
  if (!me|| !chatConversationId) return

  dispatch(setChatConversationExpirationFetch(chatConversationId))

  api(getState).post(`/api/v1/chat_conversation/${chatConversationId}/set_expiration_policy`, {
    expiration,
  }).then((response) => {
    dispatch(setChatConversationExpirationSuccess(response.data))
  }).catch((error) => dispatch(setChatConversationExpirationFail(error)))
}

export const setChatConversationExpirationFetch = (chatConversationId) => ({
  type: SET_CHAT_CONVERSATION_EXPIRATION_REQUEST,
  chatConversationId,
})

export const setChatConversationExpirationSuccess = (chatConversation) => ({
  type: SET_CHAT_CONVERSATION_EXPIRATION_SUCCESS,
  chatConversation,
})

export const setChatConversationExpirationFail = (error) => ({
  type: SET_CHAT_CONVERSATION_EXPIRATION_FAIL,
  error,
})


/**
 * 
 */
export const searchApprovedChatConversations = (query) => (dispatch, getState) => {
  if (!query) return
  debouncedSearchApprovedChatConversations(query, dispatch, getState) 
}

export const debouncedSearchApprovedChatConversations = debounce((query, dispatch, getState) => {
  if (!query) return
  
  api(getState).get('/api/v1/chat_conversations/search_conversations', {
    params: { q: query },
  }).then((response) => {
    const conversationsAccounts = [].concat.apply([], response.data.map((c) => c.other_accounts))
    dispatch(searchApprovedChatConversationsSuccess(response.data))
  }).catch(() => {
    //
  })
}, 650, { leading: true })

const searchApprovedChatConversationsSuccess = (chatConversations) => ({
  type: CHAT_CONVERSATION_APPROVED_SEARCH_FETCH_SUCCESS,
  chatConversations,
})
