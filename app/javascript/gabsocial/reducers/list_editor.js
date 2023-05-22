import { Map as ImmutableMap, List as ImmutableList } from 'immutable'
import {
  LIST_CREATE_REQUEST,
  LIST_CREATE_FAIL,
  LIST_CREATE_SUCCESS,
  LIST_UPDATE_REQUEST,
  LIST_UPDATE_FAIL,
  LIST_UPDATE_SUCCESS,
} from '../actions/lists'
import {
  LIST_EDITOR_RESET,
  LIST_EDITOR_SETUP,
  LIST_EDITOR_TITLE_CHANGE,
  LIST_EDITOR_SLUG_CHANGE,
  LIST_EDITOR_VISIBILITY_CHANGE,
  LIST_EDITOR_SUGGESTIONS_READY,
  LIST_EDITOR_SUGGESTIONS_CLEAR,
  LIST_EDITOR_SUGGESTIONS_CHANGE,
} from '../actions/list_editor'

const initialState = ImmutableMap({
  listId: null,
  isSubmitting: false,
  isChanged: false,
  title: '',
  slug: '',
  visibility: null,
  suggestions: ImmutableMap({
    value: '',
    items: ImmutableList(),
  }),
})

const updateSingleChange = (state, key, value) => {
  return state.withMutations(map => {
    map.set(key, value)
    map.set('isChanged', true)
  })
}

export default function list_editor(state = initialState, action) {
  switch(action.type) {
  case LIST_EDITOR_RESET:
    return initialState
  case LIST_EDITOR_SETUP:
    return state.withMutations(map => {
      map.set('listId', action.list.get('id'))
      map.set('title', action.list.get('title'))
      map.set('slug', action.list.get('slug'))
      map.set('visibility', action.list.get('visibility'))
      map.set('isSubmitting', false)
    })
  case LIST_EDITOR_TITLE_CHANGE:
    return updateSingleChange(state, 'title', action.value)
  case LIST_EDITOR_SLUG_CHANGE:
    return updateSingleChange(state, 'slug', action.value)
  case LIST_EDITOR_VISIBILITY_CHANGE:
    return updateSingleChange(state, 'visibility', action.value)

  case LIST_CREATE_REQUEST:
  case LIST_UPDATE_REQUEST:
    return state.withMutations(map => {
      map.set('isSubmitting', true)
      map.set('isChanged', false)
    })
  case LIST_CREATE_FAIL:
  case LIST_UPDATE_FAIL:
    return state.set('isSubmitting', false)
  case LIST_CREATE_SUCCESS:
  case LIST_UPDATE_SUCCESS:
    return state.withMutations(map => {
      map.set('isSubmitting', false)
      map.set('listId', action.list.id)
    })

  case LIST_EDITOR_SUGGESTIONS_CHANGE:
    return state.setIn(['suggestions', 'value'], action.value)
  case LIST_EDITOR_SUGGESTIONS_READY:
    return state.setIn(['suggestions', 'items'], ImmutableList(action.accounts.map(item => item.id)))
  case LIST_EDITOR_SUGGESTIONS_CLEAR:
    return state.update('suggestions', suggestions => suggestions.withMutations(map => {
      map.set('items', ImmutableList())
      map.set('value', '')
    }))

  default:
    return state
  }
}
