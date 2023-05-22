import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import Sticky from 'react-stickynode'
import { BREAKPOINT_EXTRA_SMALL, CX } from '../constants'
import Layout from './layout'
import GroupHeader from '../components/group_header'
import SidebarPanelGroup from '../components/sidebar_panel_group'
import Responsive from '../features/ui/util/responsive_component'
import WrappedBundle from '../features/ui/util/wrapped_bundle'
import {
  LinkFooter,
  SignUpPanel,
  GroupsPanel,
  GroupInfoPanel,
} from '../features/ui/util/async_components'
import Block from '../components/block'
import Text from '../components/text'
import Divider from '../components/divider'
import Button from '../components/button'
import Badge from '../components/badge'

class GroupLayout extends ImmutablePureComponent {

  render() {
    const {
      children,
      group,
      groupId,
      relationships,
      title,
      moderationCount,
    } = this.props

    return (
      <Layout
        noRightSidebar
        showBackBtn
        title={title}
        page='group'
      >
        <Responsive max={BREAKPOINT_EXTRA_SMALL}>
          <div className={[_s.d, _s.w100PC].join(' ')}>

            <GroupHeader
              group={group}
              relationships={relationships}
              isXS
              moderationCount={moderationCount}
            >
              <WrappedBundle component={GroupInfoPanel} componentParams={{ group, noPanel: true }} />
            </GroupHeader>

            <div className={[_s.d, _s.w100PC, _s.z1].join(' ')}>
              {children}
            </div>

          </div>
        </Responsive>

        <Responsive min={BREAKPOINT_EXTRA_SMALL}>
          <div className={[_s.d, _s.w100PC, _s.pl15].join(' ')}>

            <GroupHeader
              group={group}
              relationships={relationships}
              moderationCount={moderationCount}
            />

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
                      page={`group.${groupId}`}
                      layout={[
                        <WrappedBundle key='group-layout-group-info-panel' component={GroupInfoPanel} componentParams={{ group }} />,
                        SignUpPanel,
                        GroupsPanel,
                        LinkFooter,
                      ]}
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

GroupLayout.propTypes = {
  children: PropTypes.node,
  group: ImmutablePropTypes.map,
  groupId: PropTypes.string,
  relationships: ImmutablePropTypes.map,
  title: PropTypes.string,
  moderationCount: PropTypes.number,
}

export default GroupLayout
