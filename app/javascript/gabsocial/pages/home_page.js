import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import throttle from 'lodash/throttle'
import { defineMessages, injectIntl } from 'react-intl'
import { openModal } from '../actions/modal'
import {
  MODAL_HOME_TIMELINE_SETTINGS,
  LAZY_LOAD_SCROLL_OFFSET,
  BREAKPOINT_EXTRA_SMALL,
} from '../constants'
import { me } from '../initial_state'
import PageTitle from '../features/ui/util/page_title'
import DefaultLayout from '../layouts/default_layout'
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
  ProgressPanel,
  GabAdTopPanel,
  GabAdBottomPanel,
} from '../features/ui/util/async_components'
import { supportsPassiveEvents } from 'detect-it'
import ComposeForm from '../features/compose/components/compose_form'
import ShortcutsAvatarList from '../components/shortcuts_avatar_list'
import { isTouch } from '../utils/is_mobile'

class HomePage extends React.PureComponent {

  state = {
    lazyLoaded: false,
  }

  componentDidMount() {
    this.window = window
    this.documentElement = document.scrollingElement || document.documentElement

    this.window.addEventListener('scroll', this.handleScroll, supportsPassiveEvents ? { passive: true } : false)
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
      notificationCount,
      unreadChatsCount,
      unreadWarningsCount,
      showVideos,
      showSuggestedUsers,
      showGroups,
      isXS,
    } = this.props
    const { lazyLoaded } = this.state

    const title = intl.formatMessage(messages.home)
    let sidebarLayout = [
      UserPanel,
      <WrappedBundle key='home-page-ad-panel' component={GabAdTopPanel} componentParams={{ pageKey: 'home.sidebar', position: 1 }} />,
      ProgressPanel,
      <WrappedBundle key='home-page-pro-panel' component={ProPanel} componentParams={{ isPro: isPro }} />,
      <WrappedBundle key='home-page-lists-panel' component={ListsPanel} />,
    ]

    if(showGroups) {
      sidebarLayout.push((<WrappedBundle key='home-page-groups-panel' component={GroupsPanel} componentParams={{ groupType: 'member' }}  />))
    }

    if(showVideos) {
      sidebarLayout.push((<WrappedBundle key='home-page-gabtv-videos-panel' component={GabTVVideosPanel} componentParams={{ isLazy: true, shouldLoad: lazyLoaded }} />))
    }

    sidebarLayout.push((<WrappedBundle key='home-page-shop-panel' component={ShopPanel} componentParams={{ isLazy: true, shouldLoad: lazyLoaded }}  />))

    if(showSuggestedUsers) {
      sidebarLayout.push((<WrappedBundle key='home-page-user-suggestions-panel' component={UserSuggestionsPanel} componentParams={{ isLazy: true, shouldLoad: lazyLoaded }}  />))
    }

    sidebarLayout.push(LinkFooter)
    sidebarLayout.push(<WrappedBundle key='home-page-ad-panel-bottom' component={GabAdBottomPanel} componentParams={{ pageKey: 'home.sidebar.bottom', position: 2 }} />)

    return (
      <DefaultLayout
        page='home'
        title={title}
        actions={[
          {
            icon: 'tv',
            to: '/timeline/videos',
          },
          {
            icon: 'search',
            to: '/search',
          },
          {
            icon: 'chat',
            to: '/messages',
            count: unreadChatsCount,
          }
        ]}
        layout={sidebarLayout}
      >

        <PageTitle
          path={title}
          badge={notificationCount}
        />

        {
          !isNaN(unreadWarningsCount) && unreadWarningsCount > 0 &&
          <Announcement
            title={`You have ${unreadWarningsCount} new account warning${unreadWarningsCount > 1 ? 's' : '' }`}
            actionTitle='Click to view'
            actionTo='/warnings'
          />
        }

        <ComposeForm composerId="home-timeline" />

        {isXS && <ShortcutsAvatarList />}

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
  notificationCount: state.getIn(['notifications', 'unread']),
  unreadChatsCount: state.getIn(['chats', 'chatsUnreadCount'], 0),
  unreadWarningsCount: state.getIn(['warnings', 'unreadCount'], 0),
  isPro: state.getIn(['accounts', me, 'is_pro']),
  isXS: state.getIn(['settings', 'window_dimensions', 'width']) <= BREAKPOINT_EXTRA_SMALL,
})

HomePage.propTypes = {
  children: PropTypes.node.isRequired,
  dispatch: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
  isPro: PropTypes.bool,
  unreadChatsCount: PropTypes.number.isRequired,
  unreadWarningsCount: PropTypes.number.isRequired,
  notificationCount: PropTypes.number,
}

export default injectIntl(connect(mapStateToProps)(HomePage))
