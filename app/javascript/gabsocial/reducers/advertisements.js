import {
  ADVERTISEMENT_PAGE_POSITION,
  ADVERTISEMENT_REMOVE_PAGE_POSITION,
} from '../actions/advertisements'
import { Map as ImmutableMap, fromJS } from 'immutable'

// advertisements: ads: {view_count}
const initialState = ImmutableMap({
  /**
   * Prevents randomizing ads on a page each render.
   */
  pagePositionAdsCache: ImmutableMap(),
})

export default function advertisements(state = initialState, action) {
  switch(action.type) {
  case ADVERTISEMENT_PAGE_POSITION:
    const { pageKey, position, ad } = action
    return state.setIn(['pagePositionAdsCache', `${pageKey}-${position}`], fromJS(ad))
  case ADVERTISEMENT_REMOVE_PAGE_POSITION:
    return state.deleteIn(['pagePositionAdsCache', action.pagePositionKey])
  default:
    return state;
  }
}
