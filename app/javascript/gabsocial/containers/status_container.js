import React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import moment from 'moment-mini'
import {
  Map as ImmutableMap,
  List as ImmutableList,
  fromJS,
} from 'immutable';
import {
  repost,
  favorite,
  unrepost,
  unfavorite,
} from '../actions/interactions';
import {
  hideStatus,
  revealStatus,
  fetchComments,
  fetchContext,
  showStatusAnyways,
} from '../actions/statuses';
import { openModal } from '../actions/modal';
import {
  openPopover,
  cancelPopover,
  closePopover,
} from '../actions/popover'
import {
  me,
  boostModal,
} from '../initial_state'
import {
  MODAL_BOOST,
  MODAL_COMPOSE,
  MODAL_STATUS,
  MODAL_PRO_UPGRADE,
  MODAL_UNAUTHORIZED,
  POPOVER_COMMENT_SORTING_OPTIONS,
  POPOVER_SHARE,
  POPOVER_STATUS_REACTIONS_COUNT,
  POPOVER_STATUS_REACTIONS_SELECTOR,
  COMMENT_SORTING_TYPE_NEWEST,
  COMMENT_SORTING_TYPE_TOP,
} from '../constants'
import { makeGetStatus } from '../selectors'
import Status from '../components/status';


const sortReplies = (replyIds, state, type) => {
  if (!replyIds) return replyIds

  let statusList = []
  replyIds.forEach((replyId) => {
    const status = state.getIn(['statuses', replyId])
    if (status) {
      statusList.push({
        id: replyId,
        likeCount: parseFloat(status.get('favourites_count')),
        createdAt: moment(status.get('created_at')).valueOf(),
      })
    }
  })

  statusList.sort((a, b) => {
    if (type === COMMENT_SORTING_TYPE_NEWEST) {
      return b.createdAt - a.createdAt
    } else if (type === COMMENT_SORTING_TYPE_TOP) {
      return b.likeCount - a.likeCount
    }
    return a.createdAt - b.createdAt
  })

  let newReplyIds = ImmutableList()
  for (let i = 0; i < statusList.length; i++) {
    const block = statusList[i];
    newReplyIds = newReplyIds.set(i, block.id)   
  }

  return newReplyIds
}

const getDescendants = (state, status, highlightStatusId, commentSortingType) => {
  let descendantsIds = ImmutableList()
  let index = 0
  const MAX_INDENT = 2

  descendantsIds = descendantsIds.withMutations((mutable) => {
    const ids = [{
      id: status.get('id'),
      indent: -1,
    }]

    while (ids.length > 0) {
      let block = ids.shift()
      let id = block.id
      let indent = block.indent

      let replies = state.getIn(['contexts', 'replies', id])

      // Sort only Top-level replies (if original status not comment)
      if (index === 0) {
        replies = sortReplies(replies, state, commentSortingType)
      }

      if (status.get('id') !== id) {
        mutable.push(ImmutableMap({
          statusId: id,
          indent: indent,
          isHighlighted: !!highlightStatusId && highlightStatusId === id,
        }))
      }

      if (!!replies) {
        indent++
        indent = Math.min(MAX_INDENT, indent)

        replies.reverse().forEach((reply) => {
          ids.unshift({
            id: reply,
            indent: indent,
          })
        })
      }

      index++
    }
  })

  return descendantsIds
}

const makeMapStateToProps = () => {
  const getStatus = makeGetStatus()

  const mapStateToProps = (state, props) => {
    const statusId = props.id || (props.params && props.params.statusId)
    const username = props.params ? props.params.username : undefined
    const commentSortingType = state.getIn(['settings', 'commentSorting'])
    const contextType = props.contextType

    const status = getStatus(state, {
      id: statusId,
      username: username,
    })

    let fetchedContext = false
    let descendantsIds = ImmutableList()
    let ancestorStatus

    //

    if (status && status.get('in_reply_to_account_id') && !props.isChild) {
      fetchedContext = true

      let inReplyTos = state.getIn(['contexts', 'inReplyTos'])
      let ancestorsIds = ImmutableList()
      ancestorsIds = ancestorsIds.withMutations(mutable => {
        let id = statusId;
        while (id) {
          mutable.unshift(id)
          id = inReplyTos.get(id)
        }
      })

      const ancestorStatusId = ancestorsIds.get(0)
      if (ancestorStatusId !== statusId) {
        ancestorStatus = getStatus(state, {
          id: ancestorStatusId,
        })
        if (!!ancestorStatus) {
          descendantsIds = getDescendants(state, ancestorStatus, statusId)
        }
      }
    }

    //

    const isOrphaned = !!status && status.get('is_reply') && !status.get('in_reply_to_id')

    if (status && (status.get('replies_count') > 0 || status.get('direct_replies_count') > 0) && (!fetchedContext || isOrphaned)) {
      descendantsIds = getDescendants(state, status, null, commentSortingType)
    }

    const isComment = !!status && !isOrphaned ? !!status.get('in_reply_to_id') : false
    const loadedDirectDescendants = !!ancestorStatus ? state.getIn(['contexts', 'replies', ancestorStatus.get('id')]) : state.getIn(['contexts', 'replies', statusId])

    return {
      status,
      ancestorStatus,
      descendantsIds,
      loadedDirectDescendantsCount: !!loadedDirectDescendants ? loadedDirectDescendants.size : 0,
      isComment,
      commentSortingType,
      contextType,
      highlightStatusId: isComment ? statusId : null,
      isComposeModalOpen: state.getIn(['modal', 'modalType']) === 'COMPOSE',
      isDeckConnected: state.getIn(['deck', 'connected'], false),
      isReacting: state.getIn(['popover', 'popoverType']) === POPOVER_STATUS_REACTIONS_SELECTOR,
      hoveringReactionId: state.getIn(['reactions', 'hovering_id']),
      reactionPopoverOpenForStatusId: state.getIn(['reactions', 'reactionPopoverOpenForStatusId']),
      isLoading: state.getIn(['contexts', 'isLoading', statusId], false)
    }
  }

  return mapStateToProps
}

