import React from 'react'
import StatusList from '../components/status_list'

function StatusContextTimeline({params: { statusContextId }}) {
  const timelineId = `status_context:${statusContextId}`

  return (
    <StatusList
      showAds
      timelineId={timelineId}
      endpoint={`/api/v1/timelines/status_context/${statusContextId}`}
    />
  )
}

export default StatusContextTimeline
