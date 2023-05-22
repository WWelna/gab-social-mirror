import React from 'react'
import StatusList from '../components/status_list'
import ExploreTimelinePills from '../components/explore_timelines_pills'
import ResponsiveClassesComponent from './ui/util/responsive_classes_component'
import GroupSortBlock from '../components/group_sort_block'
import {
  PRO_POLLS_TIMELINE_SORTS,
  GROUP_SORT_TOPS,
  EXPLORE_SORT_CREATE_PARAMS,
} from '../constants'

function PollsTimeline() {
  return (
    <>
      <ResponsiveClassesComponent classNamesXS={[_s.d, _s.pt10].join(' ')}>
        <ExploreTimelinePills />
      </ResponsiveClassesComponent>
      <GroupSortBlock timelineId='polls' />
      <StatusList
        showAds
        timelineId='polls'
        endpoint='/api/v1/timelines/polls'
        sorts={PRO_POLLS_TIMELINE_SORTS}
        topSorts={GROUP_SORT_TOPS}
        createParams={EXPLORE_SORT_CREATE_PARAMS}
      />
    </>
  )
}

export default PollsTimeline
