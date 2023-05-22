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
    // see app/controllers/api/v1/timelines/group_collection_controller.rb
    return { sort_by: `top_${sortByTopValue}` }
  }
  return { sort_by: sortByValue }
}

function GroupCollectionTimeline({ collectionType }) {
  const timelineId = `group_collection:${collectionType}`
  return (<>
    <GroupSortBlock timelineId={timelineId} collectionType={collectionType} />
    <StatusList
      timelineId={timelineId}
      endpoint={`/api/v1/timelines/group_collection/${collectionType}`}
      createParams={createParams}
      sorts={groupSorts}
      topSorts={groupSortTops}
      showAds
    />
  </>)
}

GroupCollectionTimeline.propTypes = { collectionType: PropTypes.string }

export default GroupCollectionTimeline;
