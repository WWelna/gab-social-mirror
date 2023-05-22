import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { closePopover } from '../../actions/popover'
import { timelineSort } from '../../store/timelines'
import { groupSorts } from '../../constants'
import PopoverLayout from './popover_layout'
import List from '../list'

const hideArrow = true

function GroupTimelineSortOptionsPopover({
  sortByValue,
  collectionType,
  isXS,
  onSort,
  onClosePopover,
}) {
  const items = groupSorts.map(function({ key, title, subtitle, hideForFeatured }) {
    if (collectionType === 'featured' && hideForFeatured) {
      return false
    }
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
        scrollKey='group_timeline_sorting_options'
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

GroupTimelineSortOptionsPopover.propTypes = {
  sortByValue: PropTypes.string,
  collectionType: PropTypes.string,
  isXS: PropTypes.bool,
  onClosePopover: PropTypes.func.isRequired,
  onSort: PropTypes.func.isRequired,
  timelineId: PropTypes.string.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupTimelineSortOptionsPopover)
