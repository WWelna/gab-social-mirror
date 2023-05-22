import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { injectIntl, defineMessages } from 'react-intl'
import { withRouter } from 'react-router-dom'
import { openPopover } from '../../actions/popover'
import { fetchShortcuts } from '../../actions/shortcuts'
import { routerReset } from '../../actions/router'
import { me, isPro } from '../../initial_state'
import Responsive from '../../features/ui/util/responsive_component'
import Button from '../button'
import Text from '../text'
import Icon from '../icon'
import SidebarSectionTitle from '../sidebar_section_title'
import SidebarSectionItem from '../sidebar_section_item'
import SidebarLayout from './sidebar_layout'

const isHome = p => p === '/' || p === '/home'

class DefaultSidebar extends ImmutablePureComponent {

  state = {
    hoveringShortcuts: false,
    ctrlMeta: false
  }

  componentDidMount() {
    this.props.onFetchShortcuts()
    window.addEventListener('keyup', this.globalKeyup)
    window.addEventListener('keydown', this.globalKeydown)
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this.globalKeyup)
    window.removeEventListener('keydown', this.globalKeydown)
  }

  handleOpenSidebarMorePopover = () => {
    this.props.openSidebarMorePopover({
      targetRef: this.moreBtnRef,
      position: 'top',
    })
  }

  handleMouseEnterShortcuts = () => {
    this.setState({ hoveringShortcuts: true })
  }

  handleMouseLeaveShortcuts = () => {
    this.setState({ hoveringShortcuts: false })
  }

  setMoreButtonRef = n => {
    this.moreBtnRef = n
  }

  globalKeydown = evt => {
    if (evt && (evt.ctrlKey || evt.metaKey) && this.state.ctrlMeta === false) {
      this.setState({ ctrlMeta: true })
    }
  }

  globalKeyup = evt => this.setState({ ctrlMeta: false })

  render() {
    const {
      intl,
      notificationCount,
      homeItemsQueueCount,
      moreOpen,
      actions,
      tabs,
      title,
      showBackBtn,
      shortcuts,
      unreadChatsCount,
      routerEntries,
      location,
      history
    } = this.props
    const { hoveringShortcuts, ctrlMeta } = this.state

    if (!me) return null

    let shortcutItems = []
    if (!!shortcuts) {
      shortcuts.forEach((s) => {
        let shortcutComponent = null
        if (s.get('shortcut_type') === 'list') {
          shortcutComponent = (
            <div
              className={[_s.d, _s.circle, _s.bgSecondary, _s.aiCenter, _s.jcCenter].join(' ')}
              style={{ height: '16px', width: '16px' }}
            >
              <Icon id='list' size='8px' className={_s.cSecondary} />
            </div>
          )
        } else if (s.get('shortcut_type') === 'tag') {
          shortcutComponent = (
            <div
              className={[_s.d, _s.circle, _s.bgSecondary, _s.aiCenter, _s.jcCenter].join(' ')}
              style={{ height: '16px', width: '16px' }}
            >
              <Text size='small' color='secondary'>#</Text>
            </div>
          )
        }

        const unreadCount = s.get('unread_count')
        let count = Math.min(unreadCount, 99)
        if (count === 99) count = '99+'

        shortcutItems.push({
          to: s.get('to'),
          title: s.get('title'),
          image: s.get('image'),
          count,
          shortcutComponent,
        })
      })
    }

    const currentPathname = location.pathname
    let backTimes = 0
    let homeTo = '/home'
    let homeOnClick

    // find home in previous routes counting back how many times it is
    let homeFound = routerEntries.slice(1).some(function({ pathname }) {
      backTimes += 1
      return isHome(pathname)
    })

    if (
      isHome(currentPathname) === false &&
      homeFound &&
      backTimes > 0 &&
      history.length >= backTimes &&
      ctrlMeta === false // ctrl or meta means new tab
    ) {
      /*
      We've determined that there is an opportunity to go back to home and
      preserve the scroll Y position.
      */
      homeTo = undefined
      homeOnClick = () => {
        history.go(-backTimes)
        this.props.onRouterReset()
      }
    }

    if (isHome(currentPathname)) {
      homeTo = undefined
      homeOnClick = () => {
        window.scroll(0,0)
      }
    }

    let notificationsTo = '/notifications'
    let notificationsOnClick = undefined
    if (currentPathname.startsWith('/notifications')) {
      notificationsTo = undefined
      notificationsOnClick = () => {
        window.scroll(0,0)
      }
    }

    let groupsTo = '/groups'
    let groupsOnClick = undefined
    if (currentPathname.startsWith('/groups') && !currentPathname.startsWith('/groups/')) {
      groupsTo = undefined
      groupsOnClick = () => {
        window.scroll(0,0)
      }
    }


    return (
      <SidebarLayout
        title={title}
        showBackBtn={showBackBtn}
        actions={actions}
        tabs={tabs}
      >
        <SidebarSectionTitle>
          {intl.formatMessage(messages.menu)}
        </SidebarSectionTitle>
        <SidebarSectionItem title='Home' icon='home' to={homeTo} onClick={homeOnClick} count={homeItemsQueueCount} />
        <SidebarSectionItem title='Notifications' icon='notifications' to={notificationsTo} onClick={notificationsOnClick} count={notificationCount} />
        <SidebarSectionItem title='Marketplace' icon='shop' to='/marketplace' />
        <SidebarSectionItem title='Chats' icon='chat' to='/messages' count={unreadChatsCount} />
        <SidebarSectionItem title='Groups' icon='group' to={groupsTo} onClick={groupsOnClick} />
        <SidebarSectionItem title='Feeds' icon='list' to='/feeds' />
        <SidebarSectionItem title='Explore' icon='explore' to='/explore' />
        <SidebarSectionItem title='Pro Feed' icon='pro' to='/timeline/pro' />
        <SidebarSectionItem title='Polls Feed' icon='poll' to='/timeline/polls' />
        <SidebarSectionItem title='Photos Feed' icon='media' to='/timeline/photos' />
        <SidebarSectionItem title='Videos Feed' icon='tv' to='/timeline/videos' />
        {
          !!me && isPro && (
            <SidebarSectionItem title='Voice' icon='audio' href='https://voice.gab.com/user/login' />
          )
        }
        <SidebarSectionItem title='News' icon='news' to='/news' />

        <SidebarSectionItem title='More' icon='more' onClick={this.handleOpenSidebarMorePopover} buttonRef={this.setMoreButtonRef} active={moreOpen} />

        {
          shortcutItems.length > 0 &&
          <React.Fragment>
            <SidebarSectionTitle>
              <div
                className={[_s.displayFlex, _s.aiCenter, _s.flexRow].join(' ')}
                onMouseEnter={this.handleMouseEnterShortcuts}
                onMouseLeave={this.handleMouseLeaveShortcuts}
              >
                <span>
                  {intl.formatMessage(messages.shortcuts)}
                </span>
                <Button
                  isText
                  to='/shortcuts'
                  color='brand'
                  backgroundColor='none'
                  className={_s.mlAuto}
                >
                  {
                    hoveringShortcuts &&
                    <Text color='inherit' size='small' weight='medium' align='right'>
                      {intl.formatMessage(messages.all)}
                    </Text>
                  }
                </Button>
              </div>
            </SidebarSectionTitle>
            {
              shortcutItems.map((shortcutItem, i) => (
                <SidebarSectionItem {...shortcutItem} key={`sidebar-item-shortcut-${i}`} />
              ))
            }
          </React.Fragment>
        }

        <SidebarSectionTitle>{intl.formatMessage(messages.explore)}</SidebarSectionTitle>
        <SidebarSectionItem title='Gab TV' icon='tv' href='https://tv.gab.com' />
        <SidebarSectionItem title='Shop' icon='shop' href='https://shop.dissenter.com' />
        <SidebarSectionItem title='Trends' icon='trends' href='https://trends.gab.com' />
        <SidebarSectionItem title='GabPRO' icon='pro' href='https://pro.gab.com' />
         
      </SidebarLayout>
    )
  }

}

