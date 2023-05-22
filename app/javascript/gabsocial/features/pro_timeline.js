import React from 'react'
import StatusList from '../components/status_list'

const ProTimeline = () =>
  (<StatusList
    timelineId='pro'
    endpoint='/api/v1/timelines/pro'
    queue
    showAds
  />)

export default ProTimeline
