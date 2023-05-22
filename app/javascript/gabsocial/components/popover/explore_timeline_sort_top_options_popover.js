import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { closePopover } from '../../actions/popover'
import { timelineSortTop } from '../../store/timelines'
import { EXPLORE_SORT_TOPS } from '../../constants'
import PopoverLayout from './popover_layout'
import List from '../list'

const hideArrow = true

function ExploreTimelineSortTopOptionsPopover({
  sortByTopValue,
  isXS,
  onSort,
  onClosePopover,
}) {
  const items = EXPLORE_SORT_TOPS.map(function({ key, title }) {
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
        scrollKey='explore_timeline_sorting_top_options'
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

ExploreTimelineSortTopOptionsPopover.propTypes = {
  sortByTopValue: PropTypes.string,
  isXS: PropTypes.bool,
  onClosePopover: PropTypes.func.isRequired,
  onSort: PropTypes.func.isRequired,
  timelineId: PropTypes.string,
}

export default connect(mapStateToProps, mapDispatchToProps)(ExploreTimelineSortTopOptionsPopover)