const messages = defineMessages({
  explore: { id: 'explore', defaultMessage: 'Explore' },
  gabPro: { id: 'gab_pro', defaultMessage: 'GabPRO' },
  menu: { id: 'menu', defaultMessage: 'Menu' },
  shortcuts: { id: 'navigation_bar.shortcuts', defaultMessage: 'Shortcuts' },
  all: { id: 'all', defaultMessage: 'All' },
})

const mapStateToProps = (state) => ({
  shortcuts: state.getIn(['shortcuts', 'items']),
  moreOpen: state.getIn(['popover', 'popoverType']) === 'SIDEBAR_MORE',
  notificationCount: state.getIn(['notifications', 'unread']),
  unreadChatsCount: state.getIn(['chats', 'chatsUnreadCount']),
  homeItemsQueueCount: state.getIn(['timelines', 'home', 'totalQueuedItemsCount'], 0),
  routerEntries: state.getIn(['router', 'entries'], [])
})

const mapDispatchToProps = (dispatch) => ({
  openSidebarMorePopover(props) {
    dispatch(openPopover('SIDEBAR_MORE', props))
  },
  onFetchShortcuts() {
    dispatch(fetchShortcuts())
  },
  onRouterReset(){
    dispatch(routerReset())
  }
})

DefaultSidebar.propTypes = {
  intl: PropTypes.object.isRequired,
  moreOpen: PropTypes.bool,
  onFetchShortcuts: PropTypes.func.isRequired,
  openSidebarMorePopover: PropTypes.func.isRequired,
  notificationCount: PropTypes.number.isRequired,
  homeItemsQueueCount: PropTypes.number.isRequired,
  unreadChatsCount: PropTypes.number.isRequired,
  actions: PropTypes.array,
  tabs: PropTypes.array,
  title: PropTypes.string,
  showBackBtn: PropTypes.bool,
  shortcuts: ImmutablePropTypes.list,
}

export default withRouter(injectIntl(connect(mapStateToProps, mapDispatchToProps)(DefaultSidebar)))
