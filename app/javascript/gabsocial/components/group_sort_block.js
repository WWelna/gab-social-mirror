import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { openPopover } from '../actions/popover'
import {
  POPOVER_GROUP_TIMELINE_SORT_OPTIONS,
  POPOVER_GROUP_TIMELINE_SORT_TOP_OPTIONS,
  groupSorts,
  groupSortTops,
} from '../constants'
import SortBlock from '../components/sort_block'

function GroupSortBlock ({
  sortByValue,
  sortByTopValue,
  onOpenSortingOptions,
  onOpenSortingTopOptions,
}) {
  const sort = groupSorts.find(item => item.key === sortByValue)
  const top = groupSortTops.find(item => item.key === sortByTopValue)
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

const mapDispatchToProps = (dispatch, { timelineId, collectionType }) => ({
  onOpenSortingOptions(targetRef) {
    dispatch(openPopover(POPOVER_GROUP_TIMELINE_SORT_OPTIONS, {
      targetRef,
      timelineId,
      collectionType,
    }))
  },
  onOpenSortingTopOptions(targetRef) {
    dispatch(openPopover(POPOVER_GROUP_TIMELINE_SORT_TOP_OPTIONS, {
      targetRef,
      timelineId,
      collectionType,
    }))
  },
})

GroupSortBlock.propTypes = {
  collectionType: PropTypes.string,
  sortByValue: PropTypes.string,
  sortByTopValue: PropTypes.string,
  onOpenSortingOptions: PropTypes.func,
  onOpenSortingTopOptions: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupSortBlock)
