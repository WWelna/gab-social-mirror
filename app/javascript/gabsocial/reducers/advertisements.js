import {
  ADVERTISEMENT_DATA_BATCH_VIEWS,
  ADVERTISEMENT_DATA_SAVE_VIEWS_SUCCESS,
} from '../actions/advertisements'
import { Map as ImmutableMap } from 'immutable'

// advertisements: ads: {view_count}
const initialState = ImmutableMap({})

export default function advertisements(state = initialState, action) {
  switch(action.type) {
  case ADVERTISEMENT_DATA_BATCH_VIEWS:
    // increment
    const existingViewCount = state.getIn([action.adId, 'view_count'], 0)
    return state.update(action.adId, ImmutableMap(), map => map.set('view_count', existingViewCount + 1));
  case ADVERTISEMENT_DATA_SAVE_VIEWS_SUCCESS:
    // reset
    return state.set(action.adId, ImmutableMap())
  default:
    return state;
  }
}