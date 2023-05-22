import React from 'react'
import PropTypes from 'prop-types'
import StatusList from '../components/status_list'
import GroupSortBlock from '../components/group_sort_block'
import {
  GROUP_SORTS,
  GROUP_SORT_TOPS,
  EXPLORE_SORT_CREATE_PARAMS,
} from '../constants'

function GroupCollectionTimeline({ collectionType }) {
  const timelineId = `group_collection:${collectionType}`
  return (<>
    <GroupSortBlock timelineId={timelineId} collectionType={collectionType} />
    <StatusList
      timelineId={timelineId}
      endpoint={`/api/v1/timelines/group_collection/${collectionType}`}
      createParams={EXPLORE_SORT_CREATE_PARAMS}
      sorts={GROUP_SORTS}
      topSorts={GROUP_SORT_TOPS}
      showAds
    />
  </>)
}

GroupCollectionTimeline.propTypes = { collectionType: PropTypes.string }

export default GroupCollectionTimeline;
