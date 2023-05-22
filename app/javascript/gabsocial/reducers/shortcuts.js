import {
  SHORTCUTS_FETCH_REQUEST,
  SHORTCUTS_FETCH_SUCCESS,
  SHORTCUTS_FETCH_FAIL,
  SHORTCUTS_ADD_SUCCESS,
  SHORTCUTS_REMOVE_SUCCESS,
  SHORTCUTS_CLEAR_COUNT_REQUEST,
} from '../actions/shortcuts'
import { importFetchedAccount } from '../actions/importer'
import { importGroup } from '../actions/groups'
import { importList } from '../actions/lists'
import { importHashtag } from '../actions/hashtags'
import { Map as ImmutableMap, List as ImmutableList, fromJS } from 'immutable'

const initialState = ImmutableMap({
  items: ImmutableList(),
  isLoading: false,
  isFetched: false,
  isError: false,
})

const normalizeShortcut = (shortcut) => {
  if (shortcut.shortcut_type === 'account') {
    importFetchedAccount(shortcut.shortcut)
    return {
      id: shortcut.id,
      shortcut_type: 'account',
      shortcut_id: shortcut.shortcut_id,
      unread_count: shortcut.unread_count || 0,
      title: shortcut.shortcut.acct,
      image: shortcut.shortcut.avatar_static_small,
      to: `/${shortcut.shortcut.acct}?nopins=1`,
    }
  } else if (shortcut.shortcut_type === 'group') {
    importGroup(shortcut.shortcut)
    return {
      id: shortcut.id,
      shortcut_type: 'group',
      shortcut_id: shortcut.shortcut_id,
      unread_count: shortcut.unread_count || 0,
      title: shortcut.shortcut.title,
      image: shortcut.shortcut.cover_image_url,
      to: `/groups/${shortcut.shortcut.id}`,
    }
  } else if (shortcut.shortcut_type === 'list') {
    importList(shortcut.shortcut)
    return {
      id: shortcut.id,
      shortcut_type: 'list',
      shortcut_id: shortcut.shortcut_id,
      unread_count: shortcut.unread_count || 0,
      title: shortcut.shortcut.title,
      icon: 'list',
      to: `/feeds/${shortcut.shortcut.id}`,
    }
  } else if (shortcut.shortcut_type === 'tag') {
    importHashtag(shortcut.shortcut)
    return {
      id: shortcut.id,
      shortcut_type: 'tag',
      shortcut_id: shortcut.shortcut_id,
      unread_count: shortcut.unread_count || 0,
      title: shortcut.shortcut.name,
      to: `/tags/${shortcut.shortcut.name}`,
    }
  }
}

const normalizeShortcuts = (shortcuts) => {
  return fromJS(shortcuts.map((shortcut) => {
    return normalizeShortcut(shortcut)
  }))
}

export default function shortcutsReducer(state = initialState, action) {
  switch(action.type) {
    case SHORTCUTS_FETCH_REQUEST:
      return state.withMutations((map) => {
        map.set('isLoading', true)
        map.set('isFetched', false)
        map.set('isError', false)
      })
    case SHORTCUTS_FETCH_SUCCESS:
      return state.withMutations((map) => {
        map.set('items', normalizeShortcuts(action.shortcuts))
        map.set('isLoading', false)
        map.set('isFetched', true)
        map.set('isError', false)
      })
    case SHORTCUTS_FETCH_FAIL:
      return state.withMutations((map) => {
        map.set('isLoading', false)
        map.set('isFetched', true)
        map.set('isError', true)
      })
    case SHORTCUTS_ADD_SUCCESS:
      const normalizedValue = normalizeShortcut(action.shortcut)
      if (!normalizedValue) return state
      return state.update('items', list => list.push(fromJS(normalizedValue)))
    case SHORTCUTS_REMOVE_SUCCESS:
      return state.update('items', list => list.filterNot((item) => {
        return `${item.get('id')}` === `${action.shortcutId}`
      }))
    case SHORTCUTS_CLEAR_COUNT_REQUEST:
      const shortcutIndex = state.get('items').findLastIndex((item) => item.get('id') === action.shortcutId)
      if (shortcutIndex < 0) return state
      state = state.updateIn(['items', shortcutIndex], (s) => {
        return s.set('unread_count', 0)
      })
      return state
    default:
      return state
  }
}

