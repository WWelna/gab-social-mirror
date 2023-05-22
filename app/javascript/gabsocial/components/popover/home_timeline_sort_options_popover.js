import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { closePopover } from '../../actions/popover'
import { timelineSort } from '../../store/timelines'
import { HOME_SORTS } from '../../constants'
import PopoverLayout from './popover_layout'
import List from '../list'

const hideArrow = true

function HomeTimelineSortOptionsPopover({
  sortByValue,
  isXS,
  onSort,
  onClosePopover,
}) {
  const items = HOME_SORTS.map(function({ key, title, subtitle }) {
    return {
      hideArrow,
      isActive: sortByValue === key,
      title,
      subtitle,
      onClick: () => onSort(key),
    }
  })

  return (
    <PopoverLayout
      width={280}
      isXS={isXS}
      onClose={onClosePopover}
    >
      <List
        size={isXS ? 'large' : 'small'}
        scrollKey='home_timeline_sorting_options'
        items={items}
      />
    </PopoverLayout>
  )
}

const mapStateToProps = (state) => ({
  sortByValue: state.getIn(['timelines', 'home', 'sortByValue']),
})

const mapDispatchToProps = (dispatch) => ({
  onSort(sortByValue) {
    dispatch(timelineSort('home', sortByValue))
    dispatch(closePopover())
  },
  onClosePopover: () => dispatch(closePopover()),
})

HomeTimelineSortOptionsPopover.propTypes = {
  sortByValue: PropTypes.string,
  isXS: PropTypes.bool,
  onClosePopover: PropTypes.func.isRequired,
  onSort: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeTimelineSortOptionsPopover)
