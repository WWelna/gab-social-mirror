import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { defineMessages, injectIntl } from 'react-intl'
import PanelLayout from './panel_layout'
import GroupListItem from '../group_list_item'
import ScrollableList from '../scrollable_list'
import GroupListItemPlaceholder from '../placeholder/group_list_item_placeholder'

class GroupsPanel extends ImmutablePureComponent {
  render() {
    const {
      intl,
      groupIds,
      groupType,
    } = this.props

    const count = !!groupIds ? groupIds.count() : 0
    const maxCount = 12

    if (count === 0) return null

    return (
      <PanelLayout
        title={intl.formatMessage(groupType === 'member' ? messages.memberTitle : messages.featuredTitle)}
        headerButtonTitle={intl.formatMessage(messages.show_all)}
        headerButtonTo={groupType === 'member' ? '/groups/browse/member' : '/groups/browse/featured'}
        footerButtonTitle={count > maxCount ? intl.formatMessage(messages.show_all) : undefined}
        footerButtonTo={count > maxCount ? '/groups' : undefined}
        noPadding
      >
        <ScrollableList
          scrollKey='groups_panel'
          placeholderComponent={GroupListItemPlaceholder}
          placeholderCount={6}
        >
          {
            groupIds && groupIds.slice(0, maxCount).map((groupId, i) => (
              <GroupListItem
                key={`group-panel-item-${groupId}`}
                id={groupId}
                isLast={groupIds.count() - 1 === i}
              />
            ))
          }
        </ScrollableList>
      </PanelLayout>
    )
  }

}

const messages = defineMessages({
  memberTitle: { id: 'groups.sidebar-panel.member_title', defaultMessage: 'Groups you\'re in' },
  featuredTitle: { id: 'groups.sidebar-panel.featured_title', defaultMessage: 'Featured Groups' },
  show_all: { id: 'groups.sidebar-panel.show_all', defaultMessage: 'Show all' },
})

const mapStateToProps = (state, { groupType }) => ({
  groupIds: state.getIn(['group_lists', groupType, 'items']),
})

GroupsPanel.propTypes = {
  groupIds: ImmutablePropTypes.list,
  isLazy: PropTypes.bool, 
  shouldLoad: PropTypes.bool,
  groupType: PropTypes.string,
}

GroupsPanel.defaultProps = {
  groupType: 'member'
}

export default injectIntl(connect(mapStateToProps)(GroupsPanel))
