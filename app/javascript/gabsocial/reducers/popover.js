import Immutable from 'immutable'
import {
  POPOVER_OPEN,
  POPOVER_CLOSE,
} from '../actions/popover'

import { POPOVER_SHARE } from '../constants'

// these can't be toggled
const nonTogglePopovers = [
  POPOVER_SHARE
]

import get from 'lodash/get'

const initialState = Immutable.Map({
  popoverType: null,
  popoverProps: null,
})

export default function popoverMenu(state = initialState, action) {
  switch (action.type) {
  case POPOVER_OPEN:
    if (
      typeof state.get('popoverType') === 'string' && // existing popover
      get(action, 'popoverProps.timeout') === undefined &&
      nonTogglePopovers.includes(action.popoverType) === false
    ) {
      // This is really like a menu toggle but I didn't want to rename
      // it in the components yet. -TC
      return initialState
    }
    return state.withMutations(map => {
      map.set('popoverType', action.popoverType)
      map.set('popoverProps', action.popoverProps)
    })
  case POPOVER_CLOSE:
    return initialState
  default:
    return state
  }
}
