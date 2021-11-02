import { Map as ImmutableMap, List as ImmutableList } from 'immutable'
import noop from 'lodash.noop'
import api, { getLinks } from '../api'
import { me } from '../initial_state'
import { importFetchedChatMessages } from './importer'

export const CHAT_CONVERSATION_MESSAGES_EXPAND_REQUEST = 'CHAT_CONVERSATION_MESSAGES_EXPAND_REQUEST'
export const CHAT_CONVERSATION_MESSAGES_EXPAND_SUCCESS = 'CHAT_CONVERSATION_MESSAGES_EXPAND_SUCCESS'
export const CHAT_CONVERSATION_MESSAGES_EXPAND_FAIL    = 'CHAT_CONVERSATION_MESSAGES_EXPAND_FAIL'

export const CHAT_CONVERSATION_MESSAGES_CONNECT    = 'CHAT_CONVERSATION_MESSAGES_CONNECT'
export const CHAT_CONVERSATION_MESSAGES_DISCONNECT = 'CHAT_CONVERSATION_MESSAGES_DISCONNECT'

export const CHAT_CONVERSATION_MESSAGES_SCROLL_BOTTOM = 'CHAT_CONVERSATION_MESSAGES_SCROLL_BOTTOM'

/**
 * Expand chat messages by chatConversationId
 * @param {String} chatConversationId
 * @param {Object} params
 */
export const expandChatMessages = (chatConversationId, params = {}, done = noop) => (dispatch, getState) => {
  // must be logged in and have id
  if (!me || !chatConversationId) return

  // get existing conversation state
  const chatConversation = getState().getIn(['chat_conversations', chatConversationId], ImmutableMap())
  // check if initial load already occured and if we need to load more
  const isLoadingMore = !!params.maxId

  // check if has conversation and if it isnt already loading and no error
  if (!!chatConversation && (chatConversation.get('isLoading') || chatConversation.get('isError'))) {
    done()
    return
  }

  // if no maxId present, we need to load from the start or "since" 
  if (!params.maxId && chatConversation.get('items', ImmutableList()).size > 0) {
    params.sinceId = chatConversation.getIn(['items', 0])
  }

  const isLoadingRecent = !!params.sinceId

  dispatch(expandChatMessagesRequest(chatConversationId, isLoadingMore))

  api(getState).get(`/api/v1/chat_conversations/messages/${chatConversationId}`, {
    params: {
      max_id: params.maxId,
      since_id: params.sinceId,
    }
  }).then((response) => {
    const next = getLinks(response).refs.find(link => link.rel === 'next')
    dispatch(importFetchedChatMessages(response.data))
    dispatch(expandChatMessagesSuccess(chatConversationId, response.data, next ? next.uri : null, response.code === 206, isLoadingRecent, isLoadingMore))
    done()
  }).catch((error) => {
    dispatch(expandChatMessagesFail(chatConversationId, error, isLoadingMore))
    done()
  })
}

export const expandChatMessagesRequest = (chatConversationId, isLoadingMore) => ({
  type: CHAT_CONVERSATION_MESSAGES_EXPAND_REQUEST,
  chatConversationId,
  skipLoading: !isLoadingMore,
})

export const expandChatMessagesSuccess = (chatConversationId, chatMessages, next, partial, isLoadingRecent, isLoadingMore) => ({
  type: CHAT_CONVERSATION_MESSAGES_EXPAND_SUCCESS,
  chatConversationId,
  chatMessages,
  next,
  partial,
  isLoadingRecent,
  skipLoading: !isLoadingMore,
})

export const expandChatMessagesFail = (chatConversationId, error, isLoadingMore) => ({
  type: CHAT_CONVERSATION_MESSAGES_EXPAND_FAIL,
  showToast: true,
  chatConversationId,
  error,
  skipLoading: !isLoadingMore,
})


/**
 * Action to mark the current conversation a user is in as "connected"
 * Which means that it will receive real time updates
 * @param {String} chatConversationId
 */
export const connectChatMessageConversation = (chatConversationId) => ({
  type: CHAT_CONVERSATION_MESSAGES_CONNECT,
  chatConversationId,
})

/**
 * Disconnect real time conversation by id 
 * @param {String} chatConversationId
 */
export const disconnectChatMessageConversation = (chatConversationId) => ({
  type: CHAT_CONVERSATION_MESSAGES_DISCONNECT,
  chatConversationId,
})

/**
 * Scroll to the bottom of the chat conversation
 * @param {String} chatConversationId
 */
export const scrollBottomChatMessageConversation = (chatConversationId, bottom) => ({
  type: CHAT_CONVERSATION_MESSAGES_SCROLL_BOTTOM,
  chatConversationId,
  bottom,
})
