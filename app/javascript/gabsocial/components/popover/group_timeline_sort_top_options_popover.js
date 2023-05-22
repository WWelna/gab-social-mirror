import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { closePopover } from '../../actions/popover'
import { timelineSortTop } from '../../store/timelines'
import { groupSortTops } from '../../constants'
import PopoverLayout from './popover_layout'
import List from '../list'

const hideArrow = true

function GroupTimelineSortTopOptionsPopover({
  sortByTopValue,
  isXS,
  onSort,
  onClosePopover,
}) {
  const items = groupSortTops.map(function({ key, title }) {
    return {
      hideArrow,
      isActive: sortByTopValue === key,
      title,
      onClick: () => onSort(key),
    }
  })
  return (
    <PopoverLayout
      width={160}
      isXS={isXS}
      onClose={onClosePopover}
    >
      <List
        size={isXS ? 'large' : 'small'}
        scrollKey='group_timeline_sorting_top_options'
        items={items}
      />
    </PopoverLayout>
  )
}

const mapStateToProps = (state, { timelineId }) => ({
  sortByTopValue: state.getIn(['timelines', timelineId, 'sortByTopValue']),
})

const mapDispatchToProps = (dispatch, { timelineId }) => ({
  onSort(sortByTopValue) {
    dispatch(timelineSortTop(timelineId, sortByTopValue))
    dispatch(closePopover())
  },
  onClosePopover: () => dispatch(closePopover()),
})

GroupTimelineSortTopOptionsPopover.propTypes = {
  timelineId: PropTypes.string.isRequired,
  sortByTopValue: PropTypes.string,
  isXS: PropTypes.bool,
  onClosePopover: PropTypes.func.isRequired,
  onSort: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupTimelineSortTopOptionsPopover)
