import React from 'react'
import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'
import { injectIntl, defineMessages } from 'react-intl'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { me } from '../initial_state' 
import {
  CX,
  BREAKPOINT_EXTRA_SMALL,
} from '../constants' 
import Responsive from '../features/ui/util/responsive_component'
import ResponsiveClassesComponent from '../features/ui/util/responsive_classes_component'
import StatusContainer from '../containers/status_container'
import Avatar from './avatar'
import Icon from './icon'
import Text from './text'
import DotTextSeperator from './dot_text_seperator'
import RelativeTimestamp from './relative_timestamp'
import DisplayName from './display_name'
import Dummy from './dummy'
import ReactionTypeImage from './reaction_type_image'

class Notification extends ImmutablePureComponent {

  // stop react-router-dom from intercepting and history.push
  cancelRouter = evt => {
    evt.stopPropagation()
    return true
  }

  render() {
    const {
      intl,
      accounts,
      createdAt,
      reactionType,
      type,
      status,
      isHidden,
      isUnread,
      isDeckConnected,
      group_id,
      group_name,
      approved,
      rejected,
      removed,
    } = this.props
    
    const count = !!accounts ? accounts.size : 0
    const statusId = !!status ? status.get('id') : undefined

    let message
    let icon
    let groupUrl

    switch (type) {
      case 'follow':
        icon = 'group'
        message =  intl.formatMessage(count > 1 ? messages.followedYouMultiple : messages.followedYouOne, {
          count: count - 1,
        })
        break
      case 'mention':
        icon = 'comment'
        message = intl.formatMessage(messages.mentionedInPost)
        break
      case 'like':
        icon = 'like'
        message = intl.formatMessage(count > 1 ? messages.likedStatusMultiple : messages.likedStatusOne, {
          count: count - 1,
        })
        break
      case 'reaction':
        const actionTaken = !!reactionType && reactionType.get('name_past') ? reactionType.get('name_past').toLowerCase() : 'reacted to'
        icon = !!reactionType ? null : 'like'
        if (count > 1) {
          message = `and ${count - 1} others ${actionTaken} your post`
        } else {
          message = `${actionTaken} your post`
        }
        break
      case 'quote':
        icon = 'quote'
        message = intl.formatMessage(count > 1 ? messages.quotedStatusMultiple : messages.quotedStatusOne, {
          count: count - 1,
        })
        break
      case 'repost':
        icon = 'repost'
        message = intl.formatMessage(count > 1 ? messages.repostedStatusMultiple : messages.repostedStatusOne, {
          count: count - 1,
        })
        break
      case 'poll':
        let msg = messages.poll
        if (accounts.size === 1) {
          if (accounts.first().get('id') === me) {
            msg = messages.ownPoll
          }
        }
        icon = 'poll'
        message = intl.formatMessage(msg)
        break
      case 'group_moderation_event':
        icon = 'group'
        groupUrl = `/groups/${group_id}`
        if (!count) {
          if (approved) {
            message = `Group moderators have accepted your post in: ${group_name}`
          } else if (removed) {
            message = `Group moderators have removed you from: ${group_name}`
          } else {
            message = `Group moderators have rejected your post from: ${group_name}`
          }
        } else {
          if (approved || rejected) {
            return null
          }
          groupUrl = `/groups/${group_id}/moderation`
          message = `New post awaiting moderation in: ${group_name}`
        }
        break
      default:
        return null
    }

    if (isHidden) {
      return (
        <React.Fragment>
          {
            accounts && accounts.slice(0, 1).map((account, i) => (
              <DisplayName key={i} account={account} noUsername />
            ))
          }
          {message}
        </React.Fragment>
      )
    }

    const statusUrl = !!status ? status.get('uri') : '/'
    const DateWrapperContainer = !!status && !!statusUrl ? NavLink : Dummy

    const containerClasses = CX({
      d: 1,
      px10: !isDeckConnected,
      cursorPointer: 1,
      bgSubtle_onHover: !isUnread,
      highlightedComment: isUnread,
    })

    return (
      <div
        className={containerClasses}
        tabIndex='0'
        aria-label={`${message} ${createdAt}`}
      >
        <div className={[_s.d, _s.borderBottom1PX, _s.borderColorSecondary].join(' ')}>
          <div className={[_s.d, _s.flexRow, _s.my10, _s.py10, _s.px10].join(' ')}>

            {
              !isDeckConnected &&
              <Responsive min={BREAKPOINT_EXTRA_SMALL}>
                {
                  !!icon &&
                  <Icon id={icon} size='20px' className={[_s.cPrimary, _s.minW20PX, _s.mt5, _s.mr15].join(' ')} />
                }
                {
                  (!icon && type === 'reaction' && !!reactionType) &&
                  <div className={[_s.cPrimary, _s.minW20PX, _s.mt5, _s.mr15].join(' ')}>
                    <ReactionTypeImage reactionTypeId={reactionType.get('id')} size='20px' />
                  </div>
                }
              </Responsive>
            }

            <ResponsiveClassesComponent
              classNames={[_s.d, _s.flexNormal, _s.maxW100PC35PX].join(' ')}
              classNamesXS={[_s.d, _s.flexNormal, _s.maxW100PC].join(' ')}
            >
              <div className={[_s.d, _s.flexRow, _s.flexWrap].join(' ')}>
                {
                  accounts && accounts.map((account, i) => (
                    <NavLink
                      to={`/${account.get('acct')}`}
                      key={`fav-avatar-${i}`}
                      className={[_s.mr5, _s.mb5].join(' ')}
                    >
                      <Avatar size={34} account={account} />
                    </NavLink>
                  ))
                }
              </div>
              <div className={[_s.d, _s.pt5].join(' ')}>
                <div className={[_s.d, _s.displayInline].join(' ')}>
                  <div className={_s.text}>
                    {
                      accounts && accounts.slice(0, 1).map((account, i) => (
                        <NavLink
                          to={`/${account.get('acct')}`}
                          key={`noti-display-name-${i}`}
                        >
                          <DisplayName account={account} noUsername isInline />
                        </NavLink>
                      ))
                    }
                  </div>
                  <Text size='medium'>
                    { !!groupUrl &&
                      <a
                        href={groupUrl}
                        onClick={this.cancelRouter}
                        className={[_s.noUnderline, _s.text].join(' ')}
                      >
                        {message}
                      </a>
                    }
                    { !groupUrl &&
                      `${message}`
                    }
                  </Text>
                  <React.Fragment>
                    <DotTextSeperator />
                    <DateWrapperContainer
                      to={statusUrl}
                      className={[_s.noUnderline, _s.text].join(' ')}
                    >
                      <Text size='small' color='tertiary' className={_s.ml5}>
                        <RelativeTimestamp timestamp={createdAt} />
                      </Text>
                    </DateWrapperContainer>
                  </React.Fragment>
                </div>
              </div>
              {
                !!statusId &&
                <div className={[_s.d, _s.pt10, _s.mt5].join(' ')}>
                  <StatusContainer
                    contextType='notification'
                    id={statusId}
                    isChild
                    isNotification
                    
                  />
                </div>
              }
            </ResponsiveClassesComponent>

          </div>
        </div>
      </div>
    )
  }

}

