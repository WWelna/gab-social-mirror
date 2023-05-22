import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { defineMessages, injectIntl } from 'react-intl'
import { me, allReactions } from '../initial_state'
import Text from './text'
import Button from './button'
import StatusActionBarItem from './status_action_bar_item'
import ReactionsDisplayBlock from './reactions_display_block'
import {
  CX,
  BREAKPOINT_EXTRA_SMALL,
} from '../constants'
import { getWindowDimension } from '../utils/is_mobile'
import { shortNumberFormat } from '../utils/numbers'

class StatusActionBar extends ImmutablePureComponent {

  // updateOnProps = ['status']

  handleShareClick = () => {
    this.props.onShare(this.shareButton, this.props.status)
  }

  handleReplyClick = (e) => {
    this.props.onReply(this.props.status, null, true)
    e.preventDefault()
  }

  handleFavoriteClick = () => {
    this.props.onFavorite(this.props.status)
  }

  handleRepostClick = () => {
    this.props.onRepost(this.props.status)
  }

  handleQuoteClick = () => {
    this.props.onQuote(this.props.status)
  }

  handleOnOpenStatusModal = () => {
    this.props.onOpenStatusModal(this.props.status)
  }

  openLikesList = () => {
    this.props.onOpenLikes(this.props.status, this.likeButton)
  }

  openRepostsList = () => {
    this.props.onOpenReposts(this.props.status)
  }

  openQuotesList = () => {
    this.props.onOpenQuotes(this.props.status)
  }

  setShareButton = (n) => {
    this.shareButton = n
  }

  setLikeButton = (n) => {
    this.likeButton = n
  }

  render() {
    const {
      status,
      intl,
      nulled,
      isCompact,
      feature,
      isReacting,
      hoveringReactionId,
      reactionPopoverOpenForStatusId,
    } = this.props

    const publicStatus = ['public', 'unlisted'].includes(status.get('visibility'))

    const directReplyCount = status.get('direct_replies_count')
    const replyCount = status.get('replies_count') || directReplyCount
    const repostCount = status.get('reblogs_count')
    const favoriteCount = status.get('favourites_count')
    const quotesCount = status.get('quotes_count')
    const reactionsMap = status.get('reactions_counts')
    const replyLabel = replyCount === 1 ? 'reply' : 'replies'
    const repostLabel = repostCount === 1 ? 'repost' : 'reposts'
    const quotesLabel = quotesCount === 1 ? 'quote' : 'quotes'

    const hasInteractions = favoriteCount > 0 || replyCount > 0 || repostCount > 0 || quotesCount > 0
    const hasLots = favoriteCount > 99 && replyCount > 99 && repostCount > 99 && quotesCount > 99
    const shouldCondense = (
      !!status.get('card') ||
      status.get('media_attachments').size > 0 ||
      !!status.get('quote')
    ) && !hasInteractions

    const statusUrl = `/${status.getIn(['account', 'acct'])}/posts/${status.get('id')}`
    const isMyStatus = status.getIn(['account', 'id']) === me

    const initialState = getWindowDimension()
    const width = initialState.width
    const isXS = width <= BREAKPOINT_EXTRA_SMALL
    const isTiny = width <= 400
    const maxCount = isTiny ? (hasLots ? 1 : 2) : 3

    const innerContainerClasses = CX({
      d: 1,
      flexRow: 1,
      w100PC: 1,
      borderColorSecondary: !shouldCondense || isCompact,
      borderBottom1PX: isCompact,
    })

    const interactionBtnClasses = CX({
      d: 1,
      text: 1,
      fw400: 1,
      noUnderline: 1,
      bgTransparent: 1,
      outlineNone: 1,
      py5: 1,
      ml10: !isTiny,
      ml7: isTiny && !hasLots,
      ml5: isTiny && hasLots,
      cursorPointer: !nulled,
      underline_onHover: !nulled,
      cursorNotAllowed: nulled,
    })

    const interactionContainerClasses = CX({
      d: 1,
      flexRow: 1,
      aiEnd: 1,
      px15: !(isTiny && hasLots),
      px10: (isTiny && hasLots),
      minHeight26px: hasInteractions,
      minHeight16px: !hasInteractions,
    })

    const isReactingOnThisStatus = isReacting && !!status && reactionPopoverOpenForStatusId === status.get('id')
    const reactionHelperText = !!hoveringReactionId ? 'Slide Finger Across' : 'Release to Cancel'

    const barItemContainerClasses = CX({
      d: 1,
      flexRow: 1,
      py2: 1,
      w100PC: 1,
      h40PX: 1,
      visibilityHidden: isReactingOnThisStatus && isXS,
    })

    const myReaction = status.get('reaction')

    return (
      <div className={[_s.d, _s.mt5, _s.pb2].join(' ')}>
        {
          <div className={interactionContainerClasses}>
            <div className={[_s.mrAuto, _s.py5].join(' ')}>
              { favoriteCount > 0 &&
                <ReactionsDisplayBlock
                  showIcons
                  showText
                  isBasicText
                  iconSize='16px'
                  totalCount={favoriteCount}
                  reactions={reactionsMap}
                  onClick={this.openLikesList}
                  isDisabled={nulled}
                  maxCount={maxCount}
                />
              }
            </div>
            {
              replyCount > 0 &&
              <Button
                noClasses
                isDisabled={nulled}
                className={interactionBtnClasses}
                to={statusUrl}
              >
                <Text color='secondary' size='small'>
                  {shortNumberFormat(replyCount)}
                  {' '}
                  {replyLabel}
                </Text>
              </Button>
            }
            {
              repostCount > 0 &&
              <button
                className={interactionBtnClasses}
                onClick={this.openRepostsList}
                disabled={nulled}
              >
                <Text color='secondary' size='small'>
                  {shortNumberFormat(repostCount)}
                  {' '}
                  {repostLabel}
                </Text>
              </button>
            }
            {
              quotesCount > 0 &&
              <button
                className={interactionBtnClasses}
                onClick={this.openQuotesList}
                disabled={nulled}
              >
                <Text color='secondary' size='small'>
                  {shortNumberFormat(quotesCount)}
                  {' '}
                  {quotesLabel}
                </Text>
              </button>
            }

          </div>
        }
        <div className={innerContainerClasses}>
          {
            (isXS && isReactingOnThisStatus) &&
            <div className={[_s.d, _s.flexRow, _s.aiCenter, _s.jcCenter, _s.py2, _s.w100PC, _s.h40PX, _s.posAbs, _s.top0, _s.left0, _s.right0, _s.bottom0].join(' ')}>
              <Text size='medium' weight='medium' color='secondary'>
                {reactionHelperText}
              </Text>
            </div>
          }
          <div className={barItemContainerClasses}>
            <StatusActionBarItem
              isLike
              statusId={status.get('id')}
              icon={!!status.get('favourited') && !!me ? 'liked' : 'like'}
              reactionTypeId={!!myReaction ? myReaction.get('id') : undefined}
              title={
                !!myReaction ? myReaction.get('name_past').charAt(0).toUpperCase() + myReaction.get('name_past').slice(1) :
                !!status.get('favourited') && !!me ?
                'Liked' : intl.formatMessage(messages.like)
              }
              active={!!status.get('favourited') && !!me}
              onClick={this.handleFavoriteClick}
              isCompact={isCompact}
              disabled={nulled && !status.get('favourited')}
              buttonRef={this.setLikeButton}
            />
            <StatusActionBarItem
              title={intl.formatMessage(messages.comment)}
              icon='comment'
              to={statusUrl}
              onClick={this.handleReplyClick}
              isCompact={isCompact}
              disabled={nulled}
            />
            <StatusActionBarItem
              title={intl.formatMessage(messages.repost)}
              altTitle={!publicStatus ? intl.formatMessage(messages.cannot_repost) : ''}
              icon={!publicStatus ? 'lock' : 'repost'}
              disabled={(!publicStatus || nulled) && !status.get('reblogged')}
              active={!!status.get('reblogged') && !!me}
              onClick={this.handleRepostClick}
              isCompact={isCompact}
            />
            <StatusActionBarItem
              title={intl.formatMessage(messages.quote)}
              altTitle={!publicStatus ? intl.formatMessage(messages.cannot_repost) : ''}
              icon={!publicStatus ? 'lock' : 'quote'}
              disabled={!publicStatus || nulled}
              onClick={this.handleQuoteClick}
              isCompact={isCompact}
            />
            <StatusActionBarItem
              title={intl.formatMessage(messages.share)}
              altTitle={intl.formatMessage(messages.share)}
              buttonRef={this.setShareButton}
              icon='share'
              onClick={this.handleShareClick}
              isCompact={isCompact}
              disabled={nulled}
            />
          </div>
        </div>
      </div>
    )
  }

}

