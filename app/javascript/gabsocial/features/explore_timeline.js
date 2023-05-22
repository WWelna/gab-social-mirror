import React from 'react'
import ExploreSortBlock from '../components/explore_sort_block'
import StatusList from '../components/status_list'
import ExploreTimelinePills from '../components/explore_timelines_pills'
import {
  EXPLORE_SORTS,
  EXPLORE_SORT_TOPS,
  EXPLORE_SORT_CREATE_PARAMS,
} from '../constants'

const ExploreTimeline = () => (
  <>
    <ExploreTimelinePills />
    <ExploreSortBlock timelineId='explore' />
    <StatusList
      timelineId='explore'
      endpoint="/api/v1/timelines/explore"
      showInjections
      paginationLoggedIn
      maxPages={8}
      showAds
      sorts={EXPLORE_SORTS}
      topSorts={EXPLORE_SORT_TOPS}
      createParams={EXPLORE_SORT_CREATE_PARAMS}
    />
  </>
)

export default ExploreTimeline
