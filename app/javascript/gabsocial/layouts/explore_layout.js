import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import Sticky from 'react-stickynode'
import { me } from '../initial_state'
import {
  BREAKPOINT_EXTRA_SMALL,
} from '../constants'
import Layout from './layout'
import SidebarPanelGroup from '../components/sidebar_panel_group'
import Responsive from '../features/ui/util/responsive_component'
import WrappedBundle from '../features/ui/util/wrapped_bundle'
import Heading from '../components/heading'
import {
  GroupsPanel,
  SignUpLogInPanel,
  UserSuggestionsPanel,
  GabTVVideosPanel,
  LinkFooter,
  GabAdTopPanel,
  GabAdBottomPanel,
} from '../features/ui/util/async_components'

class ExploreLayout extends ImmutablePureComponent {

  render() {
    const { children, title, showVideos, showSuggestedUsers, showGroups } = this.props

    // removing this from being used...
    const pageTitleBlock = (
      <div className={[_s.d, _s.pl15, _s.pb15].join(' ')}>
        <Heading size='h2'>Popular posts across Gab</Heading>
      </div>
    )

    const layout = [
      SignUpLogInPanel,
      <WrappedBundle key='explore-page-ad-panel' component={GabAdTopPanel} componentParams={{ pageKey: 'explore.sidebar', position: 1 }} />,
    ]
    if (!!me) {
      if(showGroups) {
        layout.push(<WrappedBundle key='explore-layout-groups-panel' component={GroupsPanel} componentParams={{ groupType: 'featured' }} />)
      }

      if(showSuggestedUsers) {
        layout.push(<WrappedBundle key='explore-layout-user-suggestions-panel' component={UserSuggestionsPanel} componentParams={{ suggestionType: 'verified' }} />)
      }
    }
    
    if(showVideos) {
      layout.push(<WrappedBundle key='explore-layout-gabtv-videos-panel' component={GabTVVideosPanel} />)
    }
    
    layout.push(<WrappedBundle key='explore-layout-link-footer' component={LinkFooter} />)
    layout.push(<WrappedBundle key='home-page-ad-panel-bottom' component={GabAdBottomPanel} componentParams={{ pageKey: 'home.sidebar.bottom', position: 2 }} />)

    return (
      <Layout
        showGlobalFooter
        noRightSidebar
        showLinkFooterInSidebar
        page='explore'
        title={title}
      >
        <Responsive max={BREAKPOINT_EXTRA_SMALL}>
          <div className={[_s.d, _s.w100PC].join(' ')}>

            <div className={[_s.d, _s.w100PC, _s.z1, _s.pt10].join(' ')}>
              {
                !me &&
                <div className={[_s.d, _s.mt15, _s.px10].join(' ')}>
                  <WrappedBundle component={SignUpLogInPanel} componentParams={{ isXS: true }} />
                </div>
              }
              {children}
            </div>

          </div>
        </Responsive>

        <Responsive min={BREAKPOINT_EXTRA_SMALL}>
          <div className={[_s.d, _s.w100PC, _s.pl15].join(' ')}>

            <div className={[_s.d, _s.flexRow, _s.w100PC, _s.jcEnd].join(' ')}>
              <div className={[_s.d, _s.w645PX, _s.z1].join(' ')}>  

                <div className={_s.d}>
                  {children}
                </div>
              </div>

              <div className={[_s.d, _s.ml15, _s.w340PX].join(' ')}>
                <Sticky top={73} enabled>
                  <div className={[_s.d, _s.w340PX].join(' ')}>
                    <SidebarPanelGroup
                      page='explore'
                      layout={layout}
                    />
                  </div>
                </Sticky>
              </div>
            </div>
          </div>
        </Responsive>
      </Layout>
    )
  }

}

ExploreLayout.propTypes = {
  actions: PropTypes.array,
  children: PropTypes.node,
  group: ImmutablePropTypes.map,
  groupId: PropTypes.string,
  layout: PropTypes.object,
  relationships: ImmutablePropTypes.map,
  title: PropTypes.string,
}

export default ExploreLayout
