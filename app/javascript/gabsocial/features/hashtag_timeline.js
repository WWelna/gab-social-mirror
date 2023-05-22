import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import StatusList from '../components/status_list'

const emptyMessage = (
  <FormattedMessage
    id='empty_column.hashtag'
    defaultMessage='There is nothing in this hashtag yet.'
  />
)

const HashtagTimeline = ({ params }) =>
  (<StatusList
    timelineId={`hashtag:${params.id}`}
    endpoint={`/api/v1/timelines/tag/${params.id}`}
    emptyMessage={emptyMessage}
    queue
  />)

HashtagTimeline.propTypes = { params: PropTypes.object }

export default HashtagTimeline;