const messages = defineMessages({
  share: { id: 'status.share', defaultMessage: 'Share' },
  comment: { id: 'status.comment', defaultMessage: 'Comment' },
  quote: { id: 'status.quote', defaultMessage: 'Quote' },
  repost: { id: 'status.repost', defaultMessage: 'Repost' },
  cannot_repost: { id: 'status.cannot_repost', defaultMessage: 'This post cannot be reposted' },
  like: { id: 'status.like', defaultMessage: 'Like' },
  // repostsLabel: { id: 'reposts.label', defaultMessage: '{number, plural, one {# repost} other {# reposts}}' },
  // quotesLabel: { id: 'quotes.label', defaultMessage: '{number, plural, one {# quote} other {# quotes}}' },
  // commentsLabel: { id: 'comments.label', defaultMessage: '{number, plural, one {# comment} other {# comments}}' },
})

StatusActionBar.propTypes = {
  intl: PropTypes.object.isRequired,
  onFavorite: PropTypes.func.isRequired,
  onQuote: PropTypes.func.isRequired,
  onReply: PropTypes.func.isRequired,
  onRepost: PropTypes.func.isRequired,
  onShare: PropTypes.func.isRequired,
  status: ImmutablePropTypes.map.isRequired,
  onOpenLikes: PropTypes.func.isRequired,
  onOpenReposts: PropTypes.func.isRequired,
  onOpenQuotes: PropTypes.func.isRequired,
  onOpenStatusModal: PropTypes.func.isRequired,
  isCompact: PropTypes.bool,
  isReacting: PropTypes.bool,
  hoveringReactionId: PropTypes.string,
  reactionPopoverOpenForStatusId: PropTypes.string,
  nulled: PropTypes.bool,
  feature: PropTypes.bool,
}

export default injectIntl(StatusActionBar)
