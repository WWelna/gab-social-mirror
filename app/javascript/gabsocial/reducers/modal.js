import Immutable from 'immutable'
import {
  MODAL_OPEN,
  MODAL_CLOSE,
} from '../actions/modal'

const initialState = Immutable.Map({
  modalType: null,
  modalProps: null,
})

export default function modal(state = initialState, action) {
  switch(action.type) {
  case MODAL_OPEN:
    document.body.style['touch-action'] = 'none'
    document.body.style.overflow = 'hidden'
    return state.withMutations(map => {
      map.set('modalType', action.modalType)
      map.set('modalProps', action.modalProps)
    })
  case MODAL_CLOSE:
    document.body.style.overflow = 'auto'
    document.body.style['touch-action'] = null
    return initialState
  default:
    return state
  }
}
