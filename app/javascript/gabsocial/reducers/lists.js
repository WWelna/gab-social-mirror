import {
  LIST_FETCH_SUCCESS,
  LIST_CREATE_SUCCESS,
  LIST_UPDATE_SUCCESS,
  LISTS_FETCH_SUCCESS,
  LISTS_FETCH_REQUEST,
  LIST_ACCOUNTS_MEMBER_LEAVE_SUCCESS,
  LIST_EDITOR_ADD_SUCCESS,
  LIST_EDITOR_REMOVE_SUCCESS,
  LIST_SUBSCRIBE_SUCCESS,
  LIST_UNSUBSCRIBE_SUCCESS,
} from '../actions/lists'
import {
  LISTS_IMPORT,
} from '../actions/importer'
import {
  List as ImmutableList,
  Map as ImmutableMap,
  fromJS,
} from 'immutable'

const initialState = ImmutableMap({
  items: ImmutableMap(), // id:{}
})

const normalizeLists = (state, data) => {
  if (!Array.isArray(data)) return state

  data.forEach((list) => {
    state = state.setIn(['items', list.id], fromJS(list));
  })
  
  return state
}

export default function lists(state = initialState, action) {
  switch(action.type) {
  case LIST_FETCH_SUCCESS:
    return state.setIn(['items', action.list.id], fromJS(action.list))
  case LIST_CREATE_SUCCESS:
  case LIST_UPDATE_SUCCESS:
    return state.setIn(['items', action.list.id], fromJS(action.list))
  case LISTS_FETCH_REQUEST:
    return state.set('isLoading', true)
  case LISTS_IMPORT:
    return normalizeLists(state, action.lists)
  case LISTS_FETCH_SUCCESS:
    return normalizeLists(state, action.data)
  case LIST_ACCOUNTS_MEMBER_LEAVE_SUCCESS:
    // reduce member_count
    return state.updateIn(['items', action.id], initialMap, (map) => {
      const curCount = map.get('memberCount')
      map.set('memberCount', Math.max(curCount - 1, 0))
    })
  case LIST_SUBSCRIBE_SUCCESS:
  case LIST_UNSUBSCRIBE_SUCCESS:
    return state.setIn(['items', action.id, 'subscriber_count'], action.subscriberCount)
  case LIST_EDITOR_ADD_SUCCESS:
  case LIST_EDITOR_REMOVE_SUCCESS:
    return state.setIn(['items', action.listId, 'member_count'], action.memberCount)
  default:
    return state;
  }
}
