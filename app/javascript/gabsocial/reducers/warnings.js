import {
  WARNINGS_EXPAND_REQUEST,
  WARNINGS_EXPAND_SUCCESS,
  WARNINGS_EXPAND_FAIL,
  WARNINGS_UNREAD_COUNT_FETCH_SUCCESS,
  WARNING_CLEAR_REQUEST,
} from '../actions/warnings'
import { Map as ImmutableMap, List as ImmutableList } from 'immutable'

const initialState = ImmutableMap({
  items: ImmutableList(),
  next: null,
  isLoading: false,
  isError: false,
});

const warningToMap = (warning) => ImmutableMap({
  id: warning.id,
  action: warning.action,
  text: warning.text,
  created_at: warning.created_at,
  user_dismissed_at: warning.user_dismissed_at,
  statuses: Array.isArray(warning.statuses) ? warning.statuses.map((s) => s.id) : null,
});

const appendToList = (state, warnings, next) => {
  return state.update(listMap => listMap.withMutations(map => {
    const items = Array.isArray(warnings) ? warnings.map(warning => warningToMap(warning)) : []

    map.set('next', next)
    map.set('isLoading', false)
    map.set('items', map.get('items').concat(items))
  }))
}

const removeOneFromList = (state, warningId) => {
  return state.update(listMap => listMap.withMutations(map => {
    map.set('items', map.get('items').filter(warning => warning.get('id') !== warningId))
  }))
}

export default function notifications(state = initialState, action) {
  switch(action.type) {
  case WARNINGS_UNREAD_COUNT_FETCH_SUCCESS:
    return state.set('unreadCount', action.count);
  case WARNINGS_EXPAND_REQUEST:
    return state.set('isLoading', true);
  case WARNINGS_EXPAND_SUCCESS:
    return appendToList(state, action.warnings, action.next)
  case WARNINGS_EXPAND_FAIL:
    return state.withMutations(map => {
      map.update('isLoading', false)
      map.update('isError', false)
    });
  case WARNING_CLEAR_REQUEST:
    return removeOneFromList(state, action.warningId)
  default:
    return state;
  }
};