const mapDispatchToProps = (dispatch) => ({
  onReply (replyStatus) {
    if (!me) return dispatch(openModal(MODAL_UNAUTHORIZED))

    // the status goes into modalProps then ComposeModal
    dispatch(openModal(MODAL_COMPOSE, { replyStatus, isComment: true }))
  },

  onShowRevisions (status) {
    if (!me) return dispatch(openModal(MODAL_UNAUTHORIZED))

    dispatch(openModal('STATUS_REVISION', { status }));
  },

  onFavorite (status) {
    if (!me) return dispatch(openModal(MODAL_UNAUTHORIZED))

    const statusId = status.get('id')

    if (status.get('favourited')) {
      dispatch(unfavorite(statusId));
    } else {
      dispatch(favorite(statusId));
    }

    // cancel reaction popover
    dispatch(cancelPopover())
    dispatch(closePopover())
  },

  onMention (mentionAccount) {
    if (!me) return dispatch(openModal(MODAL_UNAUTHORIZED))

    // the status goes into modalProps then ComposeModal
    dispatch(openModal(MODAL_COMPOSE, { mentionAccount }))
  },

  onOpenMedia (media, index) {
    dispatch(openModal('MEDIA', { media, index }));
  },

  onOpenVideo (media, time) {
    dispatch(openModal('VIDEO', { media, time }));
  },

  onToggleHidden (status) {
    if (!me) return dispatch(openModal(MODAL_UNAUTHORIZED))

    if (status.get('hidden')) {
      dispatch(revealStatus(status.get('id')));
    } else {
      dispatch(hideStatus(status.get('id')));
    }
  },

  onOpenLikes(status, targetRef) {
    if (!status || !me) return

    const isMyStatus = status.getIn(['account', 'id']) === me
    if (!isMyStatus) {
      dispatch(openPopover(POPOVER_STATUS_REACTIONS_COUNT, {
        targetRef,
        statusId: status.get('id'),
      }))
    } else {
      dispatch(openModal('STATUS_LIKES', { status }))
    }
  },
    
  onOpenReposts(status) {
    if (!me) return dispatch(openModal(MODAL_UNAUTHORIZED))

    dispatch(openModal('STATUS_REPOSTS', { status }))
  },

  onOpenQuotes(status) {
    if (!me) return dispatch(openModal(MODAL_UNAUTHORIZED))

    dispatch(openModal('STATUS_QUOTES', { status }))
  },
  
  onFetchComments(statusId) {
    dispatch(fetchComments(statusId))
  },

  onFetchContext(statusId) {
    dispatch(fetchContext(statusId))
  },

  onQuote (quoteStatus) {
    if (!me) return dispatch(openModal(MODAL_UNAUTHORIZED))
    dispatch(openModal(MODAL_COMPOSE, { quoteStatus }))
  },

  onRepost (status) {
    if (!me) return dispatch(openModal(MODAL_UNAUTHORIZED))
    
    const alreadyReposted = status.get('reblogged')

    if (boostModal && !alreadyReposted) {
      dispatch(openModal(MODAL_BOOST, {
        status,
        onRepost: () => dispatch(repost(status)),
      }))
    } else {
      if (alreadyReposted) {
        dispatch(unrepost(status))
      } else {
        dispatch(repost(status))
      }
    }
  },

  onShare (targetRef, status) {
    if (!!navigator && navigator.share) {
      if (!!navigator.canShare && !navigator.canShare()) {
        //
      } else {
        const url = status.get('url')
        return navigator.share({
          url,
          title: 'Check out this post on Gab',
          text: 'Check out this post on Gab',
        }).then(() => {
          //
        }).catch((error) => {
          console.log('Error sharing', error)
        })
      }
    } 

    dispatch(openPopover(POPOVER_SHARE, {
      targetRef,
      status,
      position: 'top',
    }))
  },

  onCommentSortOpen(targetRef, statusId, callback) {
    dispatch(openPopover(POPOVER_COMMENT_SORTING_OPTIONS, {
      targetRef,
      callback,
      statusId,
      position: 'top',
    }))
  },

  onOpenProModal() {
    dispatch(openModal(MODAL_PRO_UPGRADE))
  },

  onOpenStatusModal(statusId) {
    dispatch(openModal(MODAL_STATUS, { statusId }))
  },

  onExpandComments(statusId) {
    dispatch(fetchComments(statusId, false, true))
  },

  onShowStatusAnyways(statusId) {
    dispatch(showStatusAnyways(statusId))
  },

});

export default connect(makeMapStateToProps, mapDispatchToProps)(Status);
