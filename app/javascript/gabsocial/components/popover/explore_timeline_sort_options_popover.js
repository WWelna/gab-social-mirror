import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { closePopover } from '../../actions/popover'
import { timelineSort } from '../../store/timelines'
import { exploreSorts } from '../../constants'
import PopoverLayout from './popover_layout'
import List from '../list'

const hideArrow = true
const timelineId = 'explore'

function ExploreTimelineSortOptionsPopover({
  sortByValue,
  isXS,
  onSort,
  onClosePopover,
}) {
  const items = exploreSorts.map(function({ key, title, subtitle }) {
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

const mapStateToProps = (state) => ({
  sortByValue: state.getIn(['timelines', timelineId, 'sortByValue']),
})

const mapDispatchToProps = (dispatch) => ({
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
}

export default connect(mapStateToProps, mapDispatchToProps)(ExploreTimelineSortOptionsPopover)
