import { Map as ImmutableMap, fromJS } from 'immutable'
import {
  CHAT_MESSAGES_SEND_SUCCESS,
  CHAT_MESSAGES_DELETE_REQUEST,
  CHAT_MESSAGES_PURGE_REQUEST,
} from '../actions/chat_messages'
import {
  CHAT_CONVERSATIONS_CREATE_SUCCESS,
  CHAT_CONVERSATIONS_APPROVED_FETCH_SUCCESS,
  CHAT_CONVERSATIONS_APPROVED_EXPAND_SUCCESS,
  CHAT_CONVERSATIONS_REQUESTED_FETCH_SUCCESS,
  CHAT_CONVERSATIONS_REQUESTED_EXPAND_SUCCESS,
  CHAT_CONVERSATIONS_MUTED_FETCH_SUCCESS,
  CHAT_CONVERSATIONS_MUTED_EXPAND_SUCCESS,
  CHAT_CONVERSATION_REQUEST_APPROVE_SUCCESS,
  CHAT_CONVERSATION_MARK_READ_SUCCESS,
  SET_CHAT_CONVERSATION_EXPIRATION_SUCCESS,
  CHAT_CONVERSATION_APPROVED_SEARCH_FETCH_SUCCESS,
  CHAT_CONVERSATION_HIDE_FETCH,
  CHAT_CONVERSATION_FETCH_SUCCESS,
} from '../actions/chat_conversations'
import {
  MUTE_CHAT_CONVERSATION_SUCCESS,
  UNMUTE_CHAT_CONVERSATION_SUCCESS,
  PIN_CHAT_CONVERSATION_SUCCESS,
  UNPIN_CHAT_CONVERSATION_SUCCESS,
  LEAVE_GROUP_CHAT_CONVERSATION_SUCCESS,
} from '../actions/chat_conversation_accounts'

const initialState = ImmutableMap()

export const normalizeChatConversation = (chatConversation) => {
  const { other_accounts, ...rest } = chatConversation
  return fromJS({
    ...rest,
    other_account_ids: other_accounts.map((a) => a.id),
  })
}

const setLastChatMessage = (state, chatMessage) => {
  return state.setIn([chatMessage.chat_conversation_id, 'last_chat_message'], fromJS(chatMessage))
}

const importChatConversation = (state, chatConversation) => state.set(chatConversation.chat_conversation_id, normalizeChatConversation(chatConversation))

const importChatConversations = (state, chatConversations) => {
  if (!Array.isArray(chatConversations)) return state

  return state.withMutations((mutable) => chatConversations.forEach((chatConversation) => importChatConversation(mutable, chatConversation)))
}

export default function chat_conversations(state = initialState, action) {
  switch(action.type) {
  case CHAT_CONVERSATION_REQUEST_APPROVE_SUCCESS:
  case SET_CHAT_CONVERSATION_EXPIRATION_SUCCESS:
  case CHAT_CONVERSATIONS_CREATE_SUCCESS:
    return importChatConversation(state, action.chatConversation)
  case CHAT_CONVERSATIONS_APPROVED_FETCH_SUCCESS:
  case CHAT_CONVERSATIONS_APPROVED_EXPAND_SUCCESS:
  case CHAT_CONVERSATIONS_REQUESTED_FETCH_SUCCESS:
  case CHAT_CONVERSATIONS_REQUESTED_EXPAND_SUCCESS:
  case CHAT_CONVERSATIONS_MUTED_FETCH_SUCCESS:
  case CHAT_CONVERSATIONS_MUTED_EXPAND_SUCCESS:
  case CHAT_CONVERSATION_APPROVED_SEARCH_FETCH_SUCCESS:
    return importChatConversations(state, action.chatConversations)
  case CHAT_MESSAGES_SEND_SUCCESS:
    return setLastChatMessage(state, action.chatMessage)
  case CHAT_CONVERSATION_HIDE_FETCH:
    return state.delete(action.chatConversationId)
  case CHAT_MESSAGES_PURGE_REQUEST:
    // : todo :
    return state
  case CHAT_CONVERSATION_FETCH_SUCCESS:
  case MUTE_CHAT_CONVERSATION_SUCCESS:
  case UNMUTE_CHAT_CONVERSATION_SUCCESS:
  case PIN_CHAT_CONVERSATION_SUCCESS:
  case UNPIN_CHAT_CONVERSATION_SUCCESS:
  case CHAT_CONVERSATION_MARK_READ_SUCCESS:
  case LEAVE_GROUP_CHAT_CONVERSATION_SUCCESS:
    return importChatConversation(state, action.chatConversation)
  default:
    return state
  }
}
