import { Map as ImmutableMap, fromJS } from 'immutable'
import {
  CHAT_MESSAGES_SEND_SUCCESS,
  CHAT_MESSAGES_DELETE_REQUEST,
  CHAT_MESSAGES_PURGE_REQUEST,
  CHAT_MESSAGE_SHOW_ANYWAYS,
} from '../actions/chat_messages'
import {
  CHAT_MESSAGES_IMPORT,
} from '../actions/importer'
import {
  ACCOUNT_BLOCK_REQUEST,
  ACCOUNT_MUTE_REQUEST,
  ACCOUNT_UNBLOCK_REQUEST,
  ACCOUNT_UNMUTE_REQUEST,
} from '../actions/accounts'

const importChatMessage = (state, chatMessage) => state.set(chatMessage.id, fromJS(chatMessage))

const importChatMessages = (state, chatMessages) =>
  state.withMutations((mutable) => chatMessages.forEach((chatMessage) => importChatMessage(mutable, chatMessage)))

const deleteChatMessage = (state, id) => {
  return state.delete(id)
}

const initialState = ImmutableMap()

export default function chat_messages(state = initialState, action) {
  switch(action.type) {
  case CHAT_MESSAGES_IMPORT:
    return importChatMessages(state, action.chatMessages)
  case CHAT_MESSAGES_SEND_SUCCESS:
    return importChatMessage(state, action.chatMessage)
  case CHAT_MESSAGES_DELETE_REQUEST:
    return deleteChatMessage(state, action.chatMessageId)
  case CHAT_MESSAGES_PURGE_REQUEST:
    return state
  case CHAT_MESSAGE_SHOW_ANYWAYS:
    return state.setIn([action.chatMessageId, 'show_anyways'], true)
  case ACCOUNT_BLOCK_REQUEST:
  case ACCOUNT_MUTE_REQUEST:
    return state.withMutations((map) => {
      map.forEach((mMap) => {
        if (`${mMap.get('account')}` === `${action.id}`) {
          map.setIn([mMap.get('id'), 'show_anyways'], false)
        }
      })
    })
  case ACCOUNT_UNBLOCK_REQUEST:
  case ACCOUNT_UNMUTE_REQUEST:
    return state.withMutations((map) => {
      map.forEach((mMap) => {
        if (`${mMap.get('account')}` === `${action.id}` && !mMap.get('show_anyways')) {
          map.setIn([mMap.get('id'), 'show_anyways'], true)
        }
      })
    })
  default:
    return state
  }
}
