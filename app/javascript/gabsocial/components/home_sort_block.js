import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { openPopover } from '../actions/popover'
import {
  POPOVER_HOME_TIMELINE_SORT_OPTIONS,
  HOME_SORTS,
} from '../constants'
import SortBlock from '../components/sort_block'

const timelineId = 'home'

function HomeSortBlock({ sortByValue, onOpenSortingOptions }) {
  const sort = HOME_SORTS.find(item => item.key === sortByValue)
  const sortValueTitle = sort && sort.title
  return (
    <SortBlock
      value={sortValueTitle}
      onClickValue={onOpenSortingOptions}
    />
  )
}

const mapStateToProps = (state) => ({
  sortByValue: state.getIn(['timelines', timelineId, 'sortByValue']),
})

const mapDispatchToProps = (dispatch) => ({
  onOpenSortingOptions(targetRef) {
    dispatch(openPopover(POPOVER_HOME_TIMELINE_SORT_OPTIONS, {
      targetRef,
      timelineId,
    }))
  },
})

HomeSortBlock.propTypes = {
  sortByValue: PropTypes.string,
  onOpenSortingOptions: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeSortBlock)
