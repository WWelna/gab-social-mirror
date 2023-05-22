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
  // this is based on the redux message type
  const typeMessage = `${data.type}`.split('_').join(' ').toLowerCase()

  if (data.error) {
    const status = get(data, 'error.response.status')
    const statusText = get(data, 'error.response.statusText')
    const contentType = get(data, 'error.response.headers.content-type')
    if (
      typeof status === 'number' &&
      status >= 400 &&
      typeof statusText === 'string' &&
      statusText.length > 0 &&
      contentType === 'text/html'
    ) {
      // It is an HTML error message which we cannot display.
      return `${typeMessage}: ${status} ${statusText}`;
    }
  }

  // fallback to json error message
  const error = getMessageFromError(data)
  if (!!error) return error

  // unknown message, use redux message type
  return typeMessage
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
