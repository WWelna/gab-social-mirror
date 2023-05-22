import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { CX } from '../../constants'
import PanelLayout from './panel_layout'
import MarketplaceListingCard from '../marketplace/marketplace_listing_card'
import { expandMarketplaceListingsBySeller } from '../../actions/marketplace_listings'

class AccountMarketplaceListingsPanel extends ImmutablePureComponent {

  componentDidMount() {
    const { accountId } = this.props

    if (accountId && accountId !== -1) {
      this.props.dispatch(expandMarketplaceListingsBySeller(accountId, {
        sinceId: null,
        maxId: null,
      }))
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.accountId && nextProps.accountId !== this.props.accountId) {
      this.props.dispatch(expandMarketplaceListingsBySeller(nextProps.accountId, {
        sinceId: null,
        maxId: null,
      }))
    }
  }

  render() {
    const {
      listingIds,
      isLoading,
      isError,
      hasMore,
      account,
      scroll,
    } = this.props

    if (!account) return null
    
    const hasListings = !!listingIds && listingIds.size > 0
    if (!hasListings) return null
    
    const title = 'Show all'
    const url = `/${account.get('username')}/listings`
    
    const containerClasses = scroll === 'y' ? CX({
      px10: 1,
      marketplaceItemGrid: isLoading || hasListings,
      py15: 1,
    }) : CX({
      d: 1,
      px10: 1,
      pb10: 1,
      flexRow: 1,
      width100PC: 1,
      overflowHidden: 1,
      overflowXScroll: 1,
      noScrollbar: 1,
    })
    const wrapperClasses = scroll === 'y' ? null : CX({
      d: 1,
      minW198PX: 1,
      maxW340PX: 1,
      w90PC: 1,
      mr15: 1,
    })

    const max = scroll === 'y' ? 4 : 8

    return (
      <PanelLayout
        title='Listings'
        headerButtonTitle={title}
        headerButtonTo={url}
        noPadding
      >
        <div className={containerClasses}>
          {
            listingIds.slice(0, Math.min(listingIds.size, max)).map((listingId) => (
              scroll === 'y' ?
                <MarketplaceListingCard
                  key={`marketplace-listing-panel-card-${listingId}`}
                  id={listingId}
                />
                :
                <div className={wrapperClasses}>
                  <MarketplaceListingCard
                    key={`marketplace-listing-panel-card-${listingId}`}
                    id={listingId}
                  />
                </div>
            ))
          }
        </div>
      </PanelLayout>
    )
  }

}

const mapStateToProps = (state, { account }) => {
  const accountId = !!account ? account.get('id') : -1

  return {
    accountId,
    listingIds: state.getIn(['marketplace_listings_lists', 'user', `${accountId}`, 'items']),
    isLoading: state.getIn(['marketplace_listings_lists', 'user', `${accountId}`, 'isLoading']),
    isError: state.getIn(['marketplace_listings_lists', 'user', `${accountId}`, 'isError']),
    hasMore: !!state.getIn(['marketplace_listings_lists', 'user', `${accountId}`, 'next']),
  }
}

AccountMarketplaceListingsPanel.propTypes = {
  scroll: PropTypes.oneOf(['x', 'y'])
}

AccountMarketplaceListingsPanel.defaultProps = {
  scroll: 'y'
}

export default connect(mapStateToProps)(AccountMarketplaceListingsPanel)
