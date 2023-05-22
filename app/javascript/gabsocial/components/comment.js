import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { NavLink } from 'react-router-dom'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import moment from 'moment-mini'
import { favorite, unfavorite, repost, unrepost } from '../actions/interactions'
import { fetchComments, showStatusAnyways } from '../actions/statuses'
import { openModal } from '../actions/modal'
import { openPopover, cancelPopover, closePopover } from '../actions/popover'
import { makeGetStatus } from '../selectors'
import {
  CX,
  MODAL_BOOST,
  MODAL_COMPOSE,
  MODAL_MEDIA,
  MODAL_STATUS_LIKES,
  MODAL_STATUS_QUOTES,
  MODAL_STATUS_REPOSTS,
  MODAL_STATUS_REVISIONS,
  MODAL_UNAUTHORIZED,
  POPOVER_STATUS_REACTIONS_COUNT,
  POPOVER_STATUS_OPTIONS
} from '../constants'
import { canShowComment } from '../utils/can_show'
import { me, boostModal } from '../initial_state'
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
import ResponsiveClassesComponent from '../features/ui/util/responsive_classes_component'

class Comment extends ImmutablePureComponent {
  state = {
    showMedia: defaultMediaVisibility(this.props.status),
    statusId: undefined,
    height: undefined,
    isExpired: false
  }

  componentDidMount() {
    this._scheduleNextUpdate()
  }

  componentWillUnmount() {
    clearTimeout(this._timer)
  }

  _scheduleNextUpdate() {
    const { status } = this.props
    const { isExpired } = this.state
    if (!status || isExpired) return

    const expirationDate = status.get('expires_at')
    if (!expirationDate) return

    const msUntilExpiration =
      moment(expirationDate).valueOf() - moment().valueOf()
    this._timer = setTimeout(() => {
      this.setState({ isExpired: true })
    }, msUntilExpiration)
  }

  handleClick = () => {
    //
  }

  handleOnReply = () => {
    this.props.onReply(this.props.status)
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

  handleOnThreadMouseEnter = event => {
    if (event.target) {
      const threadKey = event.target.getAttribute('data-threader-indent')
      const elems = document.querySelectorAll(
        `[data-threader-indent="${threadKey}"]`
      )
      elems.forEach(elem => elem.classList.add('thread-hovering'))
    }
  }

  handleOnThreadMouseLeave = event => {
    if (event.target) {
      const threadKey = event.target.getAttribute('data-threader-indent')
      const elems = document.querySelectorAll(
        `[data-threader-indent="${threadKey}"]`
      )
      elems.forEach(elem => elem.classList.remove('thread-hovering'))
    }
  }

  handleOnThreadClick = event => {
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

  setMoreNode = c => {
    this.moreNode = c
  }

  setFloatingReactionsRef = c => {
    this.floatingReactionsRef = c
  }

  render() {
    const {
      indent,
      status,
      isHighlighted,
      isDetached,
      ancestorAccountId,
      commentLoadedDescendants,
      disableCanShow
    } = this.props
    const { isExpired } = this.state

    if (!status || isExpired) return null

    const commenterAccountId = status.getIn(['account', 'id'])

    //If account is spam and not mine, hide
    if (status.getIn(['account', 'is_spam']) && commenterAccountId !== me) {
      return null
    }

    const replyCount = status.get('direct_replies_count')
    const loadedReplyCount = !!commentLoadedDescendants
      ? commentLoadedDescendants.size
      : 0
    const unloadedReplyCount = replyCount - loadedReplyCount
    const reactionsMap = status.get('reactions_counts')

    const csd = disableCanShow ? {} : canShowComment(status)

    const style = {
      paddingLeft: `${indent * 38}px`
    }

    const containerClasses = CX({
      d: 1,
      px15: 1,
      pt5: !isDetached,
      pt10: isDetached,
      pb5: isDetached,
      borderBottom1PX: isDetached,
      borderColorSecondary: isDetached
    })

    const contentClasses = CX({
      d: 1,
      px10: 1,
      pt5: 1,
      pb10: 1,
      radiusSmall: 1,
      bgSubtle: !isHighlighted,
      highlightedComment: isHighlighted
    })

    const mediaSize = status.get('media_attachments').size
    const contentLength = status.get('content').length

    const innerContainerClasses = CX({
      d: 1,
      flexShrink1: 1,
      maxW100PC42PX: 1,
      minW252PX: 1,
      w100PC: mediaSize > 1 && contentLength >= 60,
      w75PC: mediaSize > 1 && contentLength < 60,
      w50PC: mediaSize === 1,
    })

    const innerContainerClassesLarge = CX({
      d: 1,
      flexShrink1: 1,
      maxW100PC42PX: 1,
      minW162PX: 1,
      w100PC: mediaSize > 0,
    })

    const AvatarComponent = !csd.label && !csd.nulled ? NavLink : Dummy
    const reaction = status.get('reaction')
    const likeBtnTitle = !!reaction
      ? reaction.get('name_past').charAt(0).toUpperCase() +
        reaction.get('name_past').slice(1)
      : !!status.get('favourited') && !!me
      ? 'Liked'
      : 'Like'

    return (
      <div
        className={containerClasses}
        data-comment={status.get('id')}
      >
        {indent > 0 && (
          <div
            className={[
              _s.d,
              _s.z3,
              _s.flexRow,
              _s.posAbs,
              _s.topNeg20PX,
              _s.left0,
              _s.bottom20PX,
              _s.aiCenter,
              _s.jcCenter
            ].join(' ')}
          >
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
                className={[
                  _s.d,
                  _s.w14PX,
                  _s.h100PC,
                  _s.outlineNone,
                  _s.bgTransparent,
                  _s.ml20,
                  _s.cursorPointer
                ].join(' ')}
              >
                <span
                  className={[
                    _s.d,
                    _s.w2PX,
                    _s.h100PC,
                    _s.mlAuto,
                    _s.mr2,
                    _s.bgSubtle
                  ].join(' ')}
                />
              </button>
            ))}
          </div>
        )}
        <div className={[_s.d, _s.mb5].join(' ')} style={style}>
          <div className={[_s.d, _s.flexRow].join(' ')}>
            <AvatarComponent
              to={
                !csd.label && !csd.nulled
                  ? `/${status.getIn(['account', 'acct'])}`
                  : undefined
              }
              title={
                !csd.label && !csd.nulled
                  ? status.getIn(['account', 'acct'])
                  : undefined
              }
              className={[_s.d, _s.mr10, _s.pt5].join(' ')}
            >
              {!csd.label && !csd.nulled && (
                <Avatar account={status.get('account')} size={30} />
              )}
              {!!csd.label && (
                <div
                  style={{ height: '30px', width: '30px' }}
                  className={[_s.d, _s.circle, _s.bgSecondary].join(' ')}
                />
              )}
            </AvatarComponent>

            <ResponsiveClassesComponent
              classNames={innerContainerClasses}
              classNamesLarge={innerContainerClassesLarge}
            >
              {csd.nulled && (
                <div className={contentClasses}>
                  <div className={[_s.d, _s.px5, _s.mt10, _s.mb5].join(' ')}>
                    <Text color="tertiary">{csd.label}</Text>
                  </div>
                </div>
              )}
              {!!csd.label && !csd.nulled && (
                <SensitiveMediaItem
                  noPadding
                  onClick={this.handleOnShowStatusAnyways}
                  message={csd.label}
                  btnTitle="View"
                />
              )}
              {!csd.label && !csd.nulled && (
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
                      visible={this.state.showMedia}
                      onToggleVisibility={this.handleToggleMediaVisibility}
                    />
                  </div>
                </div>
              )}

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
                  title={
                    status.get('reblogged') && !!me ? 'Unrepost' : 'Repost'
                  }
                  onClick={this.handleOnRepost}
                  isDisabled={!!csd.label && !status.get('reblogged')}
                />
                { !!me && (
                  <div ref={this.setMoreNode}>
                    <CommentButton
                      title="···"
                      onClick={this.handleOnOpenStatusOptions}
                      isDisabled={!!csd.label}
                    />
                  </div>
                )}
                {status.get('favourites_count') > 0 && (
                  <div
                    ref={this.setFloatingReactionsRef}
                    className={[
                      _s.d,
                      _s.circle,
                      _s.bgPrimary,
                      _s.aiCenter,
                      _s.jcCenter,
                      _s.h20PX,
                      _s.boxShadowBlock,
                      _s.posAbs,
                      _s.right0,
                      _s.topNeg25PX,
                      _s.px5,
                      _s.mrNeg5PX
                    ].join(' ')}
                  >
                    <ReactionsDisplayBlock
                      showIcons
                      showText
                      isBasicText
                      totalCount={status.get('favourites_count')}
                      reactions={reactionsMap}
                      onClick={this.handleOnOpenLikes}
                      iconSize="14px"
                      textSize="extraSmall"
                      textColor="tertiary"
                    />
                  </div>
                )}
              </div>
            </ResponsiveClassesComponent>
          </div>

          {replyCount > 0 && !isDetached && (
            <CommentSubReplyLoadMoreButton
              shouldShow={loadedReplyCount < unloadedReplyCount}
              replyCount={unloadedReplyCount}
              onClick={this.handleOnLoadMore}
            />
          )}
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
        backgroundColor="none"
        color="tertiary"
        className={[_s.px5, _s.bgSubtle_onHover, _s.py2, _s.mr5].join(' ')}
        onClick={onClick}
        isDisabled={isDisabled}
      >
        <Text
          size="extraSmall"
          color="inherit"
          weight="bold"
          className={_s.capitalize}
        >
          {title}
        </Text>
      </Button>
    )
  }
}

