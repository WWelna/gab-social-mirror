import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { defineMessages, injectIntl } from 'react-intl'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { HotKeys } from 'react-hotkeys'
import { withRouter } from 'react-router-dom'
import moment from 'moment-mini'
import {
  CX,
  COMMENT_SORTING_TYPE_NEWEST,
  COMMENT_SORTING_TYPE_TOP,
} from '../constants'
import {
  me,
  displayMedia,
  displayShowAnyways,
} from '../initial_state'
import scheduleIdleTask from '../utils/schedule_idle_task'
import { canShowStatus } from '../utils/can_show'
import ComposeForm from '../features/compose/components/compose_form'
import ResponsiveClassesComponent from '../features/ui/util/responsive_classes_component'
import CommentPlaceholder from './placeholder/comment_placeholder'
import StatusContent from './status_content'
import StatusPrepend from './status_prepend'
import StatusActionBar from './status_action_bar'
import StatusMedia from './status_media'
import StatusHeader from './status_header'
import CommentList from './comment_list'
import SensitiveMediaItem from './sensitive_media_item'
import Button from './button'
import Text from './text'
import SortBlock from './sort_block'
import ColumnIndicator from './column_indicator'

// We use the component (and not the container) since we do not want
// to use the progress bar to show download progress
import Bundle from '../features/ui/util/bundle'

const messages = defineMessages({
  sortBy: { id: 'comment_sort.title', defaultMessage: 'Sort by' },
  oldest: { id: 'comment_sort.oldest', defaultMessage: 'Oldest' },
  newest: { id: 'comment_sort.newest', defaultMessage: 'Recent' },
  top: { id: 'comment_sort.top', defaultMessage: 'Most Liked' },
})

export const textForScreenReader = (intl, status, rebloggedByText = false) => {
  if (!intl || !status) return ''

  const displayName = status.getIn(['account', 'display_name'])

  // : todo :
  const values = [
    // displayName.length === 0 ? status.getIn(['account', 'acct']).split('@')[0] : displayName,
    // status.get('spoiler_text') && status.get('hidden')
    //   ? status.get('spoiler_text')
    //   : status.get('search_index').slice(status.get('spoiler_text').length),
    // intl.formatDate(status.get('created_at'), { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
    // `@${status.getIn(['account', 'acct'])}`,
  ]

  if (rebloggedByText) {
    values.push(rebloggedByText)
  }

  return values.join(', ')
}

export const defaultMediaVisibility = (status) => {
  if (!status) return undefined

  if (status.get('reblog', null) !== null && typeof status.get('reblog') === 'object') {
    status = status.get('reblog')
  }

  return (displayMedia !== 'hide_all' && !status.get('sensitive')) || displayMedia === 'show_all'
}

class Status extends ImmutablePureComponent {

  state = {
    showMedia: defaultMediaVisibility(this.props.status),
    statusId: undefined,
    isExpired: false,
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

    const msUntilExpiration = moment(expirationDate).valueOf() - moment().valueOf()
    this._timer = setTimeout(() => {
      this.setState({ isExpired: true })
    }, msUntilExpiration);
  }

  handleToggleMediaVisibility = () => {
    this.setState({ showMedia: !this.state.showMedia })
  }

  handleClick = () => {
    if (this.props.onClick) {
      this.props.onClick()
      return
    }

    this.props.history.push(
      `/${this._properStatus().getIn(['account', 'acct'])}/posts/${this._properStatus().get('id')}`
    )
  }

  handleExpandClick = e => {
    if (e.button === 0) {
      this.props.history.push(
        `/${this._properStatus().getIn(['account', 'acct'])}/posts/${this._properStatus().get('id')}`
      )
    }
  }

  handleOnOpenStatusModal = (status) => {
    if (!status) return
    this.props.onOpenStatusModal(status.get('id'))
  }

  handleExpandedToggle = () => {
    this.props.onToggleHidden(this._properStatus())
  }

