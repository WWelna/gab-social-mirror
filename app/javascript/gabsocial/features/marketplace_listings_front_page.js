import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'
import debounce from 'lodash/debounce'
import {
  expandMarketplaceListingFrontPage,
} from '../actions/marketplace_listings'
import MarketplaceListingsCollection from '../components/marketplace/marketplace_listings_collection'

class MarketplaceListingsFrontPage extends ImmutablePureComponent {

  componentDidMount() {
    this.props.onExpandMarketplaceListingFrontPage({
      sinceId: null,
      maxId: null,
    })
  }

  handleLoadMore = debounce(() => {
    this.props.onExpandMarketplaceListingFrontPage()
  }, 300, { leading: true })

  render() {
    const {
      isLoading,
      isError,
      hasMore,
      listingIds,
    } = this.props

    return (
      <MarketplaceListingsCollection
        listingIds={listingIds}
        isLoading={isLoading}
        isError={isError}
        hasMore={hasMore}
        onLoadMore={this.handleLoadMore}
        title='Latest Listings'
      />
    )
  }

}

const mapDispatchToProps = (dispatch) => ({
  onExpandMarketplaceListingFrontPage(params) {
    dispatch(expandMarketplaceListingFrontPage(params))
  },
})

const mapStateToProps = (state) => ({
  listingIds: state.getIn(['marketplace_listings_lists', 'frontpage', 'items']),
  hasMore: !!state.getIn(['marketplace_listings_lists', 'frontpage', 'next']),
  isLoading: state.getIn(['marketplace_listings_lists',  'frontpage', 'isLoading']),
  isError: state.getIn(['marketplace_listings_lists', 'frontpage', 'isError']),
})

MarketplaceListingsFrontPage.propTypes = {
  onExpandMarketplaceListingFrontPage: PropTypes.func,
  listingIds: ImmutablePropTypes.list,
  hasMore: PropTypes.bool,
  isError: PropTypes.bool,
  isLoading: PropTypes.bool,
}

export default connect(mapStateToProps, mapDispatchToProps)(MarketplaceListingsFrontPage)
