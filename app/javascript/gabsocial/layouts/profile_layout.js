import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { withRouter } from 'react-router-dom'
import { BREAKPOINT_EXTRA_SMALL } from '../constants'
import Sticky from 'react-stickynode'
import { me } from '../initial_state'
import {
  CX,
} from '../constants'
import DefaultNavigationBar from '../components/navigation_bar/default_navigation_bar'
import FooterBar from '../components/footer_bar'
import ProfileHeader from '../components/profile_header'
import FloatingActionButton from '../components/floating_action_button'
import ProfileNavigationBar from '../components/navigation_bar/profile_navigation_bar'
import LoggedOutNavigationBar from '../components/navigation_bar/logged_out_navigation_bar'
import Responsive from '../features/ui/util/responsive_component'
import Divider from '../components/divider'
import WrappedBundle from '../features/ui/util/wrapped_bundle'
import {
  LinkFooter,
  ProfileStatsPanel,
  ProfileInfoPanel,
  MediaGalleryPanel,
  SignUpPanel,
  SidebarXS,
  AccountMarketplaceListingsPanel,
} from '../features/ui/util/async_components'

class ProfileLayout extends ImmutablePureComponent {

  render() {
    const {
      account,
      children,
      titleHTML,
      unavailable,
      noSidebar,
    } = this.props

    const mainContentClasses = CX({
      d: 1,
      w645PX: !noSidebar,
      w1015PX: noSidebar,
      z1: 1,
    })

    const isTimeline = this.props.match.path === "/:username"

    return (
      <div className={[_s.d, _s.w100PC, _s.minH100VH, _s.bgTertiary].join(' ')}>

        <Responsive max={BREAKPOINT_EXTRA_SMALL}>
          <WrappedBundle component={SidebarXS} />
        </Responsive>

        <Responsive max={BREAKPOINT_EXTRA_SMALL}>
          {
            !!me &&
            <ProfileNavigationBar titleHTML={titleHTML} account={account} />
          }
          {
            !me &&
            <LoggedOutNavigationBar isProfile />
          }

          <main role='main' className={[_s.d, _s.w100PC].join(' ')}>

            <div className={[_s.d, _s.w100PC, _s.flexRow, _s.pb15].join(' ')}>

              <div className={[_s.d, _s.w100PC, _s.flexRow, _s.jcSpaceBetween].join(' ')}>
                <div className={[_s.d, _s.z1, _s.w100PC, _s.aiCenter].join(' ')}>

                  <ProfileHeader account={account} isXS>
                    <WrappedBundle component={ProfileInfoPanel} componentParams={{ account, noPanel: true }} />
                    <Divider isSmall />
                    <WrappedBundle component={ProfileStatsPanel} componentParams={{ account, noPanel: true }} />
                  </ProfileHeader>

                  <div className={[_s.d, _s.w100PC, , _s.flexRow, _s.jcEnd, _s.py15, _s.mt15].join(' ')}>
                    <div className={[_s.d, _s.w100PC, _s.z1].join(' ')}>
                      { (!unavailable && isTimeline) && <WrappedBundle component={AccountMarketplaceListingsPanel} componentParams={{ account, scroll: 'x' }} /> }
                      <div className={[_s.d, _s.boxShadowNone].join(' ')}>
                        {children}
                      </div>
                    </div>
                  </div>

                </div>
              </div>


            </div>

            <FloatingActionButton />

          </main>

          <FooterBar />

        </Responsive>

        <Responsive min={BREAKPOINT_EXTRA_SMALL}>
          {
            me &&
            <DefaultNavigationBar />
          }
          {
            !me &&
            <LoggedOutNavigationBar isProfile />
          }

          <main role='main' className={[_s.d, _s.w100PC].join(' ')}>

            <div className={[_s.d, _s.w100PC, _s.flexRow, _s.pb15].join(' ')}>

              <div className={[_s.d, _s.w100PC, _s.flexRow, _s.jcSpaceBetween].join(' ')}>
                <div className={[_s.d, _s.z1, _s.w100PC, _s.aiCenter].join(' ')}>

                  <ProfileHeader account={account} />

                  <div className={[_s.d, _s.w1015PX, , _s.flexRow, _s.jcEnd, _s.py15].join(' ')}>
                    {
                      !noSidebar &&
                      <div className={[_s.d, _s.w340PX, _s.mr15].join(' ')}>
                        <Sticky top={63} enabled>
                          <div className={[_s.d, _s.w340PX].join(' ')}>
                            <WrappedBundle component={ProfileStatsPanel} componentParams={{ account }} />
                            <WrappedBundle component={ProfileInfoPanel} componentParams={{ account }} />
                            { (!!me && !unavailable) && <WrappedBundle component={MediaGalleryPanel} componentParams={{ account }} /> }
                            { !unavailable && <WrappedBundle component={AccountMarketplaceListingsPanel} componentParams={{ account, scroll: 'y' }} /> }
                            { !me && <WrappedBundle component={SignUpPanel} /> }
                            <WrappedBundle component={LinkFooter} />
                          </div>
                        </Sticky>
                      </div>
                    }
                    <div className={mainContentClasses}>
                      <div className={_s.d}>
                        {children}
                      </div>
                    </div>
                  </div>

                </div>
              </div>


            </div>

            <FloatingActionButton />

          </main>
        </Responsive>

      </div>
    )
  }

}

ProfileLayout.propTypes = {
  account: ImmutablePropTypes.map,
  children: PropTypes.node.isRequired,
  titleHTML: PropTypes.string,
  unavailable: PropTypes.bool,
  noSidebar: PropTypes.bool,
}

export default withRouter(ProfileLayout)