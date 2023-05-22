import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { me } from '../initial_state'
import { openSidebar } from '../actions/sidebar'
import { routerReset } from '../actions/router'
import { CX } from '../constants'
import Button from './button'
import Avatar from './avatar'

const isHome = p => p === '/' || p === '/home'
const isNotifications = p => p.startsWith('/notifications')

class FooterBar extends ImmutablePureComponent {

  handleOnOpenSidebar = () => {
    this.props.onOpenSidebar()
  }

  render() {
    const {
      account,
      notificationCount,
      queuedItems,
      routerEntries,
      location,
      history
    } = this.props

    const currentPathname = location.pathname

    let home = {
      to: !me ? '/' : '/home',
      icon: 'home',
      title: 'Home',
      active: !me ? currentPathname === '/' : currentPathname === '/home',
    }

    let notifications = {
      to: '/notifications',
      icon: 'notifications',
      title: 'Notifications',
      isHidden: !me,
      active: isNotifications(currentPathname),
    }

    let groups = {
      to: '/groups',
      icon: 'group',
      title: 'Groups',
      active: currentPathname.startsWith('/groups'),
    }

    let backTimes = 0

    // find home in previous routes counting back how many times it is
    let homeFound = routerEntries.slice(1).some(function({ pathname }) {
      backTimes += 1
      return isHome(pathname)
    })

    if (me && isHome(currentPathname) === true) {
      delete home.to
      home.onClick = () => {
        window.scrollTo(0,0)
      }
    } else if (
      isHome(currentPathname) === false &&
      homeFound &&
      backTimes > 0 &&
      history.length >= backTimes
    ) {
      /*
      We've determined that there is an opportunity to go back to home and
      preserve the scroll Y position.
      */
      delete home.to
      home.onClick = () => {
        history.go(-backTimes)
        this.props.onRouterReset()
      }
    }

    if (me && isNotifications(currentPathname) === true) {
      delete notifications.to
      notifications.onClick = () => {
        window.scrollTo(0,0)
      }
    }

    if (me && currentPathname.startsWith('/groups') && !currentPathname.startsWith('/groups/')) {
      delete groups.to
      groups.onClick = () => {
        window.scrollTo(0,0)
      }
    }
         
    
    const loggedIn = me !== undefined && me !== null && me !== ''
    const loggedOut = !loggedIn

    const buttons = [
      home,
      notifications,
      groups,
      loggedIn && {
        to: '/explore',
        icon: 'explore',
        title: 'Explore',
        active: currentPathname.startsWith('/explore'),
      },
      loggedOut && {
        to: '/news',
        icon: 'news',
        title: 'News',
        active: currentPathname.startsWith('/news'),
      },
      loggedOut && {
        to: '/feeds',
        icon: 'list',
        title: 'Feeds',
        active: currentPathname.startsWith('/feed'),
      },
      {
        to: '/marketplace',
        icon: 'shop',
        title: 'Marketplace',
        active: currentPathname.startsWith('/marketplace'),
      },
      {
        title: 'Menu',
        isHidden: !me,
        active: !!account ? currentPathname === `/${account.get('username')}` : false,
        onClick: this.handleOnOpenSidebar,
      }
    ].filter(Boolean)

    const homeItemsQueueCount = queuedItems && queuedItems.size

    return (
      <div className={[_s.d, _s.z4, _s.minH58PX, _s.w100PC].join(' ')}>
        <div className={[_s.d, _s.posFixed, _s.left0, _s.right0, _s.bottom0, _s.minH58PX, _s.w100PC, _s.bgPrimary, _s.borderTop1PX, _s.borderColorSecondary].join(' ')}>
          <div className={[_s.d, _s.flexRow, _s.aiCenter, _s.h100PC, _s.minH58PX, _s.saveAreaInsetPB, _s.jcSpaceAround].join(' ')}>
            {
              buttons.map((props, i) => {
                if (props.isHidden) return null

                const classes = CX({
                  borderTop2PX: 1,
                  borderColorTransparent: !props.active,
                  borderColorBrand: props.active,
                  h100PC: 1,
                  minH58PX: 1,
                  px15: 1,
                  flexGrow1: 1,
                  aiCenter: 1,
                  jcCenter: 1,
                })
                
                const color = props.active ? 'brand' : 'secondary'
                let childIcon;
                if (props.to === '/notifications' && notificationCount > 0) {
                  childIcon = (
                    <div className={[_s.posAbs, _s.ml5, _s.top0, _s.pt5, _s.pl20].join(' ')}>
                      <span className={[_s.bgRed, _s.cWhite, _s.circle, _s.py2, _s.px2, _s.minW14PX, _s.displayBlock].join(' ')} style={{fontSize: '12px'}}>
                        {notificationCount}
                      </span>
                    </div>
                  )
                } else if (props.to === '/home' && homeItemsQueueCount > 0) {
                  childIcon = (
                    <div className={[_s.posAbs, _s.ml5, _s.top0, _s.pt2, _s.pl20].join(' ')}>
                      <span className={[_s.cBrand, _s.circle, _s.py2, _s.px2, _s.minW14PX, _s.displayBlock].join(' ')} style={{fontSize: '18px'}}>
                        •
                      </span>
                    </div>
                  )
                } else if (props.title === 'Menu' && !!account) {
                  const avatarContainerClasses = CX({
                    d: 1,
                    circle: 1,
                    boxShadowProfileAvatarFooter: !!props.active,
                  })
                  childIcon = (
                    <div className={avatarContainerClasses}>
                      <Avatar account={account} size={24} />
                    </div>
                  )
                }

                return (
                  <Button
                    isText
                    backgroundColor='none'
                    iconSize='20px'
                    color={color}
                    to={props.to}
                    onClick={props.onClick}
                    icon={props.icon}
                    href={props.href}
                    title={props.title}
                    className={classes}
                    key={`footer-bar-item-${i}`}
                  >
                    {childIcon}
                  </Button>
                )
              })
            }
          </div>
        </div>
      </div>
    )
  }

}

const mapDispatchToProps = (dispatch) => ({
  onOpenSidebar() {
    dispatch(openSidebar())
  },
  onRouterReset(){
    dispatch(routerReset())
  }
})

const mapStateToProps = (state) => ({
  account: !!me ? state.getIn(['accounts', me]) : undefined,
  notificationCount: !!me ? state.getIn(['notifications', 'unread']) : 0,
  queuedItems: !!me ? state.getIn(['timelines', 'home', 'queuedItems']): null,
  routerEntries: state.getIn(['router', 'entries'], [])
})

FooterBar.propTypes = {
  account: ImmutablePropTypes.map,
  onOpenSidebar: PropTypes.func.isRequired,
  notificationCount: PropTypes.number.isRequired,
  queuedItems: ImmutablePropTypes.list,
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(FooterBar))
