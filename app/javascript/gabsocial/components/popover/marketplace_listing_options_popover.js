import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { me, isStaff } from '../../initial_state'
import {
  POPOVER_SHARE,
  POPOVER_MARKETPLACE_LISTING_CHANGE_STATUS,
} from '../../constants'
import {
  openPopover,
  closePopover,
} from '../../actions/popover'
import PopoverLayout from './popover_layout'
import List from '../list'

class MarketplaceListingOptionsPopover extends React.PureComponent {

  handleOnOpenShare = () => {
    this.props.onOpenSharePopover(this.props.targetRef, this.props.item)
  }

  handleOnChangeListingStatus = () => {
    this.props.onOpenChangeStatusPopover(this.props.targetRef, this.props.item)
  }

  render() {
    const {
      item,
      isOwner,
      isXS,
    } = this.props

    const items = []

    if (isOwner) {
      items.push({
        title: 'Edit Marketplace Listing',
        to: `/marketplace/item/${item.get('id')}/edit`,
      })
      items.push({
        title: 'View Listing in Dashboard',
        to: '/marketplace/dashboard',
      })
      items.push({
        title: 'Change Listing Status',
        onClick: this.handleOnChangeListingStatus,
      })
    }

    items.push({
      title: 'Share Marketplace Listing',
      onClick: this.handleOnOpenShare,
    })

    if (!isOwner) {
      items.push({
        title: 'View Seller Profile',
        to: `/${item.getIn(['account', 'username'])}`,
      })
    }
    
    if (isStaff) {
      items.push({
        title: 'Open Listing in Moderation Interface',
        href: `/admin/marketplace_listings/${item.get('id')}`,
        openInNewTab: true,
      })
      items.push({
        title: 'Open Account in Moderation Interface',
        href: `/admin/accounts/${item.getIn(['account', 'id'])}`,
        openInNewTab: true,
      })
    }

    return (
      <PopoverLayout
        width={280}
        isXS={isXS}
        onClose={this.handleOnClosePopover}
      >
        <List
          size={isXS ? 'large' : 'small'}
          scrollKey='marketplace_listing_options_popover'
          items={items}
        />
      </PopoverLayout>
    )
  }
}

const mapStateToProps = (state, { id }) => ({
  item: state.getIn(['marketplace_listings', `${id}`]),
  isOwner: state.getIn(['marketplace_listings', `${id}`, 'account', 'id'], null) === me,
})

const mapDispatchToProps = (dispatch) => ({
  onOpenChangeStatusPopover(targetRef, marketplaceListing) {
    dispatch(openPopover(POPOVER_MARKETPLACE_LISTING_CHANGE_STATUS, {
      targetRef,
      id: marketplaceListing.get('id'),
      position: 'bottom',
    }))
  },
  onOpenSharePopover(targetRef, marketplaceListing) {
    dispatch(openPopover(POPOVER_SHARE, {
      targetRef,
      marketplaceListing,
      position: 'bottom',
    }))
  },
  onClosePopover: () => dispatch(closePopover()),
})

MarketplaceListingOptionsPopover.propTypes = {
  isOwner: PropTypes.bool,
  isXS: PropTypes.bool,
  onOpenSharePopover: PropTypes.func.isRequired,
  onClosePopover: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(MarketplaceListingOptionsPopover)