const messages = defineMessages({
  poll: { id: 'notification.poll', defaultMessage: 'A poll you voted in ended' },
  ownPoll: { id: 'notification.own_poll', defaultMessage: 'Your poll ended' },
  mentionedInPost: { id: 'mentioned_in_post', defaultMessage: 'mentioned you' },
  mentionedInComment: { id: 'mentioned_in_comment', defaultMessage: 'mentioned you' },
  followedYouOne: { id: 'followed_you_one', defaultMessage: 'followed you' },
  followedYouMultiple: { id: 'followed_you_multiple', defaultMessage: 'and {count} others followed you' },
  likedStatusOne: { id: 'liked_status_one', defaultMessage: 'liked your post' },
  likedStatusMultiple: { id: 'liked_status_multiple', defaultMessage: 'and {count} others liked your post' },
  repostedStatusOne: { id: 'reposted_status_one', defaultMessage: 'reposted you' },
  repostedStatusMultiple: { id: 'reposted_status_multiple', defaultMessage: 'and {count} others reposted you' },
  quotedStatusOne: { id: 'quoted_status_one', defaultMessage: 'quoted you' },
  quotedStatusMultiple: { id: 'quoted_status_multiple', defaultMessage: 'and {count} others quoted you' },
})

Notification.propTypes = {
  intl: PropTypes.object.isRequired,
  accounts: ImmutablePropTypes.list.isRequired,
  createdAt: PropTypes.string,
  statusId: PropTypes.string,
  type: PropTypes.string.isRequired,
  isHidden: PropTypes.bool,
  isUnread: PropTypes.bool,
  isDeckConnected: PropTypes.bool,
}

export default injectIntl(Notification)
