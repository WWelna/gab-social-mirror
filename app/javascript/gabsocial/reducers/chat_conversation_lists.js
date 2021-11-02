import { Map as ImmutableMap, List as ImmutableList } from 'immutable'
import {
  CHAT_CONVERSATIONS_APPROVED_FETCH_REQUEST,
  CHAT_CONVERSATIONS_APPROVED_FETCH_SUCCESS,
  CHAT_CONVERSATIONS_APPROVED_FETCH_FAIL,
  CHAT_CONVERSATIONS_APPROVED_EXPAND_REQUEST,
  CHAT_CONVERSATIONS_APPROVED_EXPAND_SUCCESS,
  CHAT_CONVERSATIONS_APPROVED_EXPAND_FAIL,

  CHAT_CONVERSATIONS_REQUESTED_FETCH_REQUEST,
  CHAT_CONVERSATIONS_REQUESTED_FETCH_SUCCESS,
  CHAT_CONVERSATIONS_REQUESTED_FETCH_FAIL,
  CHAT_CONVERSATIONS_REQUESTED_EXPAND_REQUEST,
  CHAT_CONVERSATIONS_REQUESTED_EXPAND_SUCCESS,
  CHAT_CONVERSATIONS_REQUESTED_EXPAND_FAIL,

  CHAT_CONVERSATION_REQUEST_APPROVE_SUCCESS,

  CHAT_CONVERSATIONS_MUTED_FETCH_REQUEST,
  CHAT_CONVERSATIONS_MUTED_FETCH_SUCCESS,
  CHAT_CONVERSATIONS_MUTED_FETCH_FAIL,
  CHAT_CONVERSATIONS_MUTED_EXPAND_REQUEST,
  CHAT_CONVERSATIONS_MUTED_EXPAND_SUCCESS,
  CHAT_CONVERSATIONS_MUTED_EXPAND_FAIL,
  CHAT_CONVERSATIONS_CREATE_SUCCESS,
  CHAT_CONVERSATION_APPROVED_SEARCH_FETCH_SUCCESS,
} from '../actions/chat_conversations'
import {
  PIN_CHAT_CONVERSATION_SUCCESS,
  UNPIN_CHAT_CONVERSATION_SUCCESS
} from '../actions/chat_conversation_accounts'

const initialState = ImmutableMap({
  approved: ImmutableMap({
    next: null,
    isLoading: false,
    items: ImmutableList(),
  }),
  requested: ImmutableMap({
    next: null,
    isLoading: false,
    items: ImmutableList(),
  }),
  muted: ImmutableMap({
    next: null,
    isLoading: false,
    items: ImmutableList(),
  }),
  approved_search: ImmutableMap({
    items: ImmutableList(),
  }),
  approved_pinned: ImmutableMap({
    items: ImmutableList(),
  }),
})

const normalizeList = (state, source, chatConversations, next) => {
  return state.update(source, listMap => listMap.withMutations(map => {
    const items = Array.isArray(chatConversations) ? ImmutableList(chatConversations.map(chatConversation => chatConversation.chat_conversation_id)) : ImmutableList()

    map.set('next', next)
    map.set('loaded', true)
    map.set('isLoading', false)
    map.set('items', items)
  }))
}

const appendToList = (state, source, chatConversations, next) => {
  return state.update(source, listMap => listMap.withMutations(map => {
    // : todo :
    // append to list based on chatConversation.last_chat_message_sent_at
    const items = Array.isArray(chatConversations) ? chatConversations.map(chatConversation => chatConversation.chat_conversation_id) : []

    map.set('next', next)
    map.set('isLoading', false)
    map.set('items', map.get('items').concat(items))
  }))
}

const appendOneToList = (state, source, chatConversation, next) => {
  return appendToList(state, source, [chatConversation], next)
}

const removeOneFromList = (state, source, chatConversationId) => {
  return state.update(source, listMap => listMap.withMutations(map => {
    map.set('items', map.get('items').filter(id => id !== chatConversationId))
  }))
}

