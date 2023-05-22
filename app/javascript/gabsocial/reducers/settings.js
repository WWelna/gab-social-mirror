import {
  SETTING_CHANGE,
  SETTING_SAVE,
  WINDOW_DIMENSION_CHANGE
} from '../actions/settings'
import { STORE_HYDRATE } from '../actions/store'
import { EMOJI_USE } from '../actions/emojis'
import { LIST_DELETE_SUCCESS, LIST_FETCH_FAIL } from '../actions/lists'
import {
  DECK_SET_COLUMN_AT_INDEX,
  DECK_DELETE_COLUMN_AT_INDEX,
  DECK_CHANGE_COLUMN_AT_INDEX
} from '../actions/deck'
import {
  COMMENT_SORTING_TYPE_TOP,
  TIMELINE_INJECTION_WEIGHT_DEFAULT,
  TIMELINE_INJECTION_FEATURED_GROUPS,
  TIMELINE_INJECTION_GROUP_CATEGORIES,
  TIMELINE_INJECTION_PROGRESS,
  TIMELINE_INJECTION_PRO_UPGRADE,
  // TIMELINE_INJECTION_PWA,
  TIMELINE_INJECTION_SHOP,
  TIMELINE_INJECTION_USER_SUGGESTIONS,
  TIMELINE_INJECTION_GAB_TV_EXPLORE,
  GAB_DECK_MAX_ITEMS
} from '../constants'
import { Map as ImmutableMap, List as ImmutableList, fromJS } from 'immutable'
import uuid from '../utils/uuid'
import {
  showVideos,
  showSuggestedUsers,
  showGroups
} from '../initial_state'

const initialState = ImmutableMap({
  saved: true,
  shownOnboarding: false,
  skinTone: 1,
  isCompact: false,
  window_dimensions: ImmutableMap({
    width: 0,
    height: 0
  }),
  home: ImmutableMap({
    // ⚠️ TODO we can give these defaults but it can get overwritten by localstorage
    shows: ImmutableMap({
      videos: showVideos,
      suggestedUsers: showSuggestedUsers,
      groups: showGroups
    })
  }),
  commentSorting: COMMENT_SORTING_TYPE_TOP,
  gabDeckOrder: ImmutableList([]),

  // every dismiss reduces by half or set to zero for pwa, shop, pro
  injections: ImmutableMap({
    [TIMELINE_INJECTION_FEATURED_GROUPS]: TIMELINE_INJECTION_WEIGHT_DEFAULT,
    [TIMELINE_INJECTION_GROUP_CATEGORIES]: TIMELINE_INJECTION_WEIGHT_DEFAULT,
    [TIMELINE_INJECTION_PROGRESS]: TIMELINE_INJECTION_WEIGHT_DEFAULT,
    [TIMELINE_INJECTION_PRO_UPGRADE]: TIMELINE_INJECTION_WEIGHT_DEFAULT,
    // [TIMELINE_INJECTION_PWA]: TIMELINE_INJECTION_WEIGHT_DEFAULT,
    [TIMELINE_INJECTION_SHOP]: TIMELINE_INJECTION_WEIGHT_DEFAULT,
    [TIMELINE_INJECTION_USER_SUGGESTIONS]: TIMELINE_INJECTION_WEIGHT_DEFAULT,
    [TIMELINE_INJECTION_GAB_TV_EXPLORE]: TIMELINE_INJECTION_WEIGHT_DEFAULT,
    // [TIMELINE_INJECTION_VOICE_PUBLIC_ROOMS]: TIMELINE_INJECTION_WEIGHT_DEFAULT * 2 // pump this right now
  }),

  displayOptions: ImmutableMap({
    fontSize: 'normal',
    radiusSmallDisabled: false,
    radiusCircleDisabled: false,
    logoDisabled: false,
    theme: 'white'
  })

  // home: ImmutableMap({
  //   shows: ImmutableMap({
  //     reply: true,
  //     repost: true,
  //   }),
  // }),
})

const defaultColumns = fromJS([
  { id: 'COMPOSE', uuid: uuid(), params: {} },
  { id: 'HOME', uuid: uuid(), params: {} },
  { id: 'NOTIFICATIONS', uuid: uuid(), params: {} }
])

const hydrate = (state, settings) =>
  state.mergeDeep(settings).update('columns', (val = defaultColumns) => val)

const updateFrequentEmojis = (state, emoji) =>
  state
    .update('frequentlyUsedEmojis', ImmutableMap(), map =>
      map.update(emoji.id, 0, count => count + 1)
    )
    .set('saved', false)

const filterDeadListColumns = (state, listId) =>
  state.update('columns', columns =>
    columns.filterNot(
      column =>
        column.get('id') === 'LIST' && column.get('params').get('id') === listId
    )
  )

export default function settings(state = initialState, action) {
  switch (action.type) {
    case WINDOW_DIMENSION_CHANGE:
      return state.set(
        'window_dimensions',
        ImmutableMap({
          width: action.width,
          height: action.height
        })
      )
    case STORE_HYDRATE:
      return hydrate(state, action.state.get('settings'))
    case SETTING_CHANGE:
      return state.setIn(action.path, action.value).set('saved', false)
    case EMOJI_USE:
      return updateFrequentEmojis(state, action.emoji)
    case SETTING_SAVE:
      return state.set('saved', true)
    case LIST_FETCH_FAIL:
      return action.error.response.status === 404
        ? filterDeadListColumns(state, action.id)
        : state
    case LIST_DELETE_SUCCESS:
      return filterDeadListColumns(state, action.id)
    case DECK_SET_COLUMN_AT_INDEX:
      const sizeOfDeck = state.get('gabDeckOrder', ImmutableList()).size
      const newIndex = Math.min(
        Math.max(action.index || 0, sizeOfDeck),
        GAB_DECK_MAX_ITEMS
      )
      return state
        .setIn(['gabDeckOrder', newIndex + 1], action.column)
        .set('saved', false)
    case DECK_DELETE_COLUMN_AT_INDEX:
      return state.deleteIn(['gabDeckOrder', action.index]).set('saved', false)
    case DECK_CHANGE_COLUMN_AT_INDEX:
      return state
        .update('gabDeckOrder', idsList =>
          idsList.withMutations(list => {
            const soruce = list.get(action.oldIndex)
            const destination = list.get(action.newIndex)
            return list
              .set(action.newIndex, soruce)
              .set(action.oldIndex, destination)
          })
        )
        .set('saved', false)
    default:
      return state
  }
}
