import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { connect } from 'react-redux'
import {
  fetchMarketplaceListingCategories,
} from '../actions/marketplace_listing_categories'
import ColumnIndicator from '../components/column_indicator'
import List from '../components/list'

class MarketplaceListingCategories extends ImmutablePureComponent {

  componentDidMount() {
    const { isFetched, onFetchMarketplaceListingCategories } = this.props
    !isFetched && onFetchMarketplaceListingCategories()
  }

  render() {
    const {
      marketplaceListingCategories,
      isLoading,
      isFetched,
      isError,
    } = this.props

    if (isLoading) return <ColumnIndicator type='loading' />

    if (!marketplaceListingCategories || isError) {
      return <ColumnIndicator type='error' message='Error fetching marketplace categories' />
    } else if (marketplaceListingCategories.size === 0 && isFetched) {
      return <ColumnIndicator type='error' message='There are no marketplace categories defined' />
    }

    const items = marketplaceListingCategories.map((marketplaceListingCategory) => ({
      to: `/marketplace/listings?category_id=${marketplaceListingCategory.get('id')}`,
      image: marketplaceListingCategory.get('cover_image_url'),
      title: marketplaceListingCategory.get('name'),
      size: 'large',
    }))

    return (
      <div className={[_s.d, _s.w100PC].join(' ')}>
        <List items={items} />
      </div>
    )
  }

}

const mapStateToProps = (state) => ({
  isLoading: state.getIn(['marketplace_listing_categories', 'isLoading']),
  isFetched: state.getIn(['marketplace_listing_categories', 'isFetched']),
  isError: state.getIn(['marketplace_listing_categories', 'isError']),
  marketplaceListingCategories: state.getIn(['marketplace_listing_categories', 'items']),
})

const mapDispatchToProps = (dispatch) => ({
  onFetchMarketplaceListingCategories() {
    dispatch(fetchMarketplaceListingCategories())
  },
})

MarketplaceListingCategories.propTypes = {
  marketplaceListingCategories: ImmutablePropTypes.list,
  onFetchMarketplaceListingCategories: PropTypes.func,
  isLoading: PropTypes.bool,
  isFetched: PropTypes.bool,
  isError: PropTypes.bool,
}

export default connect(mapStateToProps, mapDispatchToProps)(MarketplaceListingCategories)
