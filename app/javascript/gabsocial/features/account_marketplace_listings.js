import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { expandMarketplaceListingsBySeller } from '../actions/marketplace_listings'
import MarketplaceListingsCollection from '../components/marketplace/marketplace_listings_collection'

class AccountMarketplaceListings extends ImmutablePureComponent {

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

  handleLoadMore = () => {
    if (this.props.accountId && this.props.accountId !== -1) {
      this.props.dispatch(expandMarketplaceListingsBySeller(this.props.accountId))
    }
  }

  render() {
    const {
      listingIds,
      isLoading,
      isError,
      hasMore,
      account,
    } = this.props

    if (!account) return null

    return (
      <MarketplaceListingsCollection
        listingIds={listingIds}
        isLoading={isLoading}
        isError={isError}
        hasMore={hasMore}
        onLoadMore={this.handleLoadMore}
        title='Marketplace Listings'
      />
    )
  }

}

const mapStateToProps = (state, { account }) => {
  const accountId =  !!account ? account.get('id') : -1

  return {
    accountId,
    listingIds: state.getIn(['marketplace_listings_lists', 'user', `${accountId}`, 'items']),
    isLoading: state.getIn(['marketplace_listings_lists', 'user', `${accountId}`, 'isLoading']),
    isError: state.getIn(['marketplace_listings_lists', 'user', `${accountId}`, 'isError']),
    hasMore: !!state.getIn(['marketplace_listings_lists', 'user', `${accountId}`, 'next']),
  }
}

AccountMarketplaceListings.propTypes = {
  dispatch: PropTypes.func.isRequired,
  account: ImmutablePropTypes.map,
  accountId: PropTypes.string,
  listings: ImmutablePropTypes.list.isRequired,
  isLoading: PropTypes.bool,
  hasMore: PropTypes.bool,
}

export default connect(mapStateToProps)(AccountMarketplaceListings)
