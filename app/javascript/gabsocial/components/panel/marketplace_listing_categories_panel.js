import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { List as ImmutableList } from 'immutable'
import { fetchMarketplaceListingCategories } from '../../actions/marketplace_listing_categories'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import PanelLayout from './panel_layout'
import List from '../list'

class MarketplaceListingCategoriesPanel extends ImmutablePureComponent {

  state = {
    fetched: false,
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.shouldLoad && !prevState.fetched) {
      return { fetched: true }
    }

    return null
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.fetched && this.state.fetched && this.props.isLazy) {
      this.props.dispatch(fetchMarketplaceListingCategories())
    }
  }

  componentDidMount() {
    if (!this.props.isLazy) {
      this.props.dispatch(fetchMarketplaceListingCategories())
      this.setState({ fetched: true })
    }
  }

  render() {
    const { categories = ImmutableList(), isLoading } = this.props
    const { fetched } = this.state
  
    const count = !!categories ? categories.count() : 0

    const listItems = categories.map((category) => ({
      to: `/marketplace/listings?category_id=${category.get('id')}`,
      title: category.get('name'),
    }))

    return (
      <PanelLayout
        title='Marketplace Categories'
        noPadding
      >
        <div className={[_s.d, _s.boxShadowNone].join(' ')}>
          <List
            scrollKey='marketplace_categories_sidebar_panel'
            items={listItems}
            isLoading={isLoading}
            showLoading={isLoading && !fetched && count === 0}
          />
        </div>
      </PanelLayout>
    )
  }
}

const mapStateToProps = (state) => ({
  isLoading: state.getIn(['marketplace_listing_categories', 'isLoading']),
  categories: state.getIn(['marketplace_listing_categories', 'items']),
})

MarketplaceListingCategoriesPanel.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  categories: ImmutablePropTypes.list.isRequired,
}

export default connect(mapStateToProps)(MarketplaceListingCategoriesPanel)
