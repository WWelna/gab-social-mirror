import {
  ADVERTISEMENT_DATA_BATCH_VIEWS,
  ADVERTISEMENT_DATA_SAVE_VIEWS_SUCCESS,
  ADVERTISEMENT_PAGE_POSITION
} from '../actions/advertisements'
import { ROUTER_CHANGE } from "../actions/router";
import { Map as ImmutableMap, fromJS } from 'immutable'

// advertisements: ads: {view_count}
const initialState = ImmutableMap({
  /**
   * Prevents randomizing ads on a page each render.
   */
  pagePositionAdsCache: ImmutableMap()
})

export default function advertisements(state = initialState, action) {
  switch(action.type) {
  case ADVERTISEMENT_DATA_BATCH_VIEWS:
    // increment
    const existingViewCount = state.getIn([action.adId, 'view_count'], 0)
    return state.update(action.adId, ImmutableMap(), map => map.set('view_count', existingViewCount + 1));
  case ADVERTISEMENT_DATA_SAVE_VIEWS_SUCCESS:
    // reset
    return state.set(action.adId, ImmutableMap())
  case ADVERTISEMENT_PAGE_POSITION:
    const { pageKey, position, ad } = action
    return state.setIn(['pagePositionAdsCache', `${pageKey}-${position}`], fromJS(ad))
  case ROUTER_CHANGE:
    // reset each navigation change
    return state.set('pagePositionAdsCache', ImmutableMap())
  default:
    return state;
  }
}
