import {
  ACCOUNT_BLOCK_SUCCESS,
  ACCOUNT_MUTE_SUCCESS,
} from '../actions/accounts'
import {
  COMMENTS_FETCH_SUCCESS,
  CONTEXT_FETCH_SUCCESS,
  CLEAR_ALL_COMMENTS,
  COMMENTS_FETCH_REQUEST,
  COMMENTS_FETCH_FAIL,
  REMOVE_REPLY_SUCCESS,
  STATUS_DELETE_SUCCESS,
} from '../actions/statuses'
import { Map as ImmutableMap, List as ImmutableList } from 'immutable'
import compareId from '../utils/compare_id'

const initialState = ImmutableMap({
  inReplyTos: ImmutableMap(),
  replies: ImmutableMap(),
  nexts: ImmutableMap(),
  isLoading: ImmutableMap()
})

const normalizeContext = (immutableState, id, ancestors, descendants) => immutableState.withMutations(state => {
  state.update('inReplyTos', immutableAncestors => immutableAncestors.withMutations(inReplyTos => {
    state.update('replies', immutableDescendants => immutableDescendants.withMutations(replies => {
      function addReply({ id, in_reply_to_id }) {
        if (in_reply_to_id && !inReplyTos.has(id)) {

          replies.update(in_reply_to_id, ImmutableList(), siblings => {
            const index = siblings.findLastIndex(sibling => compareId(sibling, id) < 0);
            return siblings.insert(index + 1, id);
          });

          inReplyTos.set(id, in_reply_to_id);
        }
      }

      // We know in_reply_to_id of statuses but `id` itself.
      // So we assume that the status of the id replies to last ancestors.

      ancestors.forEach(addReply);

      if (ancestors[0]) {
        addReply({ id, in_reply_to_id: ancestors[ancestors.length - 1].id });
      }

      descendants.forEach(addReply);
    }));
  }));
});

const deleteFromContexts = (immutableState, ids) => immutableState.withMutations(state => {
  state.update('inReplyTos', immutableAncestors => immutableAncestors.withMutations(inReplyTos => {
    state.update('replies', immutableDescendants => immutableDescendants.withMutations(replies => {
      ids.forEach(id => {
        const inReplyToIdOfId = inReplyTos.get(id);
        const repliesOfId = replies.get(id);
        const siblings = replies.get(inReplyToIdOfId);

        if (siblings) {
          replies.set(inReplyToIdOfId, siblings.filterNot(sibling => sibling === id));
        }


        if (repliesOfId) {
          repliesOfId.forEach(reply => inReplyTos.delete(reply));
        }

        inReplyTos.delete(id);
        replies.delete(id);
      });
    }));
  }));
});

const filterContexts = (state, relationship, statuses) => {
  const ownedStatusIds = statuses
    .filter(status => status.get('account') === relationship.id)
    .map(status => status.get('id'));

  return deleteFromContexts(state, ownedStatusIds);
};

export default function replies(state = initialState, action) {
  switch(action.type) {
  case ACCOUNT_BLOCK_SUCCESS:
  case ACCOUNT_MUTE_SUCCESS:
    return filterContexts(state, action.relationship, action.statuses);
  case CONTEXT_FETCH_SUCCESS:
    return normalizeContext(state, action.id, action.ancestors, action.descendants);
  case CLEAR_ALL_COMMENTS:
    state = state.withMutations((mutable) => {
      mutable.setIn(['nexts', action.id], null)
      mutable.setIn(['fetchedStatusParts', action.id], false)
    })
    const thisReplies = state.getIn(['replies', action.id])
    return deleteFromContexts(state, thisReplies)
  case COMMENTS_FETCH_SUCCESS:
    state = state.withMutations((mutable) => {
      mutable.setIn(['nexts', action.id], action.next)
      mutable.setIn(['isLoading', action.id], false)
      mutable.setIn(['fetchedStatusParts', action.id], true)
    })
    return normalizeContext(state, action.id, ImmutableList(), action.descendants);
  case COMMENTS_FETCH_REQUEST:
    return state.setIn(['isLoading', action.id], true)
  case COMMENTS_FETCH_FAIL:
    return state.setIn(['isLoading', action.id], false)
  case REMOVE_REPLY_SUCCESS:
    return deleteFromContexts(state, [action.statusId]) 
  case STATUS_DELETE_SUCCESS:
    return deleteFromContexts(state, [action.id])
  default:
    return state;
  }
};
