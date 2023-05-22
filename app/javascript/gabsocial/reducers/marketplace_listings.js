import { Map as ImmutableMap, fromJS } from 'immutable'
import {
  MARKETPLACE_LISTING_SET_STATUS_SUCCESS,
  MARKETPLACE_LISTING_FETCH_SUCCESS,
} from '../actions/marketplace_listings'
import {
  MARKETPLACE_LISTING_UPDATE_SUCCESS,
} from '../actions/marketplace_listing_editor'
import {
  MARKETPLACE_LISTING_SAVE_SUCCESS,
  MARKETPLACE_LISTING_UNSAVE_SUCCESS,
  MARKETPLACE_LISTING_CHECK_SAVED_SUCCESS
} from '../actions/marketplace_listing_saves'
import {
  MARKETPLACE_LISTINGS_IMPORT,
} from '../actions/importer'

const importMarketplaceListing = (state, marketplaceListing) => state.set(`${marketplaceListing.id}`, fromJS(marketplaceListing))

const importMarketplaceListings = (state, marketplaceListings) =>
  state.withMutations((mutable) => marketplaceListings.forEach((marketplaceListing) => importMarketplaceListing(mutable, marketplaceListing)))

// const deleteMarketplaceListing = (state, id) => {
//   return state.delete(id)
// }

const initialState = ImmutableMap()

export default function marketplace_listings(state = initialState, action) {
  switch(action.type) {
  case MARKETPLACE_LISTINGS_IMPORT:
    return importMarketplaceListings(state, action.marketplaceListings)
  case MARKETPLACE_LISTING_SET_STATUS_SUCCESS:
  case MARKETPLACE_LISTING_UPDATE_SUCCESS:
  case MARKETPLACE_LISTING_FETCH_SUCCESS:
    return importMarketplaceListing(state, action.data)
  case MARKETPLACE_LISTING_SAVE_SUCCESS:
  case MARKETPLACE_LISTING_UNSAVE_SUCCESS:
  case MARKETPLACE_LISTING_CHECK_SAVED_SUCCESS:
    return state.setIn([`${action.marketplaceListingId}`, 'saved'], action.saved)
  default:
    return state
  }
}
