import {
  Map as ImmutableMap,
  List as ImmutableList,
  fromJS,
} from 'immutable'
import {
  LIST_CREATE_SUCCESS,
  LIST_UPDATE_SUCCESS,
  LISTS_FETCH_REQUEST,
  LISTS_FETCH_SUCCESS,
  LISTS_FETCH_FAIL,
  LIST_SORT,
} from '../actions/lists'
import {
  LIST_TYPE_FEATURED,
  LIST_TYPE_MEMBER_OF,
  LIST_TYPE_SUBSCRIBED_TO,
  LIST_TYPE_OWN,
} from '../constants'

const initialState = ImmutableMap({
  [LIST_TYPE_OWN]: ImmutableMap({
    isFetched: false,
    isLoading: false,
    items: ImmutableList(), //ids
  }),
  [LIST_TYPE_MEMBER_OF]: ImmutableMap({
    isFetched: false,
    isLoading: false,
    items: ImmutableList(),
  }),
  [LIST_TYPE_SUBSCRIBED_TO]: ImmutableMap({
    isFetched: false,
    isLoading: false,
    items: ImmutableList(),
  }),
  [LIST_TYPE_FEATURED]: ImmutableMap({
    isFetched: false,
    isLoading: false,
    items: ImmutableList(),
  }),
})

export default function lists_lists(state = initialState, action) {
  switch(action.type) {
  case LISTS_FETCH_REQUEST:
    return state.withMutations((mutable) => {
      mutable.setIn([action.tab, 'isLoading'], true)
    });
  case LISTS_FETCH_SUCCESS:
    return state.withMutations((mutable) => {
      let list = ImmutableList(action.data.map(item => item.id))
      if (action.tab === LIST_TYPE_FEATURED) list = list.sortBy(Math.random)
      mutable.setIn([action.tab, 'items'], list)
      mutable.setIn([action.tab, 'isLoading'], false)
      mutable.setIn([action.tab, 'isFetched'], true)
    })
  case LISTS_FETCH_FAIL:
    return state.withMutations((mutable) => {
      mutable.setIn([action.tab, 'items'], ImmutableList())
      mutable.setIn([action.tab, 'isLoading'], false)
      mutable.setIn([action.tab, 'isFetched'], true)
    })

  case LIST_CREATE_SUCCESS:
  case LIST_UPDATE_SUCCESS:
    // append/update unique to own
    const myExistingIds = state.getIn(['own', 'items'], ImmutableList()).toJS()
    myExistingIds.push(action.list.id)
    const newListIds = Array.from(new Set(myExistingIds))
    // re-set
    state = state.setIn(['own', 'items'], fromJS(newListIds))
  case LIST_SORT:
    return state.withMutations((mutable) => {
      mutable.setIn([action.tab, 'items'], ImmutableList(action.listIds))
    })
  default:
    return state
  }
}

