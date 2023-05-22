import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { NavLink, withRouter } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import {
  favorite,
  unfavorite,
  repost,
  unrepost,
} from '../actions/interactions'
import {
  fetchComments,
  showStatusAnyways,
} from '../actions/statuses'
import { replyCompose } from '../actions/compose'
import { openModal } from '../actions/modal'
import {
  openPopover,
  cancelPopover,
  closePopover,
} from '../actions/popover'
import { makeGetStatus } from '../selectors'
import {
  CX,
  MODAL_BOOST,
  POPOVER_STATUS_REACTIONS_COUNT,
} from '../constants'
import { canShowComment } from '../utils/can_show'
import { me, boostModal, allReactions } from '../initial_state'
import Avatar from './avatar'
import Button from './button'
import Dummy from './dummy'
import CommentHeader from './comment_header'
import StatusContent from './status_content'
import StatusMedia from './status_media'
import { defaultMediaVisibility } from './status'
import Text from './text'
import CommentSubReplyLoadMoreButton from './comment_sub_reply_load_more_button'
import SensitiveMediaItem from './sensitive_media_item'
import ReactionsPopoverInitiator from './reactions_popover_initiator'
import ReactionsDisplayBlock from './reactions_display_block'

class Comment extends ImmutablePureComponent {

  state = {
    showMedia: defaultMediaVisibility(this.props.status),
    statusId: undefined,
    height: undefined,
  }

  handleClick = () => {
    //
  }

  handleOnReply = () => {
    this.props.onReply(this.props.status, this.props.history)
  }

  handleOnFavorite = () => {
    this.props.onFavorite(this.props.status)
  }

  handleOnRepost = () => {
    this.props.onRepost(this.props.status)
  }
  
  handleOnRepost = () => {
    this.props.onRepost(this.props.status)
  }

  handleOnOpenStatusOptions = () => {
    this.props.onOpenStatusOptions(this.moreNode, this.props.status)
  }

  handleOnShowStatusAnyways = () => {
    this.props.onShowStatusAnyways(this.props.status.get('id'))
  }

  handleOnThreadMouseEnter = (event) => {
    if (event.target) {
      const threadKey = event.target.getAttribute('data-threader-indent')
      const elems = document.querySelectorAll(`[data-threader-indent="${threadKey}"]`)
      elems.forEach((elem) => elem.classList.add('thread-hovering'))
    }
  }
  
  handleOnThreadMouseLeave = (event) => {
    if (event.target) {
      const threadKey = event.target.getAttribute('data-threader-indent')
      const elems = document.querySelectorAll(`[data-threader-indent="${threadKey}"]`)
      elems.forEach((elem) => elem.classList.remove('thread-hovering'))
    }
  }
  
  handleOnThreadClick = (event) => {
    // : todo :
  }

  handleOnLoadMore = () => {
    const { status } = this.props
    if (!status) return

    this.props.onFetchComments(status.get('id'))
  }

  handleOnOpenLikes = () => {
    this.props.onOpenLikes(this.props.status, this.floatingReactionsRef)
  }

  setMoreNode = (c) => {
    this.moreNode = c
  }

  setFloatingReactionsRef = (c) => {
    this.floatingReactionsRef = c
  }

  setContainerNode = (c) => {
    this.containerNode = c
  } 

