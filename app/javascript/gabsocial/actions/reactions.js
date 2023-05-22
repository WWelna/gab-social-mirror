import { activeReactions } from '../initial_state'

export const REACTIONS_HYDRATE_ACTIVE = 'REACTIONS_HYDRATE_ACTIVE'
export const REACTION_HOVERING = 'REACTION_HOVERING'
export const REACTION_SET_POPOVER_STATUS = 'REACTION_SET_POPOVER_STATUS'

export const hydrateActiveReactions = () => (dispatch) => {
  if (!activeReactions || !Array.isArray(activeReactions)) return

  dispatch({
    type: REACTIONS_HYDRATE_ACTIVE,
    reactions: activeReactions,
  })
}

export const setReactionPopoverStatus = (statusId) => (dispatch) => {
  dispatch({
    type: REACTION_SET_POPOVER_STATUS,
    statusId: statusId,
  })
}

export const setIsHoveringReactionId = (reactionId) => (dispatch) => {
  dispatch({
    type: REACTION_HOVERING,
    reactionId: reactionId,
  })
}
