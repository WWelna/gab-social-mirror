import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { closePopover } from '../../actions/popover'
import { sortLists } from '../../actions/lists'
import {
  LISTS_SORTING_TYPE_ALPHABETICAL,
  LISTS_SORTING_TYPE_SUBS_DESC,
} from '../../constants'
import PopoverLayout from './popover_layout'
import List from '../list'

class ListsSortOptionsPopover extends React.PureComponent {

  handleOnSortLists = (sortType) => {
    this.handleOnClosePopover()
    this.props.onSortLists(this.props.tab, sortType)
  }

  handleOnClosePopover = () => {
    this.props.onClosePopover()
  }

  render() {
    const { isXS } = this.props

    const listItems = [
      {
        hideArrow: true,
        title: 'Alphabetically',
        onClick: () => this.handleOnSortLists(LISTS_SORTING_TYPE_ALPHABETICAL),
        isActive: false,
      },
      {
        hideArrow: true,
        title: 'Subscriber Count',
        onClick: () => this.handleOnSortLists(LISTS_SORTING_TYPE_SUBS_DESC),
        isActive: false,
      },
    ]

    return (
      <PopoverLayout
        width={210}
        isXS={isXS}
        onClose={this.handleOnClosePopover}
      >
        <List
          scrollKey='lists_sort_options'
          items={listItems}
          size={isXS ? 'large' : 'small'}
        />
      </PopoverLayout>
    )
  }

}

const mapDispatchToProps = (dispatch) => ({
  onSortLists: (tab, sortType) => dispatch(sortLists(tab, sortType)),
  onClosePopover:() => dispatch(closePopover()),
})

ListsSortOptionsPopover.defaultProps = {
  tab: PropTypes.string.isRequired,
  onClosePopover: PropTypes.func.isRequired,
  onSortLists: PropTypes.func.isRequired,
}

export default connect(null, mapDispatchToProps)(ListsSortOptionsPopover)