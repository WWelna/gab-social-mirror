import React from 'react'
import PropTypes from 'prop-types'
import StatusList from '../components/status_list'
import ModerationActionBar from '../components/moderation_action_bar'

function GroupModerationTimeline({ params }) {
  const groupId = params.id
  const timelineId = `group_moderation:${groupId}`
  return (
    <StatusList
      timelineId={timelineId}
      endpoint={`/api/v1/groups/${groupId}/moderation/`}
      afterStatus={ModerationActionBar}
      showActionBar={false}
      showEllipsis={false}
      showSpam={true}
      disableCanShow={true}
      maxPages={2}
    />
  )
}

GroupModerationTimeline.propTypes = { params: PropTypes.object }

export default GroupModerationTimeline;
