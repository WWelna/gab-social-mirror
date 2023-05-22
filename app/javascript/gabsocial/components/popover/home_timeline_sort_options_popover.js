import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { closePopover } from '../../actions/popover'
import { setHomeTimelineSort } from '../../actions/timelines'
import {
  HOME_TIMELINE_SORTING_TYPE_NEWEST,
  HOME_TIMELINE_SORTING_TYPE_NO_REPOSTS,
  HOME_TIMELINE_SORTING_TYPE_TOP,
} from '../../constants'
import PopoverLayout from './popover_layout'
import List from '../list'

class HomeTimelineSortOptionsPopover extends React.PureComponent {

  handleOnClick = (type) => {
    this.props.onSort(type)
  }

  handleOnClosePopover = () => {
    this.props.onClosePopover()
  }

  render() {
    const { sorting, isXS } = this.props

    const items = [
      {
        hideArrow: true,
        isActive: !sorting || sorting === HOME_TIMELINE_SORTING_TYPE_NEWEST,
        title: 'Newest',
        subtitle: 'See all posts, reposts in chronological order',
        onClick: () => this.handleOnClick(HOME_TIMELINE_SORTING_TYPE_NEWEST),
      },
      {
        hideArrow: true,
        isActive: sorting === HOME_TIMELINE_SORTING_TYPE_NO_REPOSTS,
        title: 'Newest, no reposts',
        subtitle: 'See all posts in chronological order',
        onClick: () => this.handleOnClick(HOME_TIMELINE_SORTING_TYPE_NO_REPOSTS),
      },
      {
        hideArrow: true,
        isActive: sorting === HOME_TIMELINE_SORTING_TYPE_TOP,
        title: 'Top',
        subtitle: 'See all posts sorted by most liked, commented and reposted',
        onClick: () => this.handleOnClick(HOME_TIMELINE_SORTING_TYPE_TOP),
      },
    ]

    return (
      <PopoverLayout
        width={280}
        isXS={isXS}
        onClose={this.handleOnClosePopover}
      >
        <List
          size={isXS ? 'large' : 'small'}
          scrollKey='home_timeline_sorting_options'
          items={items}
        />
      </PopoverLayout>
    )
  }
}

const mapStateToProps = (state) => ({
  sorting: state.getIn(['timelines', 'home', 'sortByValue']),
})

const mapDispatchToProps = (dispatch) => ({
  onSort(sort) {
    dispatch(setHomeTimelineSort(sort))
    dispatch(closePopover())
  },
  onClosePopover: () => dispatch(closePopover()),
})

HomeTimelineSortOptionsPopover.propTypes = {
  sorting: PropTypes.string.isRequired,
  intl: PropTypes.object.isRequired,
  isXS: PropTypes.bool,
  onClosePopover: PropTypes.func.isRequired,
  onSort: PropTypes.func.isRequired,
  options: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeTimelineSortOptionsPopover)