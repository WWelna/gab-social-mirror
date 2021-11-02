import {
  TOAST_SHOW,
  TOAST_DISMISS,
  TOAST_CLEAR,
} from '../actions/toasts'
import isObject from 'lodash.isobject'
import get from 'lodash.get'
import { Map as ImmutableMap, List as ImmutableList } from 'immutable'

const getMessageFromError = (data) => {
  if (!isObject(data)) return null
  const response = get(data, 'error.response.data')
  if (!!response && !isObject(response)) return `${response}`
  else if (isObject(response)) {
    return response.error || null
  }
  return null
}

const makeMessageFromData = (data) => {
  const error = getMessageFromError(data)
  if (!!error) return error
  return `${data.type}`.split('_').join(' ').toLowerCase()
}

const initialState = ImmutableList([])

export default function toasts(state = initialState, action) {
  switch(action.type) {
  case TOAST_SHOW:
    return state.set(state.size, ImmutableMap({
      key: state.size > 0 ? state.last().get('key') + 1 : 0,
      message: makeMessageFromData(action.toastData),
      type: action.toastType,
    }))
  case TOAST_DISMISS:
    return state.filterNot(item => item.get('key') === action.toastKey)
  case TOAST_CLEAR:
    return state.clear()
  default:
    return state
  }
}
