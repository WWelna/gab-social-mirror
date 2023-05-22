import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { FormattedMessage } from 'react-intl'
import { List } from 'immutable'
import {
  expandNotifications,
  markReadNotifications
} from '../actions/notifications'
import {
  TIMELINE_INJECTION_FEATURED_GROUPS,
  TIMELINE_INJECTION_GROUP_CATEGORIES,
  TIMELINE_INJECTION_USER_SUGGESTIONS
} from '../constants'
import NotificationContainer from '../containers/notification_container'
import ScrollableList from '../components/scrollable_list'
import TimelineQueueButtonHeader from '../components/timeline_queue_button_header'
import Block from '../components/block'
import Account from '../components/account'
import NotificationPlaceholder from '../components/placeholder/notification_placeholder'
import TimelineInjectionRoot from '../components/timeline_injections/timeline_injection_root'

// uncomment to enable ads
// import { isPro, proWantsAds } from '../initial_state'
// import { GabAdStatus } from '../features/ui/util/async_components'
// import WrappedBundle from '../features/ui/util/wrapped_bundle'

class Notifications extends React.Component {
  componentDidMount() {
    this.load()
    this.props.onMarkRead()
  }

  /**
   * It's confusing but dispatching this message can load page1, next page,
   * or previous pages above, formerly known as queue items. The logic is all
   * in the actions/notifications.js.
   */
  load = () => {
    this.props.onExpandNotifications()
  }

  componentDidUpdate (prevProps, prevState) {
    //Check if clicked on "notifications" button, if so, reload
    if (
      prevProps.location.key !== this.props.location.key &&
      prevProps.location.pathname.startsWith('/notifications') &&
      this.props.location.pathname.startsWith('/notifications')
    ) {
      this.load()
    }
  }

  handleLoadOlder = () => {
    const last = this.props.notifications.last()
    this.props.onExpandNotifications({ maxId: last && last.get('id') })
  }

  render() {
    const {
      notifications,
      sortedNotifications,
      isLoading,
      hasMore,
      unread,
      selectedFilter
    } = this.props

    let scrollableContent = []

    if (sortedNotifications.size > 0 && selectedFilter !== 'follow') {
      scrollableContent = sortedNotifications
        .toArray()
        .filter(function(notification) {
          if (selectedFilter === 'quote') {
            return typeof notification.get('quote') === 'object'
          } else if (selectedFilter === 'reblog') {
            return typeof notification.get('repost') === 'object'
          }
          return true
        })
        .map(notification => (
          <NotificationContainer
            key={`notification-${notification}`}
            notification={notification}
          />
        ))
    } else if (sortedNotifications.size > 0 && selectedFilter === 'follow') {
      scrollableContent = sortedNotifications
        .map(block => block.get('follow'))
        .filter(follows => List.isList(follows) && follows.size > 0)
        .reduce((acm, follows, index1) => {
          follows.forEach((follow) =>
            acm.push(
              <Account
                compact
                withBio
                key={`account-${follow.get('account')}`}
                id={follow.get('account')}
              />
            )
          )
          return acm
        }, [])
    }

    // uncomment to enable ads
    /* if (!isPro || proWantsAds) {
      //
      // intersperse ads
      //
      const pageKey = `notifications-${selectedFilter}`
      scrollableContent = scrollableContent.reduce(function (acm, item, index) {
        if (index !== 0 && index % 7 === 0) {
          acm.push(
            <WrappedBundle
              key={`gab-ad-notification-injection-${index}`}
              component={GabAdStatus}
              componentParams={{ pageKey, position: index }}
            />
          )
        }
        acm.push(item)
        return acm
      }, [])
    } */

    const canShowEmptyContent =
      scrollableContent.length === 0 &&
      !isLoading &&
      notifications.size === 0 &&
      selectedFilter === 'all'

    return (
      <>
        <TimelineQueueButtonHeader
          count={unread}
          itemType="notification"
        />
        <Block>
          <ScrollableList
            scrollKey="notifications"
            isLoading={isLoading}
            showLoading={isLoading && sortedNotifications.size === 0}
            hasMore={hasMore}
            emptyMessage={
              <FormattedMessage
                id="empty_column.notifications"
                defaultMessage="You don't have any notifications yet. Interact with others to start the conversation."
              />
            }
            onLoadMore={this.handleLoadOlder}
            onScrollToTop={this.handleScrollToTop}
            onScroll={this.handleScroll}
            placeholderComponent={NotificationPlaceholder}
            placeholderCount={3}            
          >
            {scrollableContent}
          </ScrollableList>
        </Block>
        {canShowEmptyContent && (
          <div className={[_s.d, _s.mt15, _s.w100PC].join(' ')}>
            <TimelineInjectionRoot
              type={TIMELINE_INJECTION_USER_SUGGESTIONS}
              key="empty-injection-0"
            />
            <TimelineInjectionRoot
              type={TIMELINE_INJECTION_FEATURED_GROUPS}
              key="empty-injection-1"
            />
            <TimelineInjectionRoot
              type={TIMELINE_INJECTION_USER_SUGGESTIONS}
              subProps={{ suggestionType: 'verified' }}
              key="empty-injection-2"
            />
            <TimelineInjectionRoot
              type={TIMELINE_INJECTION_GROUP_CATEGORIES}
              key="empty-injection-3"
            />
          </div>
        )}
      </>
    )
  }
}

const mapStateToProps = state => ({
  notifications: state.getIn(['notifications', 'items']),
  sortedNotifications: state.getIn(['notifications', 'sortedItems']),
  isLoading: state.getIn(['notifications', 'isLoading']),
  hasMore: state.getIn(['notifications', 'hasMore']),
  unread: state.getIn(['notifications', 'unread']),
  selectedFilter: state.getIn(['notifications', 'filter', 'active'])
})

const mapDispatchToProps = dispatch => ({
  onExpandNotifications(options) {
    dispatch(expandNotifications(options))
  },
  onMarkRead() {
    dispatch(markReadNotifications())
  }
})

Notifications.propTypes = {
  hasMore: PropTypes.bool,
  isLoading: PropTypes.bool,
  notifications: ImmutablePropTypes.list.isRequired,
  onExpandNotifications: PropTypes.func.isRequired,
  sortedNotifications: ImmutablePropTypes.list.isRequired,
  unread: PropTypes.number,
  selectedFilter: PropTypes.string.isRequired
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Notifications)
)
