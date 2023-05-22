import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import throttle from 'lodash.throttle'
import { defineMessages, injectIntl } from 'react-intl'
import { openModal } from '../actions/modal'
import {
  MODAL_HOME_TIMELINE_SETTINGS,
  LAZY_LOAD_SCROLL_OFFSET,
} from '../constants'
import { me } from '../initial_state'
import PageTitle from '../features/ui/util/page_title'
import DefaultLayout from '../layouts/default_layout'
import TimelineComposeBlock from '../components/timeline_compose_block'
import TabBar from '../components/tab_bar'
import WelcomeReminders from '../components/welcome_reminders'
import Announcement from '../components/announcement'
import HomeSortBlock from '../components/home_sort_block'
import WrappedBundle from '../features/ui/util/wrapped_bundle'
import {
  UserPanel,
  GroupsPanel,
  LinkFooter,
  ListsPanel,
  GabTVVideosPanel,
  UserSuggestionsPanel,
  ProPanel,
  ShopPanel,
  TrendingHashtagsPanel,
  ProgressPanel,
  GabAdPanel,
} from '../features/ui/util/async_components'

class HomePage extends React.PureComponent {

  state = {
    lazyLoaded: false,
  }

  componentDidMount() {
    this.window = window
    this.documentElement = document.scrollingElement || document.documentElement

    this.window.addEventListener('scroll', this.handleScroll)
  }

  componentWillUnmount() {
    this.detachScrollListener()
  }

  detachScrollListener = () => {
    this.window.removeEventListener('scroll', this.handleScroll)
  }

  handleScroll = throttle(() => {
    if (this.window) {
      const { scrollTop } = this.documentElement
      
      if (scrollTop > LAZY_LOAD_SCROLL_OFFSET && !this.state.lazyLoaded) {
        this.setState({ lazyLoaded: true })
        this.detachScrollListener()
      }
    }
  }, 150, {
    trailing: true,
  })

  onOpenHomePageSettingsModal = () => {
    this.props.dispatch(openModal(MODAL_HOME_TIMELINE_SETTINGS))
  }

  render() {
    const {
      children,
      intl,
      isPro,
      totalQueuedItemsCount,
      unreadChatsCount,
      unreadWarningsCount,
    } = this.props
    const { lazyLoaded } = this.state

    const title = intl.formatMessage(messages.home)
    const sidebarLayout = [
      UserPanel,
      ProgressPanel,
      GabAdPanel,
      <WrappedBundle key='home-page-pro-panel' component={ProPanel} componentParams={{ isPro: isPro }} />,
      <WrappedBundle key='home-page-lists-panel' component={ListsPanel} />,
      <WrappedBundle key='home-page-groups-panel' component={GroupsPanel} componentParams={{ groupType: 'member' }}  />,
      <WrappedBundle key='home-page-gabtv-videos-panel' component={GabTVVideosPanel} componentParams={{ isLazy: true, shouldLoad: lazyLoaded }} />,
      <WrappedBundle key='home-page-shop-panel' component={ShopPanel} componentParams={{ isLazy: true, shouldLoad: lazyLoaded }}  />,
      <WrappedBundle key='home-page-user-suggestions-panel' component={UserSuggestionsPanel} componentParams={{ isLazy: true, shouldLoad: lazyLoaded }}  />,
      <WrappedBundle key='home-page-trending-hashtags-panel' component={TrendingHashtagsPanel} componentParams={{ isLazy: true, shouldLoad: lazyLoaded }}  />,
      LinkFooter,
    ]

    return (
      <DefaultLayout
        page='home'
        title={title}
        actions={[
          {
            icon: 'tv',
            href: 'https://tv.gab.com',
          },
          {
            icon: 'search',
            to: '/search',
          },
          {
            icon: 'chat',
            to: '/messages',
            count: unreadChatsCount,
          },           
        ]}
        layout={sidebarLayout}
      >

        <PageTitle
          path={title}
          badge={totalQueuedItemsCount}
        />

        {
          !isNaN(unreadWarningsCount) && unreadWarningsCount > 0 &&
          <Announcement
            title={`You have ${unreadWarningsCount} new account warning${unreadWarningsCount > 1 ? 's' : '' }`}
            actionTitle='Click to view'
            actionTo='/warnings'
          />
        }

        <TimelineComposeBlock autoFocus={false} />

        <WelcomeReminders />

        <HomeSortBlock />

        {children}

      </DefaultLayout>
    )
  }
}

const messages = defineMessages({
  home: { id: 'home', defaultMessage: 'Home' },
})

const mapStateToProps = (state) => ({
  totalQueuedItemsCount: state.getIn(['timelines', 'home', 'totalQueuedItemsCount'], 0),
  unreadChatsCount: state.getIn(['chats', 'chatsUnreadCount'], 0),
  unreadWarningsCount: state.getIn(['warnings', 'unreadCount'], 0),
  isPro: state.getIn(['accounts', me, 'is_pro']),
})

HomePage.propTypes = {
  children: PropTypes.node.isRequired,
  dispatch: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
  isPro: PropTypes.bool,
  unreadChatsCount: PropTypes.number.isRequired,
  totalQueuedItemsCount: PropTypes.number.isRequired,
  unreadWarningsCount: PropTypes.number.isRequired,
}

export default injectIntl(connect(mapStateToProps)(HomePage))
