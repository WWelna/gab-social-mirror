import React from 'react'
import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'
import { defineMessages, injectIntl } from 'react-intl'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import moment from 'moment-mini'
import { me, isStaff } from '../initial_state'
import Button from './button'
import DisplayName from './display_name'
import DotTextSeperator from './dot_text_seperator'
import Icon from './icon'
import RelativeTimestamp from './relative_timestamp'
import ReactionsDisplayBlock from './reactions_display_block'
import Text from './text'
import { ACCOUNT_IS_PARODY_DESCRIPTION } from '../constants'

class CommentHeader extends ImmutablePureComponent {

  openLikesList = () => {
    this.props.onOpenLikes(this.props.status, this.likeButton)
  }

  openRepostsList = () => {
    this.props.onOpenReposts(this.props.status)
  }

  openQuotesList = () => {
    this.props.onOpenQuotes(this.props.status)
  }


  openRevisions = () => {
    this.props.onOpenRevisions(this.props.status)
  }
  
  setLikeButton = (n) => {
    this.likeButton = n
  }

  render() {
    const {
      intl,
      status,
      ancestorAccountId,
    } = this.props

    if (!status) return null

    const repostCount = status.get('reblogs_count')
    const favoriteCount = status.get('favourites_count')
    const quotesCount = status.get('quotes_count')

    const statusUrl = `/${status.getIn(['account', 'acct'])}/posts/${status.get('id')}`;
    const isOwner = ancestorAccountId === status.getIn(['account', 'id'])
    const myComment = status.getIn(['account', 'id']) === me
    const reactionsMap = status.get('reactions_counts')

    const expirationDate = status.get('expires_at')
    let timeUntilExpiration
    if (!!expirationDate) {
      timeUntilExpiration = moment(expirationDate).fromNow()
    }

    return (
      <div className={[_s.d, _s.aiStart, _s.py2, _s.maxW100PC, _s.flexGrow1].join(' ')}>

        <div className={[_s.d, _s.flexRow, _s.flexWrap, _s.overflowHidden, _s.w100PC, _s.maxW100PC, _s.aiCenter].join(' ')}>
          <NavLink
            className={[_s.d, _s.flexRow, _s.aiStart, _s.noUnderline].join(' ')}
            to={`/${status.getIn(['account', 'acct'])}`}
            title={status.getIn(['account', 'acct'])}
          >
            <DisplayName
              account={status.get('account')}
              isSmall
              isComment
            />
          </NavLink>

          {
            isOwner &&
            <div className={[_s.d, _s.aiCenter, _s.ml5].join(' ')}>
              <span className={_s.visiblyHidden}>
                {intl.formatMessage(messages.original)}
              </span>
              <Icon id='mic' size='10px' className={_s.cBrand} />
            </div>
          }

          {
            status.getIn(['account', 'is_parody']) &&
            <>
              <Text size='small' color='tertiary' className={[_s.ml5, _s.mr5].join(' ')}>·</Text>
              <Button
                isText
                underlineOnHover
                backgroundColor='none'
                color='none'
                tooltip={ACCOUNT_IS_PARODY_DESCRIPTION}
              >
                <Text size='small' color='tertiary'>Parody</Text>
              </Button>
            </>
          }


          {
            !!status.get('expires_at') &&
            <React.Fragment>
              <DotTextSeperator />
              <span title={intl.formatMessage(messages.expirationMessage, {
                time: timeUntilExpiration,
              })} className={[_s.d, _s.displayInline, _s.ml5].join(' ')}>
                <Icon id='stopwatch' size='13px' className={[_s.d, _s.cTertiary].join(' ')} />
              </span>
            </React.Fragment>
          }
          
          {
            !!status.get('status_context') &&
            <React.Fragment>
              <DotTextSeperator />
              <Button
                isText
                underlineOnHover
                backgroundColor='primary'
                color='tertiary'
                to={`/timeline/context/${status.getIn(['status_context', 'id'])}`}
                className={[_s.ml5, _s.radiusSmall].join(' ')}
              >
                <Text size='extraSmall' color='inherit' className={_s.px5}>
                  {status.getIn(['status_context', 'name'])}
                </Text>
              </Button>
            </React.Fragment>
          }

          {
            !!status.get('group') &&
            <React.Fragment>
              <DotTextSeperator />
              <Button
                isText
                underlineOnHover
                backgroundColor='none'
                color='tertiary'
                to={`/groups/${status.getIn(['group', 'id'])}`}
                className={_s.ml5}
              >
                <Text size='extraSmall' color='inherit'>
                  {status.getIn(['group', 'title'])}
                </Text>
              </Button>
            </React.Fragment>
          }

          {
            status.get('revised_at') !== null &&
            <React.Fragment>
              <DotTextSeperator />
              <Button
                isText
                underlineOnHover
                backgroundColor='none'
                color='tertiary'
                onClick={this.openRevisions}
                className={_s.ml5}
              >
                <Text size='extraSmall' color='inherit'>
                  {intl.formatMessage(messages.edited)}
                </Text>
              </Button>
            </React.Fragment>
          }

          {
            repostCount > 0 &&
            <React.Fragment>
              <DotTextSeperator />
                <Button
                  isText
                  underlineOnHover
                  backgroundColor='none'
                  color='tertiary'
                  className={_s.ml5}
                  onClick={this.openRepostsList}
                >
                <Text size='extraSmall' color='inherit'>
                  {intl.formatMessage(messages.repostsLabel, {
                    number: repostCount,
                  })}
                </Text>
              </Button>
            </React.Fragment>
          }

          {
            quotesCount > 0 &&
            <React.Fragment>
              <DotTextSeperator />
                <Button
                  isText
                  underlineOnHover
                  backgroundColor='none'
                  color='tertiary'
                  className={_s.ml5}
                  onClick={this.openQuotesList}
                >
                <Text size='extraSmall' color='inherit'>
                  {intl.formatMessage(messages.quotesLabel, {
                    number: quotesCount,
                  })}
                </Text>
              </Button>
            </React.Fragment>
          }

          <DotTextSeperator />

          <Button
            isText
            underlineOnHover
            backgroundColor='none'
            color='tertiary'
            to={statusUrl}
            className={_s.ml5}
          >
            <Text size='extraSmall' color='inherit'>
              <RelativeTimestamp timestamp={status.get('created_at')} />
            </Text>
          </Button>

        </div>
      </div>
    )
  }

}

const messages = defineMessages({
  edited: { id: 'status.edited', defaultMessage: 'Edited' },
  likesLabel: { id: 'likes.label', defaultMessage: '{number, plural, one {# like} other {# likes}}' },
  repostsLabel: { id: 'reposts.label', defaultMessage: '{number, plural, one {# repost} other {# reposts}}' },
  quotesLabel: { id: 'quotes.label', defaultMessage: '{number, plural, one {# quote} other {# quotes}}' },
  original: { id: 'original_gabber', defaultMessage: 'Original Gabber' },
  expirationMessage: { id: 'status.expiration_message', defaultMessage: 'This status expires {time}' },
})

CommentHeader.propTypes = {
  intl: PropTypes.object.isRequired,
  ancestorAccountId: PropTypes.string.isRequired,
  status: ImmutablePropTypes.map.isRequired,
  onOpenLikes: PropTypes.func.isRequired,
  onOpenReposts: PropTypes.func.isRequired,
  onOpenQuotes: PropTypes.func.isRequired,
  onOpenRevisions: PropTypes.func.isRequired,
}

export default injectIntl(CommentHeader)