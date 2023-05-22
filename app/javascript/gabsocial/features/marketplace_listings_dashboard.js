import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import debounce from 'lodash/debounce'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { connect } from 'react-redux'
import Block from '../components/block'
import Heading from '../components/heading'
import ColumnIndicator from '../components/column_indicator'
import LoadMore from '../components/load_more'
import Input from '../components/input'
import SortBlock from '../components/sort_block'
import Pills from '../components/pills'
import Text from '../components/text'
import MarketplaceListingListOwnerItem from '../components/marketplace/marketplace_listing_list_owner_item'
import ResponsiveComponent from './ui/util/responsive_component'
import { me } from '../initial_state'
import {
  BREAKPOINT_SMALL,
  POPOVER_MARKETPLACE_LISTING_DASHBOARD_STATUS_OPTIONS,
  MARKETPLACE_LISTING_STATUS_PENDING_REVIEW,
  MARKETPLACE_LISTING_STATUS_PENDING_CHANGES,
  MARKETPLACE_LISTING_STATUS_REJECTED,
  MARKETPLACE_LISTING_STATUS_APPROVED,
  MARKETPLACE_LISTING_STATUS_RUNNING,
  MARKETPLACE_LISTING_STATUS_EXPIRED,
  MARKETPLACE_LISTING_STATUS_SOLD,
  MARKETPLACE_LISTING_STATUS_ARCHIVED,
} from '../constants'
import { openPopover } from '../actions/popover'
import {
  clearMarketplaceListingDashboard,
  expandMarketplaceListingDashboard,
  changeMarketplaceListingDashboardQuery,
  changeMarketplaceListingDashboardStatus,
} from '../actions/marketplace_listing_dashboard'

class MarketplaceListingsDashboard extends ImmutablePureComponent {

  componentDidMount() {
    const { items } = this.props
    // : todo : if no items and yadda yadda
    this.props.onExpandMarketplaceListingDashboard()
  }

  componentDidUpdate(prevProps) {
    const { searchValue, activeSearchStatuses } = this.props
  
    // if changed search or statuses, clear, reload
    if (searchValue !== prevProps.searchValue || activeSearchStatuses !== prevProps.activeSearchStatuses) {
      this.props.onClearMarketplaceListingDashboard()
      this.handleOnExpand(true)
    }
  }

  handleOnChangeMarketplaceListingDashboardQuery = (value) => {
    this.props.onChangeMarketplaceListingDashboardQuery(value)
  }
  
  handleDelete = (value) => {
    this.props.onChangeMarketplaceListingDashboardStatus(value ,false)
  }

  handleClickSort = (ref) => {
    this.props.onOpenStatusSortOptionsPopover(ref)
  }
  
  handleOnExpand = debounce((skipMax) => {
    const { items, onExpandMarketplaceListingDashboard } = this.props
    const maxId = items && !skipMax ? items.last() : null
    onExpandMarketplaceListingDashboard({ maxId })
  }, 500, { leading: true })

