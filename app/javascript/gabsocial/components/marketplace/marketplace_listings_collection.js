import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'
import debounce from 'lodash/debounce'
import {
  CX,
  MARKETPLACE_LISTING_VIEW_TAB_TYPE_LIST,
} from '../../constants'
import MarketplaceListingCard from '../marketplace/marketplace_listing_card'
import MarketplaceListingListItem from '../marketplace/marketplace_listing_list_item'
import MarketplaceListingViewToggle from '../marketplace/marketplace_listing_view_toggle'
import ColumnIndicator from '../column_indicator'
import MarketplaceListingCardPlaceholder from '../placeholder/marketplace_listing_card_placeholder'
import MarketplaceListingListItemPlaceholder from '../placeholder/marketplace_listing_list_item_placeholder'
import LoadMore from '../load_more'
import Block from '../block'
import Text from '../text'
import ScrollableList from '../scrollable_list'

class MarketplaceListingsCollection extends ImmutablePureComponent {

  handleLoadMore = debounce(() => {
    this.props.onLoadMore()
  }, 300, { leading: true })

  render() {
    const {
      isLoading,
      isError,
      hasMore,
      listingIds,
      viewTab,
      title,
    } = this.props

    const hasListings = !!listingIds && listingIds.size > 0

    const isList = viewTab === MARKETPLACE_LISTING_VIEW_TAB_TYPE_LIST
    const CategoryComponent = isList ? MarketplaceListingListItem : MarketplaceListingCard
    const Placeholder = isList ? MarketplaceListingListItemPlaceholder : MarketplaceListingCardPlaceholder

    const containerClasses = isList ?
      CX({
        d: 1,
        w100PC: 1,
        flexRow: 1,
        flexWrap: 1,
        py15: !hasListings,
      }) :
        CX({
        px10: 1,
        marketplaceItemGrid: isLoading || hasListings,
        py15: 1,
      })

    return (
      <div className={[_s.d, _s.w100PC].join(' ')}>
        <Block>
          <div className={[_s.d, _s.flexRow, _s.aiCenter, _s.px15, _s.py10, _s.borderBottom1PX, _s.borderColorSecondary].join(' ')}>
            <Text size='extraLarge' weight='bold'>{title}</Text>
            <div className={[_s.d, _s.mlAuto].join(' ')}>
              <MarketplaceListingViewToggle />
            </div>
          </div>
          <ScrollableList
            scrollKey="marketplace_listings_collection"
            role='feed'
            onLoadMore={this.handleLoadMore}
            placeholderComponent={Placeholder}
            placeholderCount={6}
            emptyMessage='No listings found'
            hasMore={hasMore}
            isLoading={isLoading}
          >
            <div className={containerClasses}>
            {
              hasListings && listingIds.map((listingId) => (
                <CategoryComponent
                  key={`marketplace-listing-card-${listingId}`}
                  id={listingId}
                />
              ))
            }
            </div>
          </ScrollableList>
        </Block>
      </div>
    )
  }

}

const mapStateToProps = (state) => ({
  viewTab: state.getIn(['marketplace_listing_search', 'view_tab']),
})

MarketplaceListingsCollection.propTypes = {
  listingIds: ImmutablePropTypes.list,
  isLoading: PropTypes.bool,
  isError: PropTypes.bool,
  hasMore: PropTypes.bool,
  onLoadMore: PropTypes.func,
  title: PropTypes.string,
  viewTab: PropTypes.string,
}

export default connect(mapStateToProps)(MarketplaceListingsCollection)