  render() {
    const {
      indent,
      status,
      isHidden,
      isHighlighted,
      isDetached,
      ancestorAccountId,
      commentLoadedDescendants,
    } = this.props

    if (!status) return null

    const commenterAccountId = status.getIn(['account', 'id'])

    //If account is spam and not mine, hide
    if (status.getIn(['account', 'is_spam']) && commenterAccountId !== me) {
      return null
    }

    const replyCount = status.get('direct_replies_count')
    const loadedReplyCount = !!commentLoadedDescendants ? commentLoadedDescendants.size : 0
    const unloadedReplyCount = replyCount - loadedReplyCount
    const repliesLoaded = unloadedReplyCount === 0
    const reactionsMap = status.get('reactions_counts')

    const csd = canShowComment(status)
    
    const style = {
      paddingLeft: `${indent * 38}px`,
    }

    const containerClasses = CX({
      d: 1,
      px15: 1,
      pt5: !isDetached,
      pt10: isDetached,
      pb5: isDetached,
      borderBottom1PX: isDetached,
      borderColorSecondary: isDetached,
    })

    const contentClasses = CX({
      d: 1,
      px10: 1,
      pt5: 1,
      pb10: 1,
      radiusSmall: 1,
      bgSubtle: !isHighlighted,
      highlightedComment: isHighlighted,
    })

    const AvatarComponent = (!csd.label && !csd.nulled) ? NavLink : Dummy
    const reaction = status.get('reaction')
    const likeBtnTitle = !!reaction ?
    reaction.get('name_past').charAt(0).toUpperCase() + reaction.get('name_past').slice(1) :
    !!status.get('favourited') && !!me ? 'Liked' : 'Like'

    return (
      <div
        className={containerClasses}
        data-comment={status.get('id')}
        ref={this.setContainerNode}
      >
        {
          indent > 0 &&
          <div className={[_s.d, _s.z3, _s.flexRow, _s.posAbs, _s.topNeg20PX, _s.left0, _s.bottom20PX, _s.aiCenter, _s.jcCenter].join(' ')}>
            {Array.apply(null, {
              length: indent
            }).map((_, i) => (
              <button
                key={`thread-${status.get('id')}-${i}`}
                data-threader
                data-threader-indent={i}
                onMouseEnter={this.handleOnThreadMouseEnter}
                onMouseLeave={this.handleOnThreadMouseLeave}
                onClick={this.handleOnThreadClick}
                className={[_s.d, _s.w14PX, _s.h100PC, _s.outlineNone, _s.bgTransparent, _s.ml20, _s.cursorPointer].join(' ')}
              >
                <span className={[_s.d, _s.w2PX, _s.h100PC, _s.mlAuto, _s.mr2, _s.bgSubtle].join(' ')} />
              </button>
            ))}
          </div>
        }
        <div className={[_s.d, _s.mb5].join(' ')} style={style}>

          <div className={[_s.d, _s.flexRow].join(' ')}>
            <AvatarComponent
              to={!csd.label && !csd.nulled ? `/${status.getIn(['account', 'acct'])}` : undefined}
              title={!csd.label && !csd.nulled ? status.getIn(['account', 'acct']) : undefined}
              className={[_s.d, _s.mr10, _s.pt5].join(' ')}
            >
              { !csd.label && !csd.nulled && <Avatar account={status.get('account')} size={30} /> }
              { !!csd.label &&
                <div style={{ height: '30px', width: '30px' }} className={[_s.d, _s.circle, _s.bgSecondary].join(' ')} />
              }
            </AvatarComponent>

            <div className={[_s.d, _s.flexShrink1, _s.maxW100PC42PX, _s.minW252PX].join(' ')}>
              {
                csd.nulled &&
                <div className={contentClasses}>
                  <div className={[_s.d, _s.px5, _s.mt10, _s.mb5].join(' ')}>
                    <Text color='tertiary'>{csd.label}</Text>
                  </div>
                </div>
              }
              {
                (!!csd.label && !csd.nulled) &&
                <SensitiveMediaItem
                  noPadding
                  onClick={this.handleOnShowStatusAnyways}
                  message={csd.label}
                  btnTitle='View'
                />
              }
              {
                (!csd.label && !csd.nulled) &&
                <div className={contentClasses}>
                  <CommentHeader
                    ancestorAccountId={ancestorAccountId}
                    status={status}
                    onOpenRevisions={this.props.onOpenStatusRevisionsPopover}
                    onOpenLikes={this.props.onOpenLikes}
                    onOpenReposts={this.props.onOpenReposts}
                    onOpenQuotes={this.props.onOpenQuotes}
                  />
                  <StatusContent
                    status={status}
                    onClick={this.handleClick}
                    isComment
                    collapsable
                  />
                  <div className={[_s.d, _s.mt5].join(' ')}>
                    <StatusMedia
                      isComment
                      status={status}
                      onOpenMedia={this.props.onOpenMedia}
                      cacheWidth={this.props.cacheMediaWidth}
                      defaultWidth={this.props.cachedMediaWidth}
                      visible={this.state.showMedia}
                      onToggleVisibility={this.handleToggleMediaVisibility}
                      width={this.props.cachedMediaWidth}
                    />
                  </div>
                </div>
              }

              <div className={[_s.d, _s.flexRow, _s.mt5].join(' ')}>
                <ReactionsPopoverInitiator
                  statusId={status.get('id')}
                  onClick={this.handleOnFavorite}
                >
                  <CommentButton
                    title={likeBtnTitle}
                    isDisabled={!!csd.label && !status.get('favourited')}
                  />
                </ReactionsPopoverInitiator>
                <CommentButton
                  title={'Reply'}
                  onClick={this.handleOnReply}
                  isDisabled={!!csd.label}
                />
                <CommentButton
                  title={status.get('reblogged') && !!me ? 'Unrepost' : 'Repost'}
                  onClick={this.handleOnRepost}
                  isDisabled={!!csd.label && !status.get('reblogged')}
                />
                <div ref={this.setMoreNode}>
                  <CommentButton
                    title='···'
                    onClick={this.handleOnOpenStatusOptions}
                    isDisabled={!!csd.label}
                  />
                </div>
                {
                  status.get('favourites_count') > 0 &&
                  <div
                    ref={this.setFloatingReactionsRef}
                    className={[_s.d, _s.circle, _s.bgPrimary, _s.aiCenter, _s.jcCenter, _s.h20PX, _s.boxShadowBlock, _s.posAbs, _s.right0, _s.topNeg25PX, _s.px5, _s.mrNeg5PX].join(' ')}
                  >
                    <ReactionsDisplayBlock
                      showIcons
                      showText
                      isBasicText
                      totalCount={status.get('favourites_count')}
                      reactions={reactionsMap}
                      onClick={this.handleOnOpenLikes}
                      iconSize='14px'
                      textSize='extraSmall'
                      textColor='tertiary'
                    />
                  </div>
                }
              </div>
            </div>
          </div>


          {
            replyCount > 0 &&
            <CommentSubReplyLoadMoreButton
              shouldShow={loadedReplyCount < unloadedReplyCount}
              replyCount={unloadedReplyCount}
              onClick={this.handleOnLoadMore}
            />
          }
        </div>
      </div>
    )
  }

}

class CommentButton extends React.PureComponent {

  render() {
    const { onClick, title, isDisabled } = this.props

    return (
      <Button
        isText
        radiusSmall
        backgroundColor='none'
        color='tertiary'
        className={[_s.px5, _s.bgSubtle_onHover, _s.py2, _s.mr5].join(' ')}
        onClick={onClick}
        isDisabled={isDisabled}
      >
        <Text size='extraSmall' color='inherit' weight='bold' className={_s.capitalize}>
          {title}
        </Text>
      </Button>
    )
  }

}

CommentButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  isDisabled: PropTypes.bool.isRequired,
}

const makeMapStateToProps = (state, props) => ({
  commentLoadedDescendants: state.getIn(['contexts', 'replies', props.id]),
  status: makeGetStatus()(state, props),
})

const mapDispatchToProps = (dispatch) => ({
  onReply(status, history) {
    if (!me) return dispatch(openModal('UNAUTHORIZED'))

    dispatch((_, getState) => {
      const state = getState();
      if (state.getIn(['compose', 'text']).trim().length !== 0) {
        dispatch(openModal('CONFIRM', {
          message: <FormattedMessage id='confirmations.reply.message' defaultMessage='Replying now will overwrite the message you are currently composing. Are you sure you want to proceed?' />,
          confirm: <FormattedMessage id='confirmations.reply.confirm' defaultMessage='Reply' />,
          onConfirm: () => dispatch(replyCompose(status, history)),
        }))
      } else {
        dispatch(replyCompose(status, history, true))
      }
    })
  },
  onFavorite(status) {
    if (!me) return dispatch(openModal('UNAUTHORIZED'))

    const statusId = status.get('id')

    if (status.get('favourited')) {
      dispatch(unfavorite(statusId))
    } else {
      dispatch(favorite(statusId))
    }

    dispatch(cancelPopover())
    dispatch(closePopover())
  },
  onRepost(status) {
    if (!me) return dispatch(openModal('UNAUTHORIZED'))

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
  onOpenStatusOptions(targetRef, status) {
    dispatch(openPopover('STATUS_OPTIONS', {
      targetRef,
      statusId: status.get('id'),
      position: 'top',
    }))
  },
  onOpenLikes(status, targetRef) {
    if (!status) return

    const isMyStatus = status.getIn(['account', 'id']) === me
    if (!isMyStatus || !me) {
      dispatch(openPopover(POPOVER_STATUS_REACTIONS_COUNT, {
        targetRef,
        statusId: status.get('id'),
      }))
    } else {
      dispatch(openModal('STATUS_LIKES', { status }))
    }
  },
  onOpenReposts(status) {
    dispatch(openModal('STATUS_REPOSTS', { status }))
  },
  onOpenQuotes(status) {
    dispatch(openModal('STATUS_QUOTES', { status }))
  },
  onOpenStatusRevisionsPopover(status) {
    dispatch(openModal('STATUS_REVISIONS', {
      status,
    }))
  },
  onOpenMedia (media, index) {
    dispatch(openModal('MEDIA', { media, index }));
  },
  onFetchComments(statusId) {
    dispatch(fetchComments(statusId, true))
  },
  onShowStatusAnyways(statusId) {
    dispatch(showStatusAnyways(statusId))
  },
})

Comment.propTypes = {
  indent: PropTypes.number,
  ancestorAccountId: PropTypes.string.isRequired,
  status: ImmutablePropTypes.map.isRequired,
  isHidden: PropTypes.bool,
  isDetached: PropTypes.bool,
  isIntersecting: PropTypes.bool,
  isHighlighted: PropTypes.bool,
  onReply: PropTypes.func.isRequired,
  onFavorite: PropTypes.func.isRequired,
  onRepost: PropTypes.func.isRequired,
  onOpenStatusOptions: PropTypes.func.isRequired,
  onOpenLikes: PropTypes.func.isRequired,
  onOpenReposts: PropTypes.func.isRequired,
  onOpenQuotes: PropTypes.func.isRequired,
  onOpenStatusRevisionsPopover: PropTypes.func.isRequired,
  onOpenMedia: PropTypes.func.isRequired,
  onShowStatusAnyways: PropTypes.func.isRequired,
}

export default withRouter(connect(makeMapStateToProps, mapDispatchToProps)(Comment))
