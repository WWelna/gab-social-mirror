import {
  QUOTES_FETCH_REQUEST,
  QUOTES_FETCH_SUCCESS,
  QUOTES_FETCH_FAIL,
  QUOTES_EXPAND_REQUEST,
  QUOTES_EXPAND_SUCCESS,
  QUOTES_EXPAND_FAIL,
} from '../actions/interactions';

import { Map as ImmutableMap, List as ImmutableList } from 'immutable';

const initialState = ImmutableMap({
  bookmarks: ImmutableMap(),
  quotes_for: ImmutableMap(),
});

const normalizeList2 = (state, type, id, statuses, next) => {
  return state.setIn([type, id], ImmutableMap({
    next,
    items: ImmutableList(statuses.map(item => item.id)),
    isLoading: false,
  }))
}

const appendToList2 = (state, type, id, statuses, next) => {
  return state.updateIn([type, id], (map) => {
    return map
      .set('next', next)
      .set('isLoading', false)
      .update('items', (list) => {
        return list.concat(statuses.map(item => item.id))
      })
  })
}

export default function statusLists(state = initialState, action) {
  switch (action.type) {
  case QUOTES_FETCH_REQUEST:
  case QUOTES_EXPAND_REQUEST:
    return state.setIn(['quotes_for', action.statusId, 'isLoading'], true)
  case QUOTES_FETCH_SUCCESS:
    return normalizeList2(state, 'quotes_for', action.statusId, action.items, action.next);
  case QUOTES_EXPAND_SUCCESS:
    return appendToList2(state, 'quotes_for', action.statusId, action.items, action.next);
  case QUOTES_FETCH_FAIL:
  case QUOTES_EXPAND_FAIL:
    return state.withMutations(map => {
      map.setIn(['quotes_for', action.statusId, 'items'], ImmutableList());
      map.setIn(['quotes_for', action.statusId, 'next'], null)
    })
  default:
    return state;
  }
};
