import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import debounce from 'lodash/debounce'
import isObject from 'lodash/isObject'
import queryString from 'query-string'
import {
  fetchMarketplaceListingsBySearch,
  expandMarketplaceListingsBySearch,
  setParamsForMarketplaceListingSearch,
} from '../actions/marketplace_listing_search'
import MarketplaceListingsCollection from '../components/marketplace/marketplace_listings_collection'
import { parseQuerystring } from '../utils/querystring'

class MarketplaceListings extends ImmutablePureComponent {

  componentDidMount() {
    const {
      hasMore,
      listingIds,
      onFetchMarketplaceListingsBySearch,
    } = this.props

    const qp = parseQuerystring()
    const hasChanged = this.areQuerystringsDifferentThanSaved(qp)
    if (!!qp && hasChanged) {
      this.props.onSetParamsForMarketplaceListingSearch(qp)
    }

    if ((!hasMore && listingIds.count() === 0) || hasChanged) {
      onFetchMarketplaceListingsBySearch()
    }
  }

  componentDidUpdate(prevProps) {
    // if clicked MarketplaceListingCategoriesPanel list item to change the category
    // check to see if query params have changed, if so, re-set & re-fetch 
    if (prevProps.location.search !== this.props.location.search) {
      const qp = parseQuerystring()
      this.props.onSetParamsForMarketplaceListingSearch(qp)
      this.props.onFetchMarketplaceListingsBySearch() 
    }
  }

  areQuerystringsDifferentThanSaved = (qs) => {
    const { filters } = this.props
    if (!isObject(qs)) return
    let isDifferent = false

    filters.keySeq().forEach((key) => {
      const existingFilterValue = filters.get(key)
      const qsValue = qs[key]
      if (qsValue !== existingFilterValue) {
        isDifferent = true
      }
    })

    return isDifferent
  }

  handleLoadMore = debounce(() => {
    this.props.onExpandMarketplaceListingsBySearch()
  }, 300, { leading: true })

  render() {
    const {
      isLoading,
      isError,
      hasMore,
      listingIds,
      viewTab,
    } = this.props

    return (
      <MarketplaceListingsCollection
        listingIds={listingIds}
        isLoading={isLoading}
        isError={isError}
        hasMore={hasMore}
        onLoadMore={this.handleLoadMore}
        title='Results'
      />
    )
  }

}

const mapDispatchToProps = (dispatch) => ({
  onExpandMarketplaceListingsBySearch() {
    dispatch(expandMarketplaceListingsBySearch())
  },
  onFetchMarketplaceListingsBySearch() {
    dispatch(fetchMarketplaceListingsBySearch())
  },
  onSetParamsForMarketplaceListingSearch(qp) {
    dispatch(setParamsForMarketplaceListingSearch(qp))
  },
})

const mapStateToProps = (state) => ({
  filters: state.getIn(['marketplace_listing_search', 'filters']),
  listingIds: state.getIn(['marketplace_listing_search', 'items']),
  hasMore: !!state.getIn(['marketplace_listing_search', 'next']),
  isLoading: state.getIn(['marketplace_listing_search', 'isLoading']),
  isError: state.getIn(['marketplace_listing_search', 'isError']),
  viewTab: state.getIn(['marketplace_listing_search', 'view_tab']),
})

MarketplaceListings.propTypes = {
  onExpandMarketplaceListingsBySearch: PropTypes.func,
  onFetchMarketplaceListingsBySearch: PropTypes.func,
  onSetParamsForMarketplaceListingSearch: PropTypes.func,
  category: ImmutablePropTypes.object,
  listingIds: ImmutablePropTypes.list,
  hasMore: PropTypes.bool,
  hasCategories: PropTypes.bool,
  sluggedCategory: PropTypes.string,
  params: PropTypes.object.isRequired,
  isError: PropTypes.bool,
  isLoading: PropTypes.bool,
  viewTab: PropTypes.string,
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MarketplaceListings))