  render() {
    const {
      items,
      isLoading,
      hasMore,
      searchValue,
      activeSearchStatuses,
    } = this.props

    const listItems = items
    const hasItems = !!listItems ? listItems.size > 0 : false
    const pills = activeSearchStatuses.toJS().map((id) => {
      let pillTitle
      switch (id) {
        case MARKETPLACE_LISTING_STATUS_PENDING_REVIEW:
          pillTitle = 'Pending Review'
          break;
        case MARKETPLACE_LISTING_STATUS_PENDING_CHANGES:
          pillTitle = 'Pending Changes'
          break;
        case MARKETPLACE_LISTING_STATUS_REJECTED:
          pillTitle = 'Rejected'
          break;
        case MARKETPLACE_LISTING_STATUS_APPROVED:
          pillTitle = 'Approved'
          break;
        case MARKETPLACE_LISTING_STATUS_RUNNING:
          pillTitle = 'Running'
          break;
        case MARKETPLACE_LISTING_STATUS_EXPIRED:
          pillTitle = 'Expired'
          break;
        case MARKETPLACE_LISTING_STATUS_SOLD:
          pillTitle = 'Sold'
          break;
        case MARKETPLACE_LISTING_STATUS_ARCHIVED:
          pillTitle = 'Archived'
          break;
        default:
          break;
      }
      return {
        appendIcon: 'close',
        onClick: () => this.handleDelete(id),
        title: pillTitle,
      }
    })
    if (pills.length === 0) {
      pills.push({ title: 'All' })
    }

    return (
      <div className={[_s.d, _s.w100PC].join(' ')}>
        <Block>
          <ResponsiveComponent min={BREAKPOINT_SMALL}>
            <div className={[_s.d, _s.px15, _s.py15, _s.w100PC, _s.borderBottom1PX, _s.borderColorSecondary].join(' ')}>
              <Heading size='h2'>Marketplace Listing Dashboard</Heading>
            </div>
          </ResponsiveComponent>

          <div className={[_s.d, _s.flexRow, _s.aiCenter, _s.px15, _s.py15, _s.w100PC, _s.borderBottom1PX, _s.borderColorSecondary].join(' ')}>
            <div className={[_s.d, _s.flex1, _s.pr15].join(' ')}>
              <Input
                placeholder='Search your listings'
                prependIcon='search'
                value={searchValue}
                onChange={this.handleOnChangeMarketplaceListingDashboardQuery}
                id='mpl-dashboard-search'
                hideLabel
                maxLength={120}
              />
            </div>
            <div className={[_s.d, _s.mlAuto].join(' ')}>
              <SortBlock
                value='Status'
                onClickValue={this.handleClickSort}
              />
            </div>
          </div>

          <div className={[_s.d, _s.overflowYHidden, _s.overflowXScroll, _s.noScrollbar, _s.flexRow, _s.aiCenter, _s.pl15, _s.py15, _s.w100PC, _s.borderBottom1PX, _s.borderColorSecondary].join(' ')}>
            <Text>Viewing: </Text>
            <Pills pills={pills} />
          </div>

          <div className={[_s.d, _s.w100PC, _s.flexRow, _s.flexWrap, _s.px10, _s.mb15, _s.pb10].join(' ')}>    
            {!listItems && <ColumnIndicator type='error' message={`No listings found`} />}
            
            {
              !!listItems && listItems.map((id, i) => (
                <MarketplaceListingListOwnerItem
                  key={`marketplace-search-result-${i}-${id}`}
                  id={id}
                />
              ))
            }
          </div>

          {
            hasMore && !(isLoading && !hasItems) &&
            <LoadMore visible={!isLoading} onClick={this.handleOnExpand} />
          }
        </Block>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  items: state.getIn(['marketplace_listings_lists', 'dashboard', 'items']),
  hasMore: !!state.getIn(['marketplace_listings_lists', 'dashboard', 'next']),
  isLoading: state.getIn(['marketplace_listings_lists', 'dashboard', 'isLoading']),
  isError: state.getIn(['marketplace_listings_lists', 'dashboard', 'isError']),
  searchValue: state.getIn(['marketplace_listing_dashboard', 'search']),
  activeSearchStatuses: state.getIn(['marketplace_listing_dashboard', 'active_search_statuses']),
})

const mapDispatchToProps = (dispatch) => ({
  onOpenStatusSortOptionsPopover(targetRef) {
    dispatch(openPopover(POPOVER_MARKETPLACE_LISTING_DASHBOARD_STATUS_OPTIONS, {
      targetRef,
    }))
  },
  onClearMarketplaceListingDashboard() {
    dispatch(clearMarketplaceListingDashboard())
  },
  onExpandMarketplaceListingDashboard(params) {
    dispatch(expandMarketplaceListingDashboard(params))
  },
  onChangeMarketplaceListingDashboardQuery(value) {
    dispatch(changeMarketplaceListingDashboardQuery(value))
  },
  onChangeMarketplaceListingDashboardStatus(value, addOrRemove) {
    dispatch(changeMarketplaceListingDashboardStatus(value, addOrRemove))
  }
})

MarketplaceListingsDashboard.propTypes = {
  items: ImmutablePropTypes.map,
  hasMore: PropTypes.bool,
  isLoading: PropTypes.bool,
  isError: PropTypes.bool,
  searchValue: PropTypes.string,
  onExpandMarketplaceListingDashboard: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(MarketplaceListingsDashboard)
