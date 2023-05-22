import React from 'react'
import PropTypes from 'prop-types'
import StatusList from '../components/status_list'
import GroupSortBlock from '../components/group_sort_block'
import {
  GROUP_TIMELINE_SORTING_TYPE_TOP,
  groupSorts,
  groupSortTops,
} from '../constants'

function createParams({ sortByValue, sortByTopValue }) {
  if (sortByValue === GROUP_TIMELINE_SORTING_TYPE_TOP) {
    // see app/controllers/api/v1/timelines/group_controller.rb
    return { sort_by: `top_${sortByTopValue}` }
  }
  return { sort_by: sortByValue }
}

function GroupTimeline({ params }) {
  const timelineId = `group:${params.id}`
  return (<>
    <GroupSortBlock timelineId={timelineId} />
    <StatusList
      timelineId={timelineId}
      endpoint={`/api/v1/timelines/group/${params.id}`}
      pinsEndpoint={`/api/v1/timelines/group_pins/${params.id}`}
      showPins
      showAds
      sorts={groupSorts}
      topSorts={groupSortTops}
      createParams={createParams}
    />
  </>)
}

GroupTimeline.propTypes = { params: PropTypes.object }

export default GroupTimeline;
