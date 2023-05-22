import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { defineMessages, injectIntl } from 'react-intl'
import { withRouter } from 'react-router-dom'
import { setFilter } from '../actions/notifications'
import { openPopover } from '../actions/popover'
import { me } from '../initial_state'
import {
  NOTIFICATION_FILTERS,
  BREAKPOINT_EXTRA_SMALL,
  POPOVER_NOTIFICATION_SETTINGS,
} from '../constants'
import PageTitle from '../features/ui/util/page_title'
import WrappedBundle from '../features/ui/util/wrapped_bundle'
import DefaultLayout from '../layouts/default_layout'
import {
  LinkFooter,
  NotificationFilterPanel,
  UserSuggestionsPanel,
  GabAdTopPanel,
  GabAdBottomPanel,
} from '../features/ui/util/async_components'

class NotificationsPage extends React.PureComponent {

  onChangeActiveFilter(notificationType) {
    this.props.dispatch(setFilter('active', notificationType))
    let href

    if (notificationType === 'all') {
      href = '/notifications'
    } else if (notificationType === 'follow_requests') {
      href = `/notifications/follow_requests`
    } else {
      href = `/notifications?view=${notificationType}`
    }

    this.props.history.push(href)
    
    // otherwise it can stay scrolled down
    window.scrollTo(0, 0)
  }

  handleOnClickSettings = () => {
    this.props.dispatch(openPopover(POPOVER_NOTIFICATION_SETTINGS, {
      targetRef: this.node,
    }))
  }

  setNode = (n) => {
    this.node = n
  }

  render() {
    const {
      children,
      intl,
      locked,
      notificationCount,
      selectedFilter,
      isXS,
      showSuggestedUsers,
      isLoading
    } = this.props

    let filters = NOTIFICATION_FILTERS
    if (!locked && filters.indexOf('follow_requests') > -1) {
      filters.splice(filters.indexOf('follow_requests'))
    }

    const tabs = filters.map((filter) => ({ 
      title: intl.formatMessage(messages[filter]),
      onClick: () => this.onChangeActiveFilter(filter),
      active: selectedFilter.toLowerCase() === filter.toLowerCase()
    }))

    const title = intl.formatMessage(messages.notifications)

    let sidebarLayout = [
      <WrappedBundle key='notifications-page-ad-panel' component={GabAdTopPanel} componentParams={{ pageKey: 'notifications.sidebar', position: 1 }} />,
      NotificationFilterPanel,
    ]
    
    if(showSuggestedUsers) {
      sidebarLayout.push(UserSuggestionsPanel)
    }

    sidebarLayout.push(LinkFooter)
    sidebarLayout.push(<WrappedBundle key='home-page-ad-panel-bottom' component={GabAdBottomPanel} componentParams={{ pageKey: 'home.sidebar.bottom', position: 2 }} />)

    return (
      <DefaultLayout
        title={title}
        page='notifications'
        layout={sidebarLayout}
        tabs={tabs}
        actions={!isXS ? [
          {
            icon: 'search',
            to: '/search',
          },
        ] : [
          {
            icon: 'cog',
            onClick: this.handleOnClickSettings
          },
        ]}
      >
        {/* just do empty node because it only shows on mobile */}
        <div ref={this.setNode} />
        <PageTitle badge={notificationCount} path={title} />
        {children}
      </DefaultLayout>
    )
  }
}

const messages = defineMessages({
  notifications: { id: 'tabs_bar.notifications', defaultMessage: 'Notifications' },
  mention: { id: 'notifications.filter.mentions', defaultMessage: 'Mentions' },
  favourite: { id: 'reactions', defaultMessage: 'Reactions' },
  reblog: { id: 'reposts', defaultMessage: 'Reposts' },
  poll: { id: 'polls', defaultMessage: 'Poll' },
  follow: { id: 'notifications.filter.follows', defaultMessage: 'Follows' },
  follow_requests: { id: 'navigation_bar.follow_requests', defaultMessage: 'Follow requests' },
  quote: { id: 'quotes', defaultMessage: 'Quotes' },
  all: { id: 'notifications.filter.all', defaultMessage: 'All' },
})

const mapStateToProps = (state) => ({
  selectedFilter: state.getIn(['notifications', 'filter', 'active']),
  notificationCount: state.getIn(['notifications', 'unread']),
  locked: !!state.getIn(['accounts', me, 'locked']),
  isXS: state.getIn(['settings', 'window_dimensions', 'width']) <= BREAKPOINT_EXTRA_SMALL,
  isLoading: state.getIn(['notifications', 'isLoading'], false),
})

NotificationsPage.propTypes = {
  children: PropTypes.node.isRequired,
  dispatch: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
  locked: PropTypes.bool,
  notificationCount: PropTypes.number.isRequired,
  selectedFilter: PropTypes.string.isRequired,
}

export default withRouter(injectIntl(connect(mapStateToProps)(NotificationsPage)))
