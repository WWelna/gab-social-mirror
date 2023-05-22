import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { closePopover } from '../../actions/popover'
import {
  changeMarketplaceListingDashboardStatus,
} from '../../actions/marketplace_listing_dashboard'
import {
  MARKETPLACE_LISTING_STATUS_PENDING_REVIEW,
  MARKETPLACE_LISTING_STATUS_PENDING_CHANGES,
  MARKETPLACE_LISTING_STATUS_REJECTED,
  MARKETPLACE_LISTING_STATUS_APPROVED,
  MARKETPLACE_LISTING_STATUS_RUNNING,
  MARKETPLACE_LISTING_STATUS_EXPIRED,
  MARKETPLACE_LISTING_STATUS_SOLD,
  MARKETPLACE_LISTING_STATUS_ARCHIVED,
} from '../../constants'
import PopoverLayout from './popover_layout'
import List from '../list'

class MarketplaceListingDashboardStatusOptionsPopover extends React.Component {

  handleOnClick = (type) => {
    const { activeStatuses, onChange } = this.props
    const addOrRemove = !(activeStatuses.indexOf(type) > -1)
    onChange(type, addOrRemove)

    if (type === null) {
      this.handleOnClosePopover()
    }
  }

  handleOnClosePopover = () => {
    this.props.onClosePopover()
  }

  render() {
    const {
      isXS,
      activeStatuses,
    } = this.props
    
    const items = [
      {
        hideArrow: true,
        isActive: activeStatuses.count() === 0,
        title: 'All',
        onClick: () => this.handleOnClick(null),
      },
      {
        hideArrow: true,
        isActive: activeStatuses.indexOf(MARKETPLACE_LISTING_STATUS_PENDING_REVIEW) > -1,
        title: 'Pending Review',
        onClick: () => this.handleOnClick(MARKETPLACE_LISTING_STATUS_PENDING_REVIEW),
      },
      {
        hideArrow: true,
        isActive: activeStatuses.indexOf(MARKETPLACE_LISTING_STATUS_PENDING_CHANGES) > -1,
        title: 'Pending Changes',
        onClick: () => this.handleOnClick(MARKETPLACE_LISTING_STATUS_PENDING_CHANGES),
      },
      {
        hideArrow: true,
        isActive: activeStatuses.indexOf(MARKETPLACE_LISTING_STATUS_REJECTED) > -1,
        title: 'Rejected',
        onClick: () => this.handleOnClick(MARKETPLACE_LISTING_STATUS_REJECTED),
      },
      {
        
        hideArrow: true,
        isActive: activeStatuses.indexOf(MARKETPLACE_LISTING_STATUS_APPROVED) > -1,
        title: 'Approved',
        onClick: () => this.handleOnClick(MARKETPLACE_LISTING_STATUS_APPROVED),
      },
      {
        hideArrow: true,
        isActive: activeStatuses.indexOf(MARKETPLACE_LISTING_STATUS_RUNNING) > -1,
        title: 'Running',
        onClick: () => this.handleOnClick(MARKETPLACE_LISTING_STATUS_RUNNING),
      },
      {
        hideArrow: true,
        isActive: activeStatuses.indexOf(MARKETPLACE_LISTING_STATUS_EXPIRED) > -1,
        title: 'Expired',
        onClick: () => this.handleOnClick(MARKETPLACE_LISTING_STATUS_EXPIRED),
      },
      {
        hideArrow: true,
        isActive: activeStatuses.indexOf(MARKETPLACE_LISTING_STATUS_SOLD) > -1,
        title: 'Sold',
        onClick: () => this.handleOnClick(MARKETPLACE_LISTING_STATUS_SOLD),
      },
      {
        hideArrow: true,
        isActive: activeStatuses.indexOf(MARKETPLACE_LISTING_STATUS_ARCHIVED) > -1,
        title: 'Archived',
        onClick: () => this.handleOnClick(MARKETPLACE_LISTING_STATUS_ARCHIVED),
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
          scrollKey='mpl_dashbboard_sorting_options'
          items={items}
        />
      </PopoverLayout>
    )
  }
}

const mapStateToProps = (state) => ({
  activeStatuses: state.getIn(['marketplace_listing_dashboard', 'active_search_statuses']),
})

const mapDispatchToProps = (dispatch) => ({
  onChange(status, addOrRemove) {
    dispatch(changeMarketplaceListingDashboardStatus(status, addOrRemove))
  },
  onClosePopover: () => dispatch(closePopover()),
})

MarketplaceListingDashboardStatusOptionsPopover.propTypes = {
  sorting: PropTypes.string.isRequired,
  isXS: PropTypes.bool,
  onClosePopover: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(MarketplaceListingDashboardStatusOptionsPopover)