export default function chat_conversation_lists(state = initialState, action) {
  switch (action.type) {
  case CHAT_CONVERSATIONS_APPROVED_FETCH_REQUEST:
  case CHAT_CONVERSATIONS_APPROVED_EXPAND_REQUEST:
    return state.setIn(['approved', 'isLoading'], true)
  case CHAT_CONVERSATIONS_APPROVED_FETCH_FAIL:
  case CHAT_CONVERSATIONS_APPROVED_EXPAND_FAIL:
    return state.setIn(['approved', 'isLoading'], false)
  case CHAT_CONVERSATIONS_APPROVED_FETCH_SUCCESS:
    if (Array.isArray(action.chatConversations)) {
      state = normalizeList(state, 'approved', action.chatConversations.filter((c) => !c.is_pinned), action.next)
      return normalizeList(state, 'approved_pinned', action.chatConversations.filter((c) => c.is_pinned), action.next)
    }
    return state
  case CHAT_CONVERSATIONS_APPROVED_EXPAND_SUCCESS:
    if (Array.isArray(action.chatConversations)) {
      state = appendToList(state, 'approved', action.chatConversations.filter((c) => !c.is_pinned), action.next)
      return appendToList(state, 'approved_pinned', action.chatConversations.filter((c) => c.is_pinned), action.next)
    }
    return state

  case CHAT_CONVERSATIONS_REQUESTED_FETCH_REQUEST:
  case CHAT_CONVERSATIONS_REQUESTED_EXPAND_REQUEST:
    return state.setIn(['requested', 'isLoading'], true)
  case CHAT_CONVERSATIONS_REQUESTED_FETCH_FAIL:
  case CHAT_CONVERSATIONS_REQUESTED_EXPAND_FAIL:
    return state.setIn(['requested', 'isLoading'], false)
  case CHAT_CONVERSATIONS_REQUESTED_FETCH_SUCCESS:
    return normalizeList(state, 'requested', action.chatConversations, action.next) 
  case CHAT_CONVERSATIONS_REQUESTED_EXPAND_SUCCESS:
    return appendToList(state, 'requested', action.chatConversations, action.next)

  case CHAT_CONVERSATION_REQUEST_APPROVE_SUCCESS:
    return removeOneFromList(state, 'requested', action.chatConversation.chat_conversation_id)

  case CHAT_CONVERSATIONS_MUTED_FETCH_REQUEST:
  case CHAT_CONVERSATIONS_MUTED_EXPAND_REQUEST:
    return state.setIn(['muted', 'isLoading'], true)
  case CHAT_CONVERSATIONS_MUTED_FETCH_FAIL:
  case CHAT_CONVERSATIONS_MUTED_EXPAND_FAIL:
    return state.setIn(['muted', 'isLoading'], false)
  case CHAT_CONVERSATIONS_MUTED_FETCH_SUCCESS:
    return normalizeList(state, 'muted', action.chatConversations, action.next) 
  case CHAT_CONVERSATIONS_MUTED_EXPAND_SUCCESS:
    return appendToList(state, 'muted', action.chatConversations, action.next)

  case CHAT_CONVERSATIONS_CREATE_SUCCESS:
    return appendToList(state, 'approved', [action.chatConversation], action.next)

  case CHAT_CONVERSATION_APPROVED_SEARCH_FETCH_SUCCESS:
    return normalizeList(state, 'approved_search', action.chatConversations, null)

  case PIN_CHAT_CONVERSATION_SUCCESS:
    // take from approved and move to approved_pinned
    state = removeOneFromList(state, 'approved', action.chatConversation.chat_conversation_id)
    return appendOneToList(state, 'approved_pinned', action.chatConversation, action.next)
  case UNPIN_CHAT_CONVERSATION_SUCCESS:
    // take from approved_pinned and move to approved
    state = removeOneFromList(state, 'approved_pinned', action.chatConversation.chat_conversation_id)
    return appendOneToList(state, 'approved', action.chatConversation, action.next)

  default:
    return state
  }
}
