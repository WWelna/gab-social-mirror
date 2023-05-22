import {
  fromJS,
  Map as ImmutableMap,
  List as ImmutableList,
} from 'immutable'
import {
  MARKETPLACE_LISTINGS_EXPAND_BY_SELLER_REQUEST,
  MARKETPLACE_LISTINGS_EXPAND_BY_SELLER_SUCCESS,
  MARKETPLACE_LISTINGS_EXPAND_BY_SELLER_FAIL,
  MARKETPLACE_FRONT_PAGE_LISTINGS_EXPAND_REQUEST,
  MARKETPLACE_FRONT_PAGE_LISTINGS_EXPAND_SUCCESS,
  MARKETPLACE_FRONT_PAGE_LISTINGS_EXPAND_FAIL,
} from '../actions/marketplace_listings'
import {
  MARKETPLACE_LISTINGS_FETCH_SAVES_REQUEST,
  MARKETPLACE_LISTINGS_FETCH_SAVES_SUCCESS,
  MARKETPLACE_LISTINGS_FETCH_SAVES_FAIL,
} from '../actions/marketplace_listing_saves'
import {
  MARKETPLACE_LISTINGS_EXPAND_DASHBOARD_REQUEST,
  MARKETPLACE_LISTINGS_EXPAND_DASHBOARD_SUCCESS,
  MARKETPLACE_LISTINGS_EXPAND_DASHBOARD_FAIL,
  MARKETPLACE_LISTINGS_DASHBOARD_CLEAR,
} from '../actions/marketplace_listing_dashboard'

// marketplace_lists, category, "example", {isFetched, isLoading, items}
// schema
// isFetched: false,
// isLoading: false,
// isError: false
// next: null,
// items: ImmutableList(),

// saved

const initialState = ImmutableMap({
  user: ImmutableMap(), // inner types
  dashboard: ImmutableMap({
    items: ImmutableList(),
    next: null,
    isLoading: false,
    isError: false,
    isFetched: false,
  }),
  frontpage: ImmutableMap({
    items: ImmutableList(),
    next: null,
    isLoading: false,
    isError: false,
    isFetched: false,
  }),
  saves: ImmutableMap({
    items: ImmutableList(),
    next: null,
    isLoading: false,
    isError: false,
    isFetched: false,
  })
})

const setListRequested = (state, type, id) => {
  const path = id ? [type, id] : [type]
  
  // if deeply nested (i.e. with id) doesn't exist, setIn instead
  const exists = !!state.getIn(path, null)

  if (exists) {
    return state.updateIn(path, (map) => {
      return map
        .set('isLoading', true)
        .set('isFetched', false)
        .set('isError', false)
    })
  } else {
    return state.setIn(path, ImmutableMap({
      items: ImmutableList(),
      next: null,
      isLoading: true,
      isError: false,
      isFetched: false,
    }))
  }
}

const setListFailed = (state, type, id) => {
  const path = id ? [type, id] : [type]
  return state.updateIn(path, (map) => {
    return map
      .set('next', null)
      .set('items', ImmutableList())
      .set('isLoading', false)
      .set('isError', true)
      .set('isFetched', true)
  })
}

const appendToList = (state, type, id, marketplaceListings, next) => {
  const path = id ? [type, id] : [type]
  return state.updateIn(path, (map) => {
    return map
      .set('next', next)
      .set('isLoading', false)
      .set('isError', false)
      .set('isFetched', true)
      .update('items', (list) => {
        // if doesn't have any more to add, just return same
        if (!Array.isArray(marketplaceListings)) return list

        // unique
        let n = list.concat(marketplaceListings.map(item => `${item.id}`))
        n = Array.from(new Set(n))
        return fromJS(n)
      })
  })
}

// : TODO :
// on error, null next
export default function marketplace_listings_lists(state = initialState, action) {
  switch(action.type) {  
  
  case MARKETPLACE_LISTINGS_FETCH_SAVES_REQUEST:
    return setListRequested(state, 'saves')
  case MARKETPLACE_LISTINGS_FETCH_SAVES_SUCCESS:
    return appendToList(state, 'saves', null, action.marketplaceListings, action.next);
  case MARKETPLACE_LISTINGS_FETCH_SAVES_FAIL:
    return setListFailed(state, 'saves')

  case MARKETPLACE_LISTINGS_EXPAND_BY_SELLER_REQUEST:
    return setListRequested(state, 'user', action.userId)
  case MARKETPLACE_LISTINGS_EXPAND_BY_SELLER_SUCCESS:
    return appendToList(state, 'user', action.userId, action.data, action.next);
  case MARKETPLACE_LISTINGS_EXPAND_BY_SELLER_FAIL:
    return setListFailed(state, 'user', action.userId)
    
  case MARKETPLACE_LISTINGS_EXPAND_DASHBOARD_REQUEST:
    return setListRequested(state, 'dashboard')
  case MARKETPLACE_LISTINGS_EXPAND_DASHBOARD_SUCCESS:
    return appendToList(state, 'dashboard', null, action.marketplaceListings, action.next);    
  case MARKETPLACE_LISTINGS_EXPAND_DASHBOARD_FAIL:
    return setListFailed(state, 'dashboard')

  case MARKETPLACE_FRONT_PAGE_LISTINGS_EXPAND_REQUEST:
    return setListRequested(state, 'frontpage')
  case MARKETPLACE_FRONT_PAGE_LISTINGS_EXPAND_SUCCESS:
    return appendToList(state, 'frontpage', null, action.data, action.next);    
  case MARKETPLACE_FRONT_PAGE_LISTINGS_EXPAND_FAIL:
    return setListFailed(state, 'frontpage')

  case MARKETPLACE_LISTINGS_DASHBOARD_CLEAR:
    return state.withMutations((mutable) => {
      mutable.setIn(['dashboard', 'next'], null)
      mutable.setIn(['dashboard', 'items'], ImmutableList())
    })

  default:
    return state
  }
}
