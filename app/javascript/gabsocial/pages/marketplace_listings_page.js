import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { me } from '../initial_state'
import PageTitle from '../features/ui/util/page_title'
import WrappedBundle from '../features/ui/util/wrapped_bundle'
import MarketplaceLayout from '../layouts/marketplace_layout'
import { openModal } from '../actions/modal'
import {
  MODAL_MARKETPLACE_LISTING_FILTER,
  BREAKPOINT_EXTRA_SMALL,
} from '../constants'
import {
  LinkFooter,
  MarketplaceListingCategoriesPanel,
  MarketplaceListingFilterPanel,
  GabAdTopPanel,
  GabAdBottomPanel,
} from '../features/ui/util/async_components'

class MarketplaceListingsPage extends React.PureComponent {

  handleOnOpenFilterModal = () => {
    const { isXS } = this.props
    this.props.dispatch(openModal(MODAL_MARKETPLACE_LISTING_FILTER, { isXS }))
  }

  render() {
    const { children, isXS } = this.props
    
    const actions = []
    const tabs = []
    if (!!me && !isXS) {
      actions.push({
        attrTitle: 'Create',
        icon: 'add',
        to: '/marketplace/create',
      })
    }
    if (isXS) {
      actions.push({
        attrTitle: 'Sort and Filter',
        icon: 'search',
        onClick: this.handleOnOpenFilterModal
      })
    }

    return (
      <MarketplaceLayout
        page='marketplace'
        tabs={!!me ? [
          {
            title: 'Dashboard',
            to: '/marketplace/dashboard',
          },
          {
            title: 'Saved',
            to: '/marketplace/saved',
          },
          {
            title: 'All Categories',
            to: '/marketplace/categories',
          },
          {
            title: 'Create Listing',
            appendIcon: 'add',
            to: '/marketplace/create',
            isHidden: !isXS,
          },
        ] : []}
        title='Marketplace'
        actions={actions}
        layout={[
          <WrappedBundle key='marketplace-page-ad-panel' component={GabAdTopPanel} componentParams={{ pageKey: 'marketplace.sidebar', position: 1 }} />,
          MarketplaceListingFilterPanel,
          MarketplaceListingCategoriesPanel,
          LinkFooter,
          <WrappedBundle key='home-page-ad-panel-bottom' component={GabAdBottomPanel} componentParams={{ pageKey: 'home.sidebar.bottom', position: 2 }} />,
        ]}
      >
        <PageTitle path='Marketplace' />
        {children}
      </MarketplaceLayout>
    )
  }

}

const mapStateToProps = (state) => ({
  isXS: state.getIn(['settings', 'window_dimensions', 'width']) <= BREAKPOINT_EXTRA_SMALL,
})

MarketplaceListingsPage.propTypes = {
  children: PropTypes.node.isRequired,
  isXS: PropTypes.bool.isRequired,
}

export default connect(mapStateToProps)(MarketplaceListingsPage)