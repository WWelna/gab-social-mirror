import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { me } from '../initial_state'
import { defineMessages, injectIntl } from 'react-intl'
import PageTitle from '../features/ui/util/page_title'
import Text from '../components/text'
import DefaultLayout from '../layouts/default_layout'
import GroupsCollection from '../features/groups_collection'
import WrappedBundle from '../features/ui/util/wrapped_bundle'
import {
  GroupsPanel,
  LinkFooter,
  GabAdTopPanel,
  GabAdBottomPanel,
} from '../features/ui/util/async_components'

class GroupsPage extends React.PureComponent {

  render() {
    const {
      activeTab,
      intl,
      children,
    } = this.props

    const dontShowChildren = (activeTab === 'timeline' && !me)

    const tabs = !!me ? [
      {
        title: intl.formatMessage(messages.myGroupsTimeline),
        to: '/groups',
      },
      {
        title: intl.formatMessage(messages.myGroups),
        to: '/groups/browse/member',
      },
      {
        title: intl.formatMessage(messages.featured),
        to: '/groups/browse/featured',
      },
      {
        title: intl.formatMessage(messages.categories),
        to: '/groups/browse/categories',
      },
      {
        title: intl.formatMessage(messages.admin),
        to: '/groups/browse/admin',
      },
    ] : []

    const title = intl.formatMessage(messages.groups)

    const layout = [
      <WrappedBundle key='groups-page-ad-panel' component={GabAdTopPanel} componentParams={{ pageKey: 'groups.sidebar', position: 1 }} />,
    ]
    if (!!me) {
      layout.push(<WrappedBundle key='groups-page-groups-panel' component={GroupsPanel} componentParams={{ groupType: 'member' }} />)
    }
    layout.push(LinkFooter)
    layout.push(<WrappedBundle key='home-page-ad-panel-bottom' component={GabAdBottomPanel} componentParams={{ pageKey: 'home.sidebar.bottom', position: 2 }} />)

    return (
      <DefaultLayout
        title={title}
        actions={[
          {
            attrTitle: 'Create',
            icon: 'add',
            to: '/groups/create',
          },
          {
            icon: 'search',
            to: '/search',
          },
        ]}
        tabs={tabs}
        page='groups'
        layout={layout}
      >
        <PageTitle path={title} />

        {
          !dontShowChildren && children
        }

        {
          dontShowChildren &&
          <GroupsCollection activeTab='featured' />
        }
      </DefaultLayout>
    )
  }

}

const messages = defineMessages({
  groups: { id: 'groups', defaultMessage: 'Groups' },
  new: { id: 'new', defaultMessage: 'Recently Added Groups' },
  featured: { id: 'featured', defaultMessage: 'Featured Groups' },
  myGroupsTimeline: { id: 'my_groups_timeline', defaultMessage: 'Timeline' },
  myGroups: { id: 'my_groups', defaultMessage: 'My Groups' },
  categories: { id: 'categories', defaultMessage: 'Categories' },
  admin: { id: 'admin', defaultMessage: 'Admin' },
})

GroupsPage.propTypes = {
  activeTab: PropTypes.string.isRequired,
  intl: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
}

export default injectIntl(connect()(GroupsPage))
