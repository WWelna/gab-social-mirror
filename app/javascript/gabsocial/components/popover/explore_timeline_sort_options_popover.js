import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { closePopover } from '../../actions/popover'
import { timelineSort } from '../../store/timelines'
import { EXPLORE_SORTS } from '../../constants'
import PopoverLayout from './popover_layout'
import List from '../list'

const hideArrow = true

function ExploreTimelineSortOptionsPopover({
  sortByValue,
  isXS,
  onSort,
  onClosePopover,
}) {
  const items = EXPLORE_SORTS.map(function({ key, title, subtitle }) {
    return {
      hideArrow,
      isActive: sortByValue === key,
      title,
      subtitle,
      onClick: () => onSort(key),
    }
  }).filter(Boolean)
  return (
    <PopoverLayout
      width={280}
      isXS={isXS}
      onClose={onClosePopover}
    >
      <List
        size={isXS ? 'large' : 'small'}
        scrollKey='explore_timeline_sorting_options'
        items={items}
      />
    </PopoverLayout>
  )
}

const mapStateToProps = (state, { timelineId }) => ({
  sortByValue: state.getIn(['timelines', timelineId, 'sortByValue']),
})

const mapDispatchToProps = (dispatch, { timelineId }) => ({
  onSort(sortByValue) {
    dispatch(timelineSort(timelineId, sortByValue))
    dispatch(closePopover())
  },
  onClosePopover: () => dispatch(closePopover()),
})

ExploreTimelineSortOptionsPopover.propTypes = {
  sortByValue: PropTypes.string,
  collectionType: PropTypes.string,
  isXS: PropTypes.bool,
  onClosePopover: PropTypes.func.isRequired,
  onSort: PropTypes.func.isRequired,
  timelineId: PropTypes.string,
}

export default connect(mapStateToProps, mapDispatchToProps)(ExploreTimelineSortOptionsPopover)
