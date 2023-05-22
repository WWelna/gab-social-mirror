import React from 'react'
import ExploreSortBlock from '../components/explore_sort_block'
import StatusList from '../components/status_list'
import {
  GROUP_TIMELINE_SORTING_TYPE_TOP,
  exploreSorts,
  exploreSortTops,
} from '../constants'

const timelineId = 'explore'

function createParams({ sortByValue, sortByTopValue }) {
  if (sortByValue === GROUP_TIMELINE_SORTING_TYPE_TOP) {
    // see app/controllers/api/v1/timelines/explore_controller.rb
    return { sort_by: `top_${sortByTopValue}` }
  }
  return { sort_by: sortByValue }
}

const ExploreTimeline = () =>
  (<>
    <ExploreSortBlock />
    <StatusList
      timelineId={timelineId}
      endpoint='/api/v1/timelines/explore'
      paginationLoggedIn
      maxPages={8}
      showPromoted
      showAds
      sorts={exploreSorts}
      topSorts={exploreSortTops}
      createParams={createParams}
    />
  </>)

export default ExploreTimeline;
