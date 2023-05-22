import {
  Map as ImmutableMap,
  List as ImmutableList,
  fromJS,
} from 'immutable'
import {
  STATUS_CONTEXTS_HYDRATE_GLOBAL,
  STATUS_CONTEXTS_GLOBAL_FETCH_SUCCESS,
  STATUS_CONTEXTS_GROUP_FETCH_SUCCESS,
  STATUS_CONTEXTS_GROUP_CREATE_SUCCESS,
  STATUS_CONTEXTS_GROUP_REMOVE_REQUEST,
} from '../actions/status_contexts'

const initialState = ImmutableMap({
  ids: ImmutableList(),
  objects: ImmutableMap(),
})

const unique = (i) => i.toOrderedSet().toList()

const appendToList = (state, statusContexts) => {
  const statusContextIds = statusContexts.map((s) => s.id)

  return state.withMutations((map) => {
    const ids = map.get('ids')
    map.set('ids', unique(ids.concat(statusContextIds)))
    statusContexts.forEach((s) => map.setIn(['objects', s.id], fromJS(s)))
  })
}

const removeFromList = (state, statusContextId) => {
  return state.withMutations((map) => {
    map.set('ids', map.get('ids').filter((id) => id !== statusContextId))
    map.deleteIn(['entities', statusContextId])
  })
}

export default function status_contexts(state = initialState, action) {
  switch (action.type) {
  case STATUS_CONTEXTS_HYDRATE_GLOBAL:
  case STATUS_CONTEXTS_GLOBAL_FETCH_SUCCESS:
  case STATUS_CONTEXTS_GROUP_FETCH_SUCCESS:
    return appendToList(state, action.statusContexts)
  case STATUS_CONTEXTS_GROUP_CREATE_SUCCESS:
    return appendToList(state, [action.statusContext])
  case STATUS_CONTEXTS_GROUP_REMOVE_REQUEST:
    return removeFromList(state, action.statusContextId)
  default:
    return state
  }
}