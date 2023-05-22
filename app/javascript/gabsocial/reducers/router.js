import { ROUTER_CHANGE, ROUTER_RESET } from '../actions/router'
import { Map as ImmutableMap, List as ImmutableList } from 'immutable'
import get from 'lodash/get'

/**
 * Prevent growing memory for users who are navigating many pages in a single
 * SPA instance.
 */
const maxEntries = 11

const createInitialEntries = () => [{ pathname: window.location.pathname }]

const createInitialState = () => ImmutableMap({
  // window history items
  entries: createInitialEntries()
})

export default function routerReducer(state = createInitialState(), action) {
  // using lodash get to prevent undefined errors
  const type = get(action, 'type')
  const details = get(action, 'details')
  const isBack = get(action, 'details.popstate', false)
  const isForward = !isBack
  const entries = state.get('entries')
  const previousPath = get(entries, '0.pathname')
  const currentPath = get(action, 'details.pathname')

  if (type === ROUTER_CHANGE && isBack) {
    // remove first item on browser back
    // entries.shift()

    // must reset state for now until we can sync state better
    state = createInitialState()
  }
  
  /*
  Using home browser back might go too far if we are storing more than one
  the same route. By deduplicating we hope to prevent the bug. prev !== current
  */
  if (
    type === ROUTER_CHANGE &&
    typeof currentPath === 'string' &&
    previousPath !== currentPath
  ) {
    const entries = state.get('entries')

    // prepend path
    entries.unshift(details)

    if (entries.length > maxEntries) {
      // limit how many we're storing
      entries.length = maxEntries
    }

    state = state.set('entries', entries)

    if (isForward) {
      window.scrollTo(0, 0)
    }
  }

  if (type === ROUTER_RESET) {
    state = createInitialState()
  }

  return state
}
