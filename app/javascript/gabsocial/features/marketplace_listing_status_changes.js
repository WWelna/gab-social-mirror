import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import debounce from 'lodash/debounce'
import moment from 'moment-mini'
import { me } from '../initial_state'
import {
  fetchMarketplaceListingStatusChanges,
  expandMarketplaceListingStatusChanges
} from '../actions/marketplace_listings'
import MarketplaceListingStatusTag from '../components/marketplace/marketplace_listing_status_tag'
import ColumnIndicator from '../components/column_indicator'
import Table from '../components/table'

class MarketplaceListingStatusChanges extends ImmutablePureComponent {

  componentDidMount () {
    this.props.dispatch(fetchMarketplaceListingStatusChanges(this.props.marketplaceListingId))
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.marketplaceListingId !== this.props.marketplaceListingId && nextProps.marketplaceListingId) {
      this.props.dispatch(fetchMarketplaceListingStatusChanges(nextProps.marketplaceListingId))
    }
  }

  handleLoadMore = debounce(() => {
    this.props.dispatch(expandMarketplaceListingStatusChanges(this.props.marketplaceListingId))
  }, 300, { leading: true })

  render () {
    const {
      isOwner,
      changes,
      isLoading,
      hasMore,
      marketplaceListingId,
    } = this.props

    if (!marketplaceListingId || !isOwner) return <ColumnIndicator type='missing' />

    const count = !!changes ? changes.count() : 0

    const rows = count > 0 ? changes.map((change, i) => [
      moment(change.get('created_at')).format('lll'),
      <MarketplaceListingStatusTag statusI={change.get('old_status_i')} statusS={change.get('old_status_s')} />,
      <MarketplaceListingStatusTag statusI={change.get('new_status_i')} statusS={change.get('new_status_s')} />,
      change.get('note'),
    ]).toJS() : null

    // : todo : load more

    return (
      <Table
        columns={['Date', 'Old Status', 'New Status', 'Note']}
        rows={rows}
      />
    )
  }

}

const mapStateToProps = (state, { marketplaceListingId }) => {
  const item = state.getIn(['marketplace_listings', `${marketplaceListingId}`], null)

  return {
    isOwner: !!item ? item.getIn(['account', 'id']) === me : false,
    changes: state.getIn(['marketplace_listing_status_changes', marketplaceListingId, 'items']),
    hasMore: !!state.getIn(['marketplace_listing_status_changes', marketplaceListingId, 'next']),
    isLoading: state.getIn(['marketplace_listing_status_changes', marketplaceListingId, 'isLoading']),
  }
}

MarketplaceListingStatusChanges.propTypes = {
  changes: ImmutablePropTypes.list,
  dispatch: PropTypes.func.isRequired,
  marketplaceListingId: PropTypes.string.isRequired,
  hasMore: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
}

export default connect(mapStateToProps)(MarketplaceListingStatusChanges)
