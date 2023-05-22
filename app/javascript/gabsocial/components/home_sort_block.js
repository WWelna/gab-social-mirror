import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { openPopover } from '../actions/popover'
import {
  POPOVER_HOME_TIMELINE_SORT_OPTIONS,
	HOME_TIMELINE_SORTING_TYPE_NEWEST,
  HOME_TIMELINE_SORTING_TYPE_NO_REPOSTS,
  HOME_TIMELINE_SORTING_TYPE_TOP,
} from '../constants'
import SortBlock from '../components/sort_block'

class HomeSortBlock extends React.PureComponent {

  handleOnClickValue = (btn) => {
    this.props.onOpenSortingOptions(btn)
  }

  render() {
    const { sortByValue } = this.props

    let sortValueTitle = ''
    
    switch (sortByValue) {
			case HOME_TIMELINE_SORTING_TYPE_NO_REPOSTS:
				sortValueTitle = 'Newest, no reposts'
				break
      case HOME_TIMELINE_SORTING_TYPE_TOP:
        sortValueTitle = 'Top posts from 24 hours'
				break
      case HOME_TIMELINE_SORTING_TYPE_NEWEST:
      default:
			  sortValueTitle = 'Newest'
				break
		}
    
    return <SortBlock value={sortValueTitle} onClickValue={this.handleOnClickValue} />
  }

}

const mapStateToProps = (state) => ({
	sortByValue: state.getIn(['timelines', 'home', 'sortByValue']),
})

const mapDispatchToProps = (dispatch) => ({
	onOpenSortingOptions(targetRef) {
		dispatch(openPopover(POPOVER_HOME_TIMELINE_SORT_OPTIONS, {
			targetRef,
			position: 'bottom',
		}))
	},
})

HomeSortBlock.propTypes = {
	sortByValue: PropTypes.string,
	onOpenSortingOptions: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeSortBlock)