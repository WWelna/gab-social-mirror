import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { defineMessages, injectIntl } from 'react-intl'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { fetchGroup } from '../actions/groups'
import PageTitle from '../features/ui/util/page_title'
import GroupLayout from '../layouts/group_layout'
import ComposeForm from '../features/compose/components/compose_form'
import Block from '../components/block'
import Text from '../components/text'
import Badge from '../components/badge'
import ColumnIndicator from '../components/column_indicator'

class GroupPage extends ImmutablePureComponent {
  componentDidMount() {
    this.props.dispatch(fetchGroup(this.props.params.id))
  }

  componentDidUpdate(prevProps) {
    if (prevProps.params.id !== this.props.params.id) {
      this.props.dispatch(fetchGroup(this.props.params.id))
    }
  }

  render() {
    const {
      intl,
      children,
      group,
      relationships,
      isTimeline,
      moderationCount,
      myWaitingCount
    } = this.props

    const groupTitle = !!group ? group.get('title') : ''
    const groupId = !!group ? group.get('id') : undefined

    const isPrivate = !!group ? group.get('is_private') : false
    const isMember = !!relationships ? relationships.get('member') : false
    const unavailable = isPrivate && !isMember

    if (!!group) {
      if (group.get('archived')) return null
    }

    const myStatsModerationMessage = typeof myWaitingCount === 'number' &&
      myWaitingCount > 0 && (
        <div className={_s.mb5}>
          <Block>
            <Text className={[_s.px10, _s.py10].join(' ')}>
              <Badge text={myWaitingCount} /> messages are awaiting approval by{' '}
              {groupTitle} moderators.
            </Text>
          </Block>
        </div>
      )

    return (
      <GroupLayout
        title={'Group'}
        group={group}
        groupId={groupId}
        relationships={relationships}
        moderationCount={moderationCount}
      >
        <PageTitle path={[groupTitle, intl.formatMessage(messages.group)]} />

        {!!relationships && isTimeline && isMember && (
          <React.Fragment>
            <ComposeForm composerId={`group-${groupId}`} groupId={groupId} />
          </React.Fragment>
        )}

        {unavailable && (
          <Block>
            <ColumnIndicator
              type="error"
              message={intl.formatMessage(messages.groupPrivate)}
            />
          </Block>
        )}

        {myStatsModerationMessage}

        {!unavailable && children}
      </GroupLayout>
    )
  }
}

const messages = defineMessages({
  group: { id: 'group', defaultMessage: 'Group' },
  groupPrivate: {
    id: 'group_private',
    defaultMessage:
      'This group is private. You must request to join in order to view this group.'
  }
})

const mapStateToProps = (state, { params: { id } }) => ({
  group: state.getIn(['groups', id]),
  relationships: state.getIn(['group_relationships', id]),
  moderationCount: state.getIn([
    'group_lists',
    'group_moderation',
    id,
    'count'
  ]),
  myWaitingCount: state.getIn(['group_lists', 'my_stats', id, 'count'])
})

GroupPage.propTypes = {
  intl: PropTypes.object.isRequired,
  group: ImmutablePropTypes.map,
  children: PropTypes.node.isRequired,
  relationships: ImmutablePropTypes.map,
  dispatch: PropTypes.func.isRequired
}

export default injectIntl(connect(mapStateToProps)(GroupPage))
