import React from 'react'
import PropTypes from 'prop-types'
import PageTitle from '../features/ui/util/page_title'
import MarketplaceLayout from '../layouts/marketplace_layout'
import { me } from '../initial_state'
import {
  LinkFooter,
  MarketplaceListingFilterPanel,
  UserSuggestionsPanel,
} from '../features/ui/util/async_components'

class MarketplaceListingCategoriesPage extends React.PureComponent {

  render() {
    const { children, showSuggestedUsers } = this.props

    let sidebarLayout = [MarketplaceListingFilterPanel]

    if(showSuggestedUsers) {
      sidebarLayout.push(UserSuggestionsPanel)
    }

    sidebarLayout.push(LinkFooter)

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
        ] : [{
          title: 'All Categories',
          to: '/marketplace/categories',
        },]}
        title='Marketplace'
        actions={!!me ? [
          {
            attrTitle: 'Create',
            icon: 'add',
            to: '/marketplace/create',
          },
        ] : null}
        layout={sidebarLayout}
      >
        <PageTitle path='Marketplace' />
        {children}
      </MarketplaceLayout>
    )
  }

}

MarketplaceListingCategoriesPage.propTypes = {
  children: PropTypes.object,
}

export default MarketplaceListingCategoriesPage
