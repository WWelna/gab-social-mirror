import {
  LIST_FETCH_SUCCESS,
  LIST_FETCH_FAIL,
  LISTS_FETCH_REQUEST,
  LISTS_FETCH_SUCCESS,
  LISTS_FETCH_FAIL,
  LIST_CREATE_SUCCESS,
  LIST_UPDATE_SUCCESS,
  LIST_DELETE_SUCCESS,
  LIST_SORT,
  LIST_ACCOUNTS_MEMBER_LEAVE_SUCCESS,
} from '../actions/lists'
import {
  List as ImmutableList,
  Map as ImmutableMap,
  fromJS,
} from 'immutable'

const initialState = ImmutableMap({
  isLoading: false,
  isFetched: false,
  isError: false,
  lists: ImmutableMap({ // ids
    own: ImmutableList(),
    member_of: ImmutableList(),
    subscribed_to: ImmutableList(),
  }),
  items: ImmutableMap(), // id:{}
})

const normalizeLists = (state, data) => {
  const { own, member_of, subscribed_to } = data

  state = state.set('isFetched', true)

  state = state.update('lists', listMap => listMap.withMutations((map) => {
    map.set('own', ImmutableList(own.map(item => item.id)))
    map.set('member_of', ImmutableList(member_of.map(item => item.id)))
    map.set('subscribed_to', ImmutableList(subscribed_to.map(item => item.id)))
  }))

  own.forEach((list) => {
    state = state.setIn(['items', list.id], fromJS(list));
  })
  member_of.forEach((list) => {
    state = state.setIn(['items', list.id], fromJS(list))
  })
  subscribed_to.forEach((list) => {
    state = state.setIn(['items', list.id], fromJS(list))
  })
  
  return state
}

const setListToFalse = (state, id) => {
  const filterer = (list) => list.filterNot((itemId) => itemId === id)
  state = state.updateIn(['lists', 'own'], filterer)
  state = state.updateIn(['lists', 'member_of'], filterer)
  state = state.updateIn(['lists', 'subscribed_to'], filterer)
  state = state.deleteIn(['items', id])
  return state
}

export default function lists(state = initialState, action) {
  switch(action.type) {
  case LIST_FETCH_SUCCESS:
    return state.setIn(['items', action.list.id], fromJS(action.list))
  case LIST_CREATE_SUCCESS:
  case LIST_UPDATE_SUCCESS:
    // append/update unique to own
    const myExistingIds = state.getIn(['lists', 'own'], ImmutableList()).toJS()
    myExistingIds.push(action.list.id)
    const newListIds = Array.from(new Set(myExistingIds))
    // re-set
    state = state.setIn(['lists', 'own'], fromJS(newListIds))

    // 
    return state.setIn(['items', action.list.id], fromJS(action.list))
  case LISTS_FETCH_REQUEST:
    return state.set('isLoading', true)
  case LISTS_FETCH_SUCCESS:
    state = state.set('isLoading', false)
    return normalizeLists(state, action.data)
  case LISTS_FETCH_FAIL:
    return state.set('isLoading', false)
  case LIST_DELETE_SUCCESS:
  case LIST_FETCH_FAIL:
    return setListToFalse(state, action.id)
  case LIST_SORT:
    return state.withMutations((mutable) => {
      mutable.setIn(['lists', action.tab], ImmutableList(action.listIds))
    })
  case LIST_ACCOUNTS_MEMBER_LEAVE_SUCCESS:
    // reduce member_count
    return state.updateIn(['items', action.id], initialMap, (map) => {
      const curCount = map.get('memberCount')
      map.set('memberCount', Math.max(curCount - 1, 0))
    })
  default:
    return state;
  }
}
