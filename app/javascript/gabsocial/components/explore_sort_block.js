import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { openPopover } from '../actions/popover'
import {
  POPOVER_EXPLORE_TIMELINE_SORT_OPTIONS,
  POPOVER_EXPLORE_TIMELINE_SORT_TOP_OPTIONS,
  exploreSorts,
  exploreSortTops,
} from '../constants'
import SortBlock from '../components/sort_block'

const timelineId = 'explore'

function ExploreSortBlock ({
  sortByValue,
  sortByTopValue,
  onOpenSortingOptions,
  onOpenSortingTopOptions,
}) {
  const sort = exploreSorts.find(item => item.key === sortByValue)
  const top = exploreSortTops.find(item => item.key === sortByTopValue)
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

const mapStateToProps = (state) => ({
  sortByValue: state.getIn(['timelines', timelineId, 'sortByValue']),
  sortByTopValue: state.getIn(['timelines', timelineId, 'sortByTopValue']),
})

const mapDispatchToProps = (dispatch) => ({
  onOpenSortingOptions(targetRef) {
    dispatch(openPopover(POPOVER_EXPLORE_TIMELINE_SORT_OPTIONS, { targetRef }))
  },
  onOpenSortingTopOptions(targetRef) {
    dispatch(openPopover(POPOVER_EXPLORE_TIMELINE_SORT_TOP_OPTIONS, { targetRef }))
  },
})

ExploreSortBlock.propTypes = {
  sortByValue: PropTypes.string,
  sortByTopValue: PropTypes.string,
  onOpenSortingOptions: PropTypes.func,
  onOpenSortingTopOptions: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(ExploreSortBlock)
