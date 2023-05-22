import {
  Map as ImmutableMap,
  List as ImmutableList,
  fromJS,
} from 'immutable'
import {
  MARKETPLACE_LISTING_STATUS_CHANGES_FETCH_REQUEST,
  MARKETPLACE_LISTING_STATUS_CHANGES_FETCH_SUCCESS,
  MARKETPLACE_LISTING_STATUS_CHANGES_FETCH_FAIL,
  MARKETPLACE_LISTING_STATUS_CHANGES_EXPAND_REQUEST,
  MARKETPLACE_LISTING_STATUS_CHANGES_EXPAND_SUCCESS,
  MARKETPLACE_LISTING_STATUS_CHANGES_EXPAND_FAIL,
} from '../actions/marketplace_listings'

const initialState = ImmutableMap()

// next: null,
// isLoading: false,
// items: ImmutableList(),

const setListFailed = (state, id) => {
  return state.setIn([id], ImmutableMap({
    next: null,
    items: ImmutableList(),
    isLoading: false,
  }))
}

const normalizeList = (state, id, statusChanges, next) => {
  return state.setIn([id], ImmutableMap({
    next,
    items: ImmutableList(statusChanges.map(item => fromJS(item))),
    isLoading: false,
  }))
}

const appendToList = (state, id, statusChanges, next) => {
  return state.updateIn([id], (map) => {
    return map
      .set('next', next)
      .set('isLoading', false)
      .update('items', (list) => {
        return list.concat(statusChanges.map(item => fromJS(item)))
      })
  })
}

export default function marketplace_listing_status_changes(state = initialState, action) {
  switch(action.type) {
  case MARKETPLACE_LISTING_STATUS_CHANGES_FETCH_SUCCESS:
    return normalizeList(state, action.marketplaceListingId, action.statusChanges, action.next);
  case MARKETPLACE_LISTING_STATUS_CHANGES_EXPAND_SUCCESS:
    return appendToList(state, action.marketplaceListingId, action.statusChanges, action.next);
  case MARKETPLACE_LISTING_STATUS_CHANGES_FETCH_REQUEST:
  case MARKETPLACE_LISTING_STATUS_CHANGES_EXPAND_REQUEST:
    return state.setIn([action.marketplaceListingId, 'isLoading'], true);
  case MARKETPLACE_LISTING_STATUS_CHANGES_FETCH_FAIL:
  case MARKETPLACE_LISTING_STATUS_CHANGES_EXPAND_FAIL:
    return setListFailed(state, action.marketplaceListingId)
  
  default:
    return state
  }
}
