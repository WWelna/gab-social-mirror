import {
  MARKETPLACE_LISTINGS_FETCH_BY_SEARCH_REQUEST,
  MARKETPLACE_LISTINGS_FETCH_BY_SEARCH_SUCCESS,
  MARKETPLACE_LISTINGS_FETCH_BY_SEARCH_FAIL,
  MARKETPLACE_LISTINGS_EXPAND_BY_SEARCH_REQUEST,
  MARKETPLACE_LISTINGS_EXPAND_BY_SEARCH_SUCCESS,
  MARKETPLACE_LISTINGS_EXPAND_BY_SEARCH_FAIL,
  MARKETPLACE_LISTING_SEARCH_QUERY_CHANGE,
  MARKETPLACE_LISTING_SEARCH_QUERY_CLEAR,
  MARKETPLACE_LISTING_SEARCH_TAGS_CHANGE,
  MARKETPLACE_LISTING_SEARCH_LOCATION_CHANGE,
  MARKETPLACE_LISTING_SEARCH_PRICE_MIN_CHANGE,
  MARKETPLACE_LISTING_SEARCH_PRICE_MAX_CHANGE,
  MARKETPLACE_LISTING_SEARCH_SORT_BY_CHANGE,
  MARKETPLACE_LISTING_SEARCH_CONDITION_CHANGE,
  MARKETPLACE_LISTING_SEARCH_CATEGORY_ID_CHANGE,
  MARKETPLACE_LISTING_SEARCH_SHIPPING_REQUIRED_CHANGE,
  MARKETPLACE_LISTING_SEARCH_HAS_IMAGES_CHANGE,
  MARKETPLACE_LISTING_SEARCH_RESET,
  MARKETPLACE_LISTING_VIEW_CHANGE,
} from '../actions/marketplace_listing_search'
import {
  Map as ImmutableMap,
  List as ImmutableList,
  fromJS,
} from 'immutable'
import { 
  MARKETPLACE_LISTING_VIEW_TAB_TYPE_CARD,
} from '../constants'

const initialState = ImmutableMap({
  items: ImmutableList(),
  next: null,
  isLoading: false,
  isError: false,
  view_tab: MARKETPLACE_LISTING_VIEW_TAB_TYPE_CARD,
  filters: ImmutableMap({
    tags: null,
    query: null,
    location: null,
    price_min: null,
    price_max: null,
    sort_by: null,
    condition: null,
    category_id: null,
    shipping_required: null,
    has_images: null,
  })
})

const appendToList = (state, marketplaceListings, next) => {
  return state.update((map) => {
    return map
      .set('next', next)
      .set('isLoading', false)
      .update('items', (list) => {
        // unique
        let n = list.concat(marketplaceListings.map(item => item.id))
        n = Array.from(new Set(n))
        return fromJS(n)
      })
  })
}

export default function marketplace_listing_search(state = initialState, action) {
  switch(action.type) {
    case MARKETPLACE_LISTINGS_FETCH_BY_SEARCH_REQUEST:
      return state.withMutations((map) => {
        map.set('isLoading', true)
        map.set('isError', false)
      })
    case MARKETPLACE_LISTINGS_FETCH_BY_SEARCH_SUCCESS:
      return state
        .set('items', ImmutableList(action.data.map(item => item.id)))
        .set('next', action.next)
        .set('isLoading', false)
        .set('isError', false)
    case MARKETPLACE_LISTINGS_EXPAND_BY_SEARCH_REQUEST:
      return state.withMutations((map) => {
        map.set('isLoading', true)
        map.set('isError', false)
      })
    case MARKETPLACE_LISTINGS_EXPAND_BY_SEARCH_SUCCESS:
      return appendToList(state, action.data, action.next)
    
    case MARKETPLACE_LISTINGS_FETCH_BY_SEARCH_FAIL:
    case MARKETPLACE_LISTINGS_EXPAND_BY_SEARCH_FAIL:
      return state
        .set('items', ImmutableList())
        .set('next', null)
        .set('isLoading', false)
        .set('isError', false)

    case MARKETPLACE_LISTING_SEARCH_QUERY_CHANGE:
      return state.setIn(['filters', 'query'], action.value)
    case MARKETPLACE_LISTING_SEARCH_QUERY_CLEAR:
      return state.setIn(['filters', 'query'], '')
    case MARKETPLACE_LISTING_SEARCH_TAGS_CHANGE:
      return state.setIn(['filters', 'tags'], action.value)
    case MARKETPLACE_LISTING_SEARCH_LOCATION_CHANGE:
      return state.setIn(['filters', 'location'], action.value)
    case MARKETPLACE_LISTING_SEARCH_PRICE_MIN_CHANGE:
      return state.setIn(['filters', 'price_min'], action.value)
    case MARKETPLACE_LISTING_SEARCH_PRICE_MAX_CHANGE:
      return state.setIn(['filters', 'price_max'], action.value)
    case MARKETPLACE_LISTING_SEARCH_CONDITION_CHANGE:
      return state.setIn(['filters', 'condition'], action.value)
    case MARKETPLACE_LISTING_SEARCH_SORT_BY_CHANGE:
      return state.setIn(['filters', 'sort_by'], action.value)
    case MARKETPLACE_LISTING_SEARCH_CATEGORY_ID_CHANGE:
      return state.setIn(['filters', 'category_id'], action.value)
    case MARKETPLACE_LISTING_SEARCH_SHIPPING_REQUIRED_CHANGE:
      return state.setIn(['filters', 'shipping_required'], action.value)
    case MARKETPLACE_LISTING_SEARCH_HAS_IMAGES_CHANGE:
      return state.setIn(['filters', 'has_images'], action.value)
    case MARKETPLACE_LISTING_VIEW_CHANGE:
      return state.set('view_tab', action.tab)
    case MARKETPLACE_LISTING_SEARCH_RESET:
      return state.withMutations(map => {
        map.setIn(['filters', 'tags'], null)
        map.setIn(['filters', 'query'], null)
        map.setIn(['filters', 'location'], null)
        map.setIn(['filters', 'price_min'], null)
        map.setIn(['filters', 'price_max'], null)
        map.setIn(['filters', 'sort_by'], null)
        map.setIn(['filters', 'category_id'], null)
        map.setIn(['filters', 'shipping_required'], null)
        map.setIn(['filters', 'has_images'], null)
      })

  default:
    return state
  }
}
