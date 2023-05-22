import {
  MARKETPLACE_LISTING_CATEGORIES_FETCH_REQUEST,
  MARKETPLACE_LISTING_CATEGORIES_FETCH_SUCCESS,
  MARKETPLACE_LISTING_CATEGORIES_FETCH_FAIL,
} from '../actions/marketplace_listing_categories'
import {
  Map as ImmutableMap,
  List as ImmutableList,
  fromJS,
} from 'immutable'

const initialState = ImmutableMap({
  items: ImmutableList(),
  isFetched: false,
  isLoading: false,
  isError: false,
})


export default function marketplaceCategoriesReducer(state = initialState, action) {
  switch(action.type) {
  case MARKETPLACE_LISTING_CATEGORIES_FETCH_REQUEST:
    return state.withMutations((map) => {
      map.set('isLoading', true)
      map.set('isError', false)
    })
  case MARKETPLACE_LISTING_CATEGORIES_FETCH_SUCCESS:
    return state.withMutations((map) => {
      map.set('items', fromJS(action.data))
      map.set('isLoading', false)
      map.set('isFetched', true)
      map.set('isError', false)
    })
  case MARKETPLACE_LISTING_CATEGORIES_FETCH_FAIL:
    return state.withMutations((map) => {
      map.set('isLoading', false)
      map.set('isError', true)
    })
  default:
    return state
  }
}