CommentButton.propTypes = {
  onClick: PropTypes.func,
  title: PropTypes.string,
  isDisabled: PropTypes.bool
}

const makeMapStateToProps = (state, props) => ({
  commentLoadedDescendants: state.getIn(['contexts', 'replies', props.id]),
  status: makeGetStatus()(state, props)
})

const mapDispatchToProps = dispatch => ({
  onReply(replyStatus) {
    if (!me) return dispatch(openModal(MODAL_UNAUTHORIZED))

    // the status goes into modalProps then ComposeModal
    dispatch(openModal(MODAL_COMPOSE, { replyStatus }))
  },
  onFavorite(status) {
    if (!me) return dispatch(openModal(MODAL_UNAUTHORIZED))

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
    if (!me) return dispatch(openModal(MODAL_UNAUTHORIZED))

    const alreadyReposted = status.get('reblogged')

    if (boostModal && !alreadyReposted) {
      dispatch(
        openModal(MODAL_BOOST, {
          status,
          onRepost: () => dispatch(repost(status))
        })
      )
    } else {
      if (alreadyReposted) {
        dispatch(unrepost(status))
      } else {
        dispatch(repost(status))
      }
    }
  },
  onOpenStatusOptions(targetRef, status) {
    dispatch(
      openPopover(POPOVER_STATUS_OPTIONS, {
        targetRef,
        statusId: status.get('id'),
        position: 'top'
      })
    )
  },
  onOpenLikes(status, targetRef) {
    if (!status) return

    const isMyStatus = status.getIn(['account', 'id']) === me
    if (!isMyStatus || !me) {
      dispatch(
        openPopover(POPOVER_STATUS_REACTIONS_COUNT, {
          targetRef,
          statusId: status.get('id')
        })
      )
    } else {
      dispatch(openModal(MODAL_STATUS_LIKES, { status }))
    }
  },
  onOpenReposts(status) {
    dispatch(openModal(MODAL_STATUS_REPOSTS, { status }))
  },
  onOpenQuotes(status) {
    dispatch(openModal(MODAL_STATUS_QUOTES, { status }))
  },
  onOpenStatusRevisionsPopover(status) {
    dispatch(openModal(MODAL_STATUS_REVISIONS, { status }))
  },
  onOpenMedia(media, index) {
    dispatch(openModal(MODAL_MEDIA, { media, index }))
  },
  onFetchComments(statusId) {
    dispatch(fetchComments(statusId, true, true))
  },
  onShowStatusAnyways(statusId) {
    dispatch(showStatusAnyways(statusId))
  }
})

Comment.propTypes = {
  indent: PropTypes.number,
  ancestorAccountId: PropTypes.string.isRequired,
  status: ImmutablePropTypes.map.isRequired,
  isDetached: PropTypes.bool,
  isIntersecting: PropTypes.bool,
  isHighlighted: PropTypes.bool,
  disableCanShow: PropTypes.bool,
  onReply: PropTypes.func.isRequired,
  onFavorite: PropTypes.func.isRequired,
  onRepost: PropTypes.func.isRequired,
  onOpenStatusOptions: PropTypes.func.isRequired,
  onOpenLikes: PropTypes.func.isRequired,
  onOpenReposts: PropTypes.func.isRequired,
  onOpenQuotes: PropTypes.func.isRequired,
  onOpenStatusRevisionsPopover: PropTypes.func.isRequired,
  onOpenMedia: PropTypes.func.isRequired,
  onShowStatusAnyways: PropTypes.func.isRequired
}

export default connect(makeMapStateToProps, mapDispatchToProps)(Comment)
