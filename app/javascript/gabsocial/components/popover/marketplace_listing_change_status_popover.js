import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { openModal } from '../../actions/modal'
import { closePopover } from '../../actions/popover'
import {
  setMarketplaceListingStatus,
} from '../../actions/marketplace_listings'
import {
  MODAL_CONFIRM,
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

const STATUS_CHANGE_TITLES = {
  sold: {
    id: MARKETPLACE_LISTING_STATUS_SOLD,
    title: 'Sold',
    subtitle: 'You will only be able to archive from here',
  },
  archived: {
    id: MARKETPLACE_LISTING_STATUS_ARCHIVED,
    title: 'Archive',
    subtitle: 'You cannot re-open after archiving.',
  },
  running: {
    id: MARKETPLACE_LISTING_STATUS_RUNNING,
    title: 'Running',
    subtitle: 'Show your listing in Gab Marketplace.',
  },
  approved: {
    id: MARKETPLACE_LISTING_STATUS_APPROVED,
    title: 'Approved',
    subtitle: 'Hide your listing in Gab Marketplace.',
  }
}

class MarketplaceListingChangeStatusPopover extends React.Component {

  handleOnClick = (newStatusI) => {
    const { item } = this.props
    if (!item) return null

    let block
    for (const key in STATUS_CHANGE_TITLES) {
      const element = STATUS_CHANGE_TITLES[key]
      if (element.id === newStatusI) block = element
    }
    if (!block) return null

    this.props.onChange(item.get('id'), newStatusI, block.title, block.subtitle)
  }

  handleOnClosePopover = () => {
    this.props.onClosePopover()
  }

  render() {
    const {
      isXS,
      item,
    } = this.props
    
    if (!item) return null

    const currentStatus = item.get('status_i')
    let items = []

    if (currentStatus === MARKETPLACE_LISTING_STATUS_PENDING_REVIEW ||
        currentStatus === MARKETPLACE_LISTING_STATUS_PENDING_CHANGES ||
        currentStatus === MARKETPLACE_LISTING_STATUS_EXPIRED) {
      items = [{
        title: STATUS_CHANGE_TITLES.sold.title,
        subtitle: STATUS_CHANGE_TITLES.sold.subtitle,
        onClick: () => this.handleOnClick(MARKETPLACE_LISTING_STATUS_SOLD),
      }, {
        title: STATUS_CHANGE_TITLES.archived.title,
        subtitle: STATUS_CHANGE_TITLES.archived.subtitle,
        onClick: () => this.handleOnClick(MARKETPLACE_LISTING_STATUS_ARCHIVED),
      }]
    }
    if (currentStatus === MARKETPLACE_LISTING_STATUS_REJECTED || 
        currentStatus === MARKETPLACE_LISTING_STATUS_SOLD) {
      items = [{
        title: STATUS_CHANGE_TITLES.archived.title,
        subtitle: STATUS_CHANGE_TITLES.archived.subtitle,
        onClick: () => this.handleOnClick(MARKETPLACE_LISTING_STATUS_ARCHIVED),
      }]
    }
    if (currentStatus === MARKETPLACE_LISTING_STATUS_APPROVED) {
      items = [
      {
        title: STATUS_CHANGE_TITLES.running.title,
        subtitle: STATUS_CHANGE_TITLES.running.subtitle,
        onClick: () => this.handleOnClick(MARKETPLACE_LISTING_STATUS_RUNNING),
      },{
        title: STATUS_CHANGE_TITLES.sold.title,
        subtitle: STATUS_CHANGE_TITLES.sold.subtitle,
        onClick: () => this.handleOnClick(MARKETPLACE_LISTING_STATUS_SOLD),
      }, {
        title: STATUS_CHANGE_TITLES.archived.title,
        subtitle: STATUS_CHANGE_TITLES.archived.subtitle,
        onClick: () => this.handleOnClick(MARKETPLACE_LISTING_STATUS_ARCHIVED),
      }]
    }
    if (currentStatus === MARKETPLACE_LISTING_STATUS_RUNNING) {
      items = [
        {
          title: STATUS_CHANGE_TITLES.approved.title,
          subtitle: STATUS_CHANGE_TITLES.approved.subtitle,
          onClick: () => this.handleOnClick(MARKETPLACE_LISTING_STATUS_APPROVED),
        },{
          title: STATUS_CHANGE_TITLES.sold.title,
          subtitle: STATUS_CHANGE_TITLES.sold.subtitle,
          onClick: () => this.handleOnClick(MARKETPLACE_LISTING_STATUS_SOLD),
        }, {
          title: STATUS_CHANGE_TITLES.archived.title,
          subtitle: STATUS_CHANGE_TITLES.archived.subtitle,
          onClick: () => this.handleOnClick(MARKETPLACE_LISTING_STATUS_ARCHIVED),
        }]
    }
    if (currentStatus === MARKETPLACE_LISTING_STATUS_ARCHIVED) {
      items = [{
        title: 'None',
        subtitle: 'You cannot change your listing status, it is archived.',
      }]
    }

    return (
      <PopoverLayout
        width={320}
        isXS={isXS}
        onClose={this.handleOnClosePopover}
      >
        <List
          size={isXS ? 'large' : 'small'}
          scrollKey='mpl_status_change'
          items={items}
        />
      </PopoverLayout>
    )
  }
}

const mapStateToProps = (state, { id }) => ({
  item: state.getIn(['marketplace_listings', `${id}`]),
})

const mapDispatchToProps = (dispatch) => ({
  onChange(listingId, newStatusI, newStatusTitle, newStatusSubtitle) {
    dispatch(closePopover()),
    dispatch(openModal(MODAL_CONFIRM, {
      title: 'Are you sure?',
      message: `Are you sure you change the status of your listing to ${newStatusTitle}. ${newStatusSubtitle}`,
      confirm: 'Yes. Change Status',
      onConfirm: () => dispatch(setMarketplaceListingStatus(listingId, newStatusI))
    }))
  },
  onClosePopover: () => dispatch(closePopover()),
})

MarketplaceListingChangeStatusPopover.propTypes = {
  sorting: PropTypes.string.isRequired,
  isXS: PropTypes.bool,
  onClosePopover: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(MarketplaceListingChangeStatusPopover)