  handleOpenVideo = (media, startTime) => {
    this.props.onOpenVideo(media, startTime)
  }

  handleHotkeyReply = (e) => {
    e.preventDefault()
    this.props.onReply(this._properStatus())
  }

  handleOnReply = (status) => {
    this.props.onReply(status || this._properStatus())
  }

  handleOnQuote = status => this.props.onQuote(status || this._properStatus())

  handleHotkeyFavorite = () => {
    this.props.onFavorite(this._properStatus())
  }

  handleHotkeyRepost = e => {
    this.props.onQuote(this._properStatus(), e)
  }

  handleHotkeyMention = e => {
    e.preventDefault()
    this.props.onMention(this._properStatus().get('account'))
  }

  handleHotkeyOpen = () => {
    this.props.history.push(
      `/${this._properStatus().getIn(['account', 'acct'])}/posts/${this._properStatus().get('id')}`
    )
  }

  handleHotkeyOpenProfile = () => {
    this.props.history.push(`/${this._properStatus().getIn(['account', 'acct'])}`)
  }

  handleHotkeyMoveUp = e => {
    this.props.onMoveUp(this.props.status.get('id'), e.target.getAttribute('data-featured'))
  }

  handleHotkeyMoveDown = e => {
    this.props.onMoveDown(this.props.status.get('id'), e.target.getAttribute('data-featured'))
  }

  handleHotkeyToggleHidden = () => {
    this.props.onToggleHidden(this._properStatus())
  }

  handleHotkeyToggleSensitive = () => {
    this.handleToggleMediaVisibility()
  }

  handleOnExpandComments = () => {
    const { status, ancestorStatus } = this.props
    const statusId = !!ancestorStatus ? ancestorStatus.get('id') : status.get('id')

    this.props.onExpandComments(statusId)
  }

  handleOnShowStatusAnyways = (e) => {
    e.preventDefault()
    // const status = this._properStatus()
    this.props.onShowStatusAnyways(this.props.status.get('id'))
    return false
  }

  _properStatus() {
    const { status, ancestorStatus } = this.props

    if (ancestorStatus) {
      return ancestorStatus
    }

    if (status.get('reblog', null) !== null && typeof status.get('reblog') === 'object') {
      return status.get('reblog')
    }

    return status
  }

  handleOnCommentSortOpen = (btn) => {
    const { status } = this.props
    if (!status) return

    this.props.onCommentSortOpen(btn, status.get('id'))
  }

  handleRef = (c) => {
    this.node = c
  }

  render() {
    const {
      intl,
      id,
      isFeatured,
      isPinnedInGroup,
      isPromoted,
      isChild,
      quoteParent,
      isQuoteHidden,
      isHidden,
      isNotification,
      descendantsIds,
      commentsLimited,
      ancestorStatus,
      isComment,
      contextType,
      isComposeModalOpen,
      commentSortingType,
      onOpenProModal,
      isDeckConnected,
      isReacting,
      hoveringReactionId,
      reactionPopoverOpenForStatusId,
      statusId,
      loadedDirectDescendantsCount,
      next,
      scrollKey,
      showActionBar = true,
      showEllipsis = true,
      showSpam = false,
      disableCanShow = false,
      highlightStatusId,
      isLoading,
      expanded,
    } = this.props
    let { status } = this.props
    const { isExpired } = this.state

    if (!status || isExpired) {
      return null
    }

    //If account is spam and not mine, hide
    if (!showSpam && status.getIn(['account', 'is_spam']) && status.getIn(['account', 'id']) !== me) {
      return null
    }

    if ((isComment && !isFeatured) && !ancestorStatus && !isChild) {
      // Wait to load...
      // return <StatusPlaceholder />
      if (contextType === 'feature') {
        return <ColumnIndicator type='loading' />
      }
      return null
    }

    const csd = disableCanShow ? {} : canShowStatus(status, {
      isChild,
      quoteParent,
      scrollKey,
      contextType,
      ancestorStatus,
    })

    if (csd.canShow === false) {
      return null
    }

    let reblogContent, rebloggedByText = null

    if (ancestorStatus) {
      status = ancestorStatus
    } else {
      if (status.get('reblog', null) !== null) {
        rebloggedByText = intl.formatMessage(
          { id: 'status.reposted_by', defaultMessage: '{name} reposted' },
          { name: status.getIn(['account', 'acct']) }
        )
        reblogContent = status.get('contentHtml')
        status = status.get('reblog')
      }
    }

    let sortByTitle = intl.formatMessage(messages.oldest)
    if (commentSortingType === COMMENT_SORTING_TYPE_NEWEST) {
      sortByTitle = intl.formatMessage(messages.newest)
    } else if (commentSortingType === COMMENT_SORTING_TYPE_TOP) {
      sortByTitle = intl.formatMessage(messages.top)
    }

    const handlers = {
      reply: this.handleHotkeyReply,
      favorite: this.handleHotkeyFavorite,
      repost: this.handleHotkeyRepost,
      mention: this.handleHotkeyMention,
      open: this.handleHotkeyOpen,
      openProfile: this.handleHotkeyOpenProfile,
      moveUp: this.handleHotkeyMoveUp,
      moveDown: this.handleHotkeyMoveDown,
      toggleHidden: this.handleHotkeyToggleHidden,
      toggleSensitive: this.handleHotkeyToggleSensitive,
    }

    const parentClasses = CX({
      pb15: !isChild && !isDeckConnected,
    })

    const containerClasses = CX({
      d: 1,
      radiusSmall: !isChild,
      bgPrimary: !isChild,
      boxShadowBlock: !isChild,
      pb15: !showActionBar,
    })

    const containerClassesXS = CX({
      d: 1,
      bgPrimary: !isChild,
      boxShadowBlock: !isChild,
      borderTop1PX: !isChild,
      borderColorSecondary: !isChild,
    })

    const innerContainerClasses = CX({
      d: 1,
      overflowHidden: 1,
      radiusSmall: isChild,
      borderColorSecondary: isChild,
      border1PX: isChild,
      pb10: isChild && (status.get('media_attachments').size === 0 && !isNotification) || status.get('sensitive'),
      pb5: isChild && status.get('media_attachments').size > 1 && !isNotification,
      pt10: csd.nulled && isChild,
      cursorNotAllowed: isChild && csd.nulled,
      cursorPointer: isChild && !csd.nulled,
      bgSubtle_onHover: isChild && !csd.nulled,
    })

    // in group moderation the ellipsis are hidden and it's not clickable
    const isClickable = showEllipsis

    return (
      <HotKeys handlers={handlers} className={_s.outlineNone}>
        <div className={parentClasses}>
          <ResponsiveClassesComponent
            classNames={containerClasses}
            classNamesXS={containerClassesXS}
          >
            <div
              className={[_s.d, _s.outlineNone].join(' ')}
              tabIndex={this.props.isMuted ? null : 0}
              data-featured={(isFeatured || isPinnedInGroup) ? 'true' : null}
              aria-label={!!csd.label ? csd.label : textForScreenReader(intl, status, rebloggedByText)}
              ref={this.handleRef}
              onClick={(isChild && !csd.label) && !isNotification && isClickable ? this.handleClick : undefined}
            >
              <div className={innerContainerClasses}>

                <div data-id={status.get('id')}>

                  <StatusPrepend
                    status={this.props.status}
                    isPromoted={isPromoted}
                    isFeatured={isFeatured}
                    isPinnedInGroup={isPinnedInGroup}
                    isComment={isComment && !isChild}
                    onOpenProModal={onOpenProModal}
                  />

                  {
                    !(csd.nulled && isChild) &&
                    <StatusHeader
                      nulled={!!csd.label}
                      status={status}
                      reduced={isChild && !isNotification}
                      isCompact={isDeckConnected}
                      onOpenStatusModal={this.handleOnOpenStatusModal}
                      showEllipsis={showEllipsis}
                    />
                  }

                  {
                    (csd.nulled && !!csd.label) &&
                    <div className={[_s.d, _s.px15].join(' ')}>
                      <div className={[_s.d, _s.px15, _s.py15, _s.bgSubtle, _s.radiusSmall].join(' ')}>
                        <Text color='tertiary'>{csd.label}</Text>
                      </div>
                    </div>
                  }

                  {
                    (!csd.nulled && !!csd.label) &&
                    <div className={[_s.d, _s.px15].join(' ')}>
                      <SensitiveMediaItem
                        noPadding
                        onClick={this.handleOnShowStatusAnyways}
                        message={csd.label}
                        btnTitle='View'
                      />
                    </div>
                  }

                  {
                    (!csd.label && !csd.nulled) &&
                    <div className={_s.d}>
                      <StatusContent
                        status={status}
                        reblogContent={reblogContent}
                        onClick={isClickable && !expanded ? this.handleClick : undefined}
                        expanded={!status.get('hidden')}
                        onExpandedToggle={this.handleExpandedToggle}
                        collapsable={contextType !== 'feature'}
                      />
                    </div>
                  }

                  {
                    (!csd.label && !csd.nulled) &&
                    <StatusMedia
                      isChild={isChild || isDeckConnected}
                      isComposeModalOpen={isComposeModalOpen}
                      status={status}
                      onOpenMedia={this.props.onOpenMedia}
                      visible={this.state.showMedia}
                      onToggleVisibility={this.handleToggleMediaVisibility}
                      onOpenVideo={this.handleOpenVideo}
                    />
                  }

                  {
                    (!!status.get('quote') || status.get('has_quote')) && !isChild && !isQuoteHidden && !csd.label &&
                    <div className={[_s.d, _s.mt10, _s.px10].join(' ')}>
                      {
                        !!status.get('quoted_status') &&
                        <Status
                          isChild
                          quoteParent={status}
                          status={status.get('quoted_status')}
                          contextType={contextType}
                          scrollKey={scrollKey}
                          intl={intl}
                          history={this.props.history}
                          onShowStatusAnyways={this.props.onShowStatusAnyways}
                        />
                      }
                      {
                        !status.get('quoted_status') &&
                        <div className={[_s.d, _s.border1PX, _s.bgSubtle, _s.radiusSmall, _s.py15, _s.px15, _s.borderColorSecondary].join(' ')}>
                          <Text color='tertiary' size='medium'>The quoted status is unavailable.</Text>
                        </div>
                      }
                    </div>
                  }

                  {
                    (showActionBar && (!isChild || isNotification)) &&
                    <StatusActionBar
                      nulled={!!csd.label}
                      status={status}
                      onFavorite={this.props.onFavorite}
                      onReply={this.handleOnReply}
                      onRepost={this.props.onRepost}
                      onShare={this.props.onShare}
                      onOpenLikes={this.props.onOpenLikes}
                      onOpenReposts={this.props.onOpenReposts}
                      onOpenQuotes={this.props.onOpenQuotes}
                      onQuote={this.handleOnQuote}
                      isCompact={isDeckConnected}
                      isReacting={isReacting}
                      hoveringReactionId={hoveringReactionId}
                      reactionPopoverOpenForStatusId={reactionPopoverOpenForStatusId}
                      onOpenStatusModal={this.handleOnOpenStatusModal}
                      feature={contextType == 'feature' || isNotification}
                    />
                  }

                </div>
              </div>
            </div>
          </ResponsiveClassesComponent>

          { // : overlay to block clicks when compose is open :
            contextType === 'compose' &&
            <div className={[_s.d, _s.posAbs, _s.bgTransparent, _s.top0, _s.right0, _s.bottom0, _s.left0].join(' ')} />
          }

        </div>
        { 
          !isChild && !isNotification && !commentsLimited &&
          <div className={parentClasses}>
            <ResponsiveClassesComponent
              classNames={containerClasses}
              classNamesXS={containerClassesXS}
            >
              <div className={innerContainerClasses}>
                <div data-id={status.get('id')}>

                {
                  contextType == 'feature' &&
                  <ComposeForm
                    key={status.get('id')}
                    composerId={`reply-${status.get('id')}`}
                    replyToId={status.get('id')}
                    feature={true}
                    formLocation="status"
                  />
                }
                
                {
                  status.get('direct_replies_count') > 0 && !isChild && !isNotification && !commentsLimited &&
                  <React.Fragment>
                    <div className={[_s.d, _s.mr10, _s.ml10, _s.borderColorSecondary, _s.borderBottom1PX].join(' ')} />

                    <SortBlock
                      value={sortByTitle}
                      onClickValue={this.handleOnCommentSortOpen}
                    />

                    {
                      descendantsIds.size === 0 &&
                      <React.Fragment>
                        <CommentPlaceholder />
                        <CommentPlaceholder />
                        <CommentPlaceholder />
                      </React.Fragment>
                    }
                    
                    {/* only show comments to blocked by if is mentioned */}
                    {
                      descendantsIds.size > 0 &&
                      <CommentList
                        totalDirectDescendants={status.get('direct_replies_count')}
                        ancestorAccountId={status.getIn(['account', 'id'])}
                        descendants={descendantsIds}
                        loadedDirectDescendantsCount={loadedDirectDescendantsCount}
                        onViewComments={this.handleOnExpandComments}
                        ancestorStatusId={status.get('id')}
                        highlightStatusId={highlightStatusId}
                        isLoading={isLoading}
                      />
                    }
                  </React.Fragment>
                }


                </div>
              </div>

            </ResponsiveClassesComponent>
          </div>
        }
      </HotKeys>
    )
  }

}

Status.propTypes = {
  intl: PropTypes.object.isRequired,
  status: ImmutablePropTypes.map,
  descendantsIds: ImmutablePropTypes.list,
  ancestorStatus: ImmutablePropTypes.map,
  isNotification: PropTypes.bool,
  isChild: PropTypes.bool,
  isQuoteHidden: PropTypes.bool,
  isPromoted: PropTypes.bool,
  isFeatured: PropTypes.bool,
  isPinnedInGroup: PropTypes.bool,
  isMuted: PropTypes.bool,
  isHidden: PropTypes.bool,
  isIntersecting: PropTypes.bool,
  isComment: PropTypes.bool,
  onClick: PropTypes.func,
  onReply: PropTypes.func,
  onRepost: PropTypes.func,
  onQuote: PropTypes.func,
  onFavorite: PropTypes.func,
  onMention: PropTypes.func,
  onOpenMedia: PropTypes.func,
  onOpenProModal: PropTypes.func,
  onOpenVideo: PropTypes.func,
  onToggleHidden: PropTypes.func,
  onShare: PropTypes.func,
  onMoveUp: PropTypes.func,
  onMoveDown: PropTypes.func,
  onFetchComments: PropTypes.func,
  onFetchContext: PropTypes.func,
  contextType: PropTypes.string,
  commentsLimited: PropTypes.bool,
  onOpenLikes: PropTypes.func,
  onOpenReposts: PropTypes.func,
  onOpenQuotes: PropTypes.func,
  onCommentSortOpen: PropTypes.func,
  isComposeModalOpen: PropTypes.bool,
  commentSortingType: PropTypes.string,
  scrollKey: PropTypes.string,
  onShowStatusAnyways: PropTypes.func,
  showActionBar: PropTypes.bool,
  showEllipsis: PropTypes.bool,
  showSpam: PropTypes.bool,
  disableCanShow: PropTypes.bool,
  hoveringReactionId: PropTypes.string,
  reactionPopoverOpenForStatusId: PropTypes.string,
  highlightStatusId: PropTypes.string,
  isLoading: PropTypes.bool,
  expanded: PropTypes.bool,
}

export default withRouter(injectIntl(Status))
