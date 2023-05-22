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
import { fetchComments } from '../actions/statuses'
import { replyCompose } from '../actions/compose'
import { openModal } from '../actions/modal'
import { openPopover } from '../actions/popover'
import { makeGetStatus } from '../selectors'
import {
  CX,
  MODAL_BOOST,
} from '../constants'
import { me, boostModal } from '../initial_state'
import Avatar from './avatar'
import Button from './button'
import CommentHeader from './comment_header'
import StatusContent from './status_content'
import StatusMedia from './status_media'
import { defaultMediaVisibility } from './status'
import Text from './text'
import CommentSubReplyLoadMoreButton from './comment_sub_reply_load_more_button'

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

  handleOnOpenStatusOptions = () => {
    this.props.onOpenStatusOptions(this.moreNode, this.props.status)
  }

  handleToggleMediaVisibility = () => {
    this.setState({ showMedia: !this.state.showMedia })
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

  setMoreNode = (c) => {
    this.moreNode = c
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

    //If account is spam and not mine, hide
    if (status.getIn(['account', 'is_spam']) && status.getIn(['account', 'id']) !== me) {
      return null
    }

    const replyCount = status.get('direct_replies_count')
    const loadedReplyCount = !!commentLoadedDescendants ? commentLoadedDescendants.size : 0
    const unloadedReplyCount = replyCount - loadedReplyCount
    const repliesLoaded = unloadedReplyCount === 0

    //If blocked or muted, hide
    const blocks = !!me ? localStorage.getItem('blocks') : ''
    const mutes = !!me ? localStorage.getItem('mutes') : ''
    const blockedby = !!me ? localStorage.getItem('blockedby') : ''
    if (
        !!me && (
          (blockedby && blockedby.split(',').includes(status.getIn(['account', 'id'])))
          ||
          (blocks && blocks.split(',').includes(status.getIn(['account', 'id'])))
          ||
          (mutes && mutes.split(',').includes(status.getIn(['author', 'id'])))
        )
    ) {
      return null
    }

    if (isHidden) {
      return (
        <div tabIndex='0' ref={this.setContainerNode}>
          {status.getIn(['account', 'display_name']) || status.getIn(['account', 'username'])}
          {status.get('content')}
        </div>
      )
    }

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
            <NavLink
              to={`/${status.getIn(['account', 'acct'])}`}
              title={status.getIn(['account', 'acct'])}
              className={[_s.d, _s.mr10, _s.pt5].join(' ')}
            >
              <Avatar account={status.get('account')} size={30} />
            </NavLink>

            <div className={[_s.d, _s.flexShrink1, _s.maxW100PC42PX].join(' ')}>
              <div className={contentClasses}>
                <CommentHeader
                  ancestorAccountId={ancestorAccountId}
                  status={status}
                  onOpenRevisions={this.props.onOpenStatusRevisionsPopover}
                  onOpenLikes={this.props.onOpenLikes}
                  onOpenReposts={this.props.onOpenReposts}
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

              <div className={[_s.d, _s.flexRow, _s.mt5].join(' ')}>
                <CommentButton
                  title={status.get('favourited') && !!me ? 'Unlike' : 'Like'}
                  onClick={this.handleOnFavorite}
                />
                <CommentButton
                  title={'Reply'}
                  onClick={this.handleOnReply}
                />
                <CommentButton
                  title={status.get('reblogged') && !!me ? 'Unrepost' : 'Repost'}
                  onClick={this.handleOnRepost}
                />
                <div ref={this.setMoreNode}>
                  <CommentButton
                    title='···'
                    onClick={this.handleOnOpenStatusOptions}
                  />
                </div>
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
    const { onClick, title } = this.props

    return (
      <Button
        isText
        radiusSmall
        backgroundColor='none'
        color='tertiary'
        className={[_s.px5, _s.bgSubtle_onHover, _s.py2, _s.mr5].join(' ')}
        onClick={onClick}
      >
        <Text size='extraSmall' color='inherit' weight='bold'>
          {title}
        </Text>
      </Button>
    )
  }

}

CommentButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
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

    if (status.get('favourited')) {
      dispatch(unfavorite(status))
    } else {
      dispatch(favorite(status))
    }
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
  onOpenLikes(status) {
    dispatch(openModal('STATUS_LIKES', { status }))
  },
  onOpenReposts(status) {
    dispatch(openModal('STATUS_REPOSTS', { status }))
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
  onOpenStatusRevisionsPopover: PropTypes.func.isRequired,
  onOpenMedia: PropTypes.func.isRequired,
}

export default withRouter(connect(makeMapStateToProps, mapDispatchToProps)(Comment))
