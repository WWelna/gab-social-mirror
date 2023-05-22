import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import debounce from 'lodash/debounce'
import {
  fetchMarketplaceListingSaves,
  expandMarketplaceListingSaves,
} from '../actions/marketplace_listing_saves'
import Account from '../components/account'
import ScrollableList from '../components/scrollable_list'
import Block from '../components/block'
import MarketplaceListingListItem from '../components/marketplace/marketplace_listing_list_item'
import AccountPlaceholder from '../components/placeholder/account_placeholder'

class MarketplaceListingSaves extends ImmutablePureComponent {

  componentDidMount() {
    this.props.dispatch(fetchMarketplaceListingSaves())
  }

  handleLoadMore = debounce(() => {
    this.props.dispatch(expandMarketplaceListingSaves())
  }, 300, { leading: true })

  render() {
    const {
      items,
      hasMore,
      isLoading,
    } = this.props

    return (
      <div>
        <ScrollableList
          scrollKey='saved_marketplace_listings'
          hasMore={hasMore}
          isLoading={isLoading}
          onLoadMore={this.handleLoadMore}
          placeholderComponent={AccountPlaceholder}
          placeholderCount={4}
          emptyMessage="You don't have any saved Marketplace Listings"
        >
          {
            items && items.map((id) => (
              <MarketplaceListingListItem key={`marketplace-listing-list-item-${id}`} id={id} />
            ))
          }
        </ScrollableList>
      </div>
    )
  }

}

const mapStateToProps = (state) => ({
  items: state.getIn(['marketplace_listings_lists', 'saves', 'items']),
  hasMore: !!state.getIn(['marketplace_listings_lists', 'saves', 'next']),
  isLoading: state.getIn(['marketplace_listings_lists', 'saves', 'isLoading'], true),
  isError: state.getIn(['marketplace_listings_lists', 'saves', 'isError'], true),
})

MarketplaceListingSaves.propTypes = {
  items: ImmutablePropTypes.list,
  hasMore: PropTypes.bool,
  isLoading: PropTypes.bool,
  isError: PropTypes.bool,
}

export default connect(mapStateToProps)(MarketplaceListingSaves)
