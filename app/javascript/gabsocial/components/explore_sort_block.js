import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { openPopover } from '../actions/popover'
import {
  POPOVER_EXPLORE_TIMELINE_SORT_OPTIONS,
  POPOVER_EXPLORE_TIMELINE_SORT_TOP_OPTIONS,
  EXPLORE_SORTS,
  EXPLORE_SORT_TOPS,
} from '../constants'
import SortBlock from '../components/sort_block'

const timelineId = 'explore'

function ExploreSortBlock ({
  sortByValue,
  sortByTopValue,
  onOpenSortingOptions,
  onOpenSortingTopOptions,
}) {
  const sort = EXPLORE_SORTS.find(item => item.key === sortByValue)
  const top = EXPLORE_SORT_TOPS.find(item => item.key === sortByTopValue)
  const sortValueTitle = sort && sort.title
  const sortValueTopTitle = top && top.title
  return (
    <SortBlock
      value={sortValueTitle}
      subValue={sortValueTopTitle}
      onClickValue={onOpenSortingOptions}
      onClickSubValue={onOpenSortingTopOptions}
    />
  )
}

const mapStateToProps = (state, { timelineId }) => ({
  sortByValue: state.getIn(['timelines', timelineId, 'sortByValue']),
  sortByTopValue: state.getIn(['timelines', timelineId, 'sortByTopValue']),
})

const mapDispatchToProps = (dispatch, { timelineId }) => ({
  onOpenSortingOptions(targetRef) {
    dispatch(openPopover(POPOVER_EXPLORE_TIMELINE_SORT_OPTIONS, { targetRef, timelineId }))
  },
  onOpenSortingTopOptions(targetRef) {
    dispatch(openPopover(POPOVER_EXPLORE_TIMELINE_SORT_TOP_OPTIONS, { targetRef, timelineId }))
  },
})

ExploreSortBlock.propTypes = {
  timelineId: PropTypes.string,
  sortByValue: PropTypes.string,
  sortByTopValue: PropTypes.string,
  onOpenSortingOptions: PropTypes.func,
  onOpenSortingTopOptions: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(ExploreSortBlock)
