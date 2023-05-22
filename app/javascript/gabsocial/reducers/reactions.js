import {
  REACTIONS_HYDRATE_ACTIVE,
  REACTION_SET_POPOVER_STATUS,
  REACTION_HOVERING,
} from '../actions/reactions'
import { REACTIONS_IMPORT } from '../actions/importer'
import {
  Map as ImmutableMap,
  List as ImmutableList,
  fromJS,
} from 'immutable'

const initialState = ImmutableMap({
  reactionPopoverOpenForStatusId: null,
  hovering_id: null,
  all: ImmutableMap({}),
  active_reactable: ImmutableList(),
})

const importReaction = (state, reaction) => state.setIn(['all', `${reaction.id}`], fromJS(reaction));

const importReactions = (state, reactions) =>
  state.withMutations(mutable => reactions.forEach(reaction => importReaction(mutable, reaction)));

export default function reactions(state = initialState, action) {
  switch(action.type) {
  case REACTIONS_HYDRATE_ACTIVE:
    if (!Array.isArray(action.reactions)) return state
    state = importReactions(state, action.reactions)
    return state.set('active_reactable', fromJS(action.reactions))
  case REACTIONS_IMPORT:
    state = importReactions(state, action.reactions)
  case REACTION_HOVERING:
    return state.set('hovering_id', action.reactionId)
  case REACTION_SET_POPOVER_STATUS:
    return state.set('reactionPopoverOpenForStatusId', action.statusId)
  default:
    return state
  }
}
