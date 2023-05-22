import React from 'react'
import PropTypes from 'prop-types'
import StatusList from '../components/status_list'

const ListTimeline = ({ params }) =>
  (<StatusList
    timelineId={`list:${params.id}`}
    endpoint={`/api/v1/timelines/list/${params.id}`}
    queue
    showAds
  />)

ListTimeline.propTypes = { params: PropTypes.object }

export default ListTimeline
