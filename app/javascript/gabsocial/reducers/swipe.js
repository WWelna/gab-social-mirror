import { Map as ImmutableMap } from 'immutable'
import { SWIPE_TOGGLE_PAUSED } from '../actions/swipe'

const initialState = ImmutableMap({ paused: false })

export default function swipeReducer(state = initialState, action) {
  if (action.type === SWIPE_TOGGLE_PAUSED) {
    // the user provides paused value or we toggle the existing value
    const paused = action.paused || (!state.get('paused'))
    return state.set('paused', paused)
  }
  return state
}
