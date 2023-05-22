import {
  REPOST_REQUEST,
  UNREPOST_REQUEST,
  REPOST_FAIL,
  FAVORITE_REQUEST,
  FAVORITE_FAIL,
  UNFAVORITE_REQUEST,
  UNBOOKMARK_REQUEST,
  UNMENTION_REQUEST,
} from '../actions/interactions';
import {
  STATUS_REVEAL,
  STATUS_HIDE,
  UPDATE_STATUS_STATS,
  STATUS_MUTE_SUCCESS,
  STATUS_UNMUTE_SUCCESS,
  STATUS_SHOW_ANYWAYS,
  STATUS_SHOW_ACCOUNT_ANYWAYS,
  STATUS_REACTIONS_FETCH_SUCCESS,
  STATUS_REACTIONS_FETCH_FAIL,
  CONVERSATION_OWNER_FETCH_SUCCESS,
  CONVERSATION_OWNER_FETCH_FAIL,
  REMOVE_REPLY_SUCCESS,
  REMOVE_REPLY_FAIL,
} from '../actions/statuses';
import {
  ACCOUNT_BLOCK_REQUEST,
  ACCOUNT_MUTE_REQUEST,
  ACCOUNT_UNBLOCK_REQUEST,
  ACCOUNT_UNMUTE_REQUEST,
} from '../actions/accounts'
import normalizeReactionsCounts from '../utils/reactions_counts_sort'
import { activeReactions, me } from '../initial_state'
import { STATUS_IMPORT, STATUSES_IMPORT } from '../actions/importer';
import { Map as ImmutableMap, List as ImmutableList, fromJS } from 'immutable';

const importStatus = (state, status) => state.set(status.id, fromJS(status));

const importStatuses = (state, statuses) =>
  state.withMutations(mutable => statuses.forEach(status => importStatus(mutable, status)));

const initialState = ImmutableMap();

