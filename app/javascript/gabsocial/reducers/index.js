import { combineReducers } from 'redux-immutable'
import { loadingBarReducer } from 'react-redux-loading-bar'
import accounts from './accounts'
import accounts_counters from './accounts_counters'
import advertisements from './advertisements'
import albums from './albums'
import album_lists from './album_lists'
import bookmark_collections from './bookmark_collections'
import chats from './chats'
import chat_conversation_lists from './chat_conversation_lists'
import chat_conversation_messages from './chat_conversation_messages'
import chat_conversations from './chat_conversations'
import chat_messages from './chat_messages'
import chat_settings from './chat_settings'
import contexts from './contexts'
import custom_emojis from './custom_emojis'
import deck from './deck'
import filters from './filters'
import groups from './groups'
import group_categories from './group_categories'
import group_editor from './group_editor'
import group_lists from './group_lists'
import group_relationships from './group_relationships'
import hashtags from './hashtags'
import height_cache from './height_cache'
import links from './links.js'
import lists from './lists'
import lists_lists from './lists_lists'
import list_editor from './list_editor'
import list_relationships from './list_relationships'
import marketplace_listing_categories from './marketplace_listing_categories'
import marketplace_listing_dashboard from './marketplace_listing_dashboard'
import marketplace_listing_editor from './marketplace_listing_editor'
import marketplace_listing_search from './marketplace_listing_search'
import marketplace_listing_status_changes from './marketplace_listing_status_changes'
import marketplace_listings_lists from './marketplace_listings_lists'
import marketplace_listings from './marketplace_listings'
import media_attachments from './media_attachments'
import meta from './meta'
import modal from './modal'
import mutes from './mutes'
import news from './news'
import notifications from './notifications'
import polls from './polls'
import popover from './popover'
import push_notifications from './push_notifications'
import reactions from './reactions'
import relationships from './relationships'
import reports from './reports'
import router from './router'
import search from './search'
import settings from './settings'
import shop from './shop'
import shortcuts from './shortcuts'
import sidebar from './sidebar'
import statuses from './statuses'
import status_contexts from './status_contexts'
import status_lists from './status_lists'
import status_revisions from './status_revisions'
import suggestions from './suggestions'
import swipe from './swipe'
import timelines from '../store/timelines'
import timeline_injections from './timeline_injections'
import toasts from './toasts'
import user from './user'
import user_lists from './user_lists'
import warnings from './warnings'
import { voiceReducer } from '../store/voice_public_rooms'

const reducers = {
  accounts,
  accounts_counters,
  advertisements,
  albums,
  album_lists,
  bookmark_collections,
  chats,
  chat_conversation_lists,
  chat_conversation_messages,
  chat_conversations,
  chat_messages,
  chat_settings,
  contexts,
  custom_emojis,
  deck,
  filters,
  groups,
  group_categories,
  group_editor,
  group_lists,
  group_relationships,
  hashtags,
  height_cache,
  links,
  lists,
  lists_lists,
  list_editor,
  list_relationships,
  loadingBar: loadingBarReducer,
  marketplace_listing_categories,
  marketplace_listing_dashboard,
  marketplace_listing_editor,
  marketplace_listing_search,
  marketplace_listing_status_changes,
  marketplace_listings_lists,
  marketplace_listings,
  media_attachments,
  meta,
  modal,
  mutes,
  news,
  notifications,
  polls,
  popover,
  push_notifications,
  reactions,
  relationships,
  router,
  reports,
  search,
  settings,
  shop,
  shortcuts,
  sidebar,
  statuses,
  status_contexts,
  status_lists,
  status_revisions,
  suggestions,
  swipe,
  timelines,
  timeline_injections,
  toasts,
  user,
  user_lists,
  voice_pub_rooms: voiceReducer,
  warnings
}

export default combineReducers(reducers)