export default function statuses(state = initialState, action) {
  switch(action.type) {
  case STATUS_IMPORT:
    return importStatus(state, action.status);
  case STATUSES_IMPORT:
    return importStatuses(state, action.statuses);
  case FAVORITE_REQUEST:
    state = state.setIn([action.statusId, 'favourited'], true);
    if (action.reactionId) {
      //set reaction not reaction_id since its setting in selectors/index
      state = state.setIn([action.statusId, 'reaction'], action.reactionId);
    }
    return state
  case FAVORITE_FAIL:
    return state.get(action.statusId) === undefined ? state : state.setIn([action.statusId, 'favourited'], false);
  case UNFAVORITE_REQUEST:
    state = state.setIn([action.statusId, 'favourited'], false)
    state = state.setIn([action.statusId, 'reaction'], null)
    return state
  case REPOST_REQUEST:
    return state.setIn([action.status.get('id'), 'reblogged'], true);
  case UNREPOST_REQUEST:
    return state.setIn([action.status.get('id'), 'reblogged'], false);
  case UNMENTION_REQUEST:
    return state.updateIn([action.status.get('id'), 'mentions'], list => list.filterNot((item) => {
      return `${item.get('id')}` === `${me}`
    }))
  case STATUS_MUTE_SUCCESS:
    return state.setIn([action.id, 'muted'], true)
  case STATUS_UNMUTE_SUCCESS:
    return state.setIn([action.id, 'muted'], false)
  case REPOST_FAIL:
    return state.get(action.status.get('id')) === undefined ? state : state.setIn([action.status.get('id'), 'reblogged'], false);
  case STATUS_REVEAL:
    return state.withMutations((map) => {
      action.ids.forEach(id => {
        if (!(state.get(id) === undefined)) {
          map.setIn([id, 'hidden'], false);
        }
      });
    });
  case UNBOOKMARK_REQUEST:
    return state.setIn([action.status.get('id'), 'bookmarked'], false);
  case STATUS_HIDE:
    return state.withMutations((map) => {
      action.ids.forEach(id => {
        if (!(state.get(id) === undefined)) {
          map.setIn([id, 'hidden'], true);
        }
      });
    });
  case UPDATE_STATUS_STATS:
    const { status_id } = action.data
    return state.withMutations((map) => {
      if (action.data.favourited !== undefined) map.setIn([status_id, 'favourited'], action.data.favourited)
      if (action.data.favourites_count !== undefined) map.setIn([status_id, 'favourites_count'], action.data.favourites_count)
      if (action.data.reblogged !== undefined) map.setIn([status_id, 'reblogged'], action.data.reblogged)
      if (action.data.reblogs_count !== undefined) map.setIn([status_id, 'reblogs_count'], action.data.reblogs_count)
      if (action.data.quotes_count !== undefined) map.setIn([status_id, 'quotes_count'], action.data.quotes_count)
      if (action.data.replies_count !== undefined) map.setIn([status_id, 'replies_count'], action.data.replies_count)
      if (action.data.direct_replies_count !== undefined) map.setIn([status_id, 'direct_replies_count'], action.data.direct_replies_count)
      if (action.data.pinned !== undefined) map.setIn([status_id, 'pinned'], action.data.pinned)
      if (action.data.pinned_by_group !== undefined) map.setIn([status_id, 'pinned_by_group'], action.data.pinned_by_group)
      if (action.data.bookmarked !== undefined) map.setIn([status_id, 'bookmarked'], action.data.bookmarked)

      if (action.data.reaction_id !== undefined) map.setIn([status_id, 'reaction'], action.data.reaction_id) //set reaction not reaction_id since its setting in selectors/index

      if (action.data.reactions_counts) {
        map.setIn([status_id, 'reactions_counts'], normalizeReactionsCounts(action.data.reactions_counts))
      }
    })
  
  case STATUS_SHOW_ANYWAYS:
    return state.setIn([action.statusId, 'show_anyways'], true);
  case STATUS_SHOW_ACCOUNT_ANYWAYS:
    return state.withMutations((map) => {
      map.forEach((mMap) => {
        if (`${mMap.get('account')}` === `${action.accountId}` && mMap.get('show_anyways') !== action.onOrOff) {
          map.setIn([mMap.get('id'), 'show_anyways'], action.onOrOff)
        }
      })
    })
  case ACCOUNT_BLOCK_REQUEST:
  case ACCOUNT_MUTE_REQUEST:
    return state.withMutations((map) => {
      map.forEach((mMap) => {
        if (`${mMap.get('account')}` === `${action.id}`) {
          map.setIn([mMap.get('id'), 'show_anyways'], false)
        }
      })
    })
  case ACCOUNT_UNBLOCK_REQUEST:
  case ACCOUNT_UNMUTE_REQUEST:
    return state.withMutations((map) => {
      map.forEach((mMap) => {
        if (`${mMap.get('account')}` === `${action.id}` && !mMap.get('show_anyways')) {
          map.setIn([mMap.get('id'), 'show_anyways'], true)
        }
      })
    })
  case STATUS_REACTIONS_FETCH_SUCCESS:
    return state.setIn([action.statusId, 'reactions_counts'], normalizeReactionsCounts(action.reactions))
  case STATUS_REACTIONS_FETCH_FAIL:
    return state
  case CONVERSATION_OWNER_FETCH_SUCCESS:
    return state.withMutations((map) => {
      map.setIn([action.statusId, 'conversation_owner'], action.owner)
      map.setIn([action.statusId, 'conversation_owner_status_id'], action.ownerStatusId)
    })
  case CONVERSATION_OWNER_FETCH_FAIL:
    return state
  case REMOVE_REPLY_SUCCESS:
    return state.setIn([action.statusId, 'in_reply_to_id'], null)    
  case REMOVE_REPLY_FAIL:
    return state
  default:
    return state;
  }
};
