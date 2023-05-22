import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import {
  changeMarketplaceListingItemView,
} from '../../actions/marketplace_listing_search'
import {
  MARKETPLACE_LISTING_VIEW_TAB_TYPE_CARD,
  MARKETPLACE_LISTING_VIEW_TAB_TYPE_LIST,
} from '../../constants'
import Button from '../button'

class MarketplaceListingViewToggle extends React.PureComponent {

  handleOnClick = (tab) => {
    this.props.dispatch(changeMarketplaceListingItemView(tab))
  }

  render() {
    const { tab } = this.props

    return (
      <div className={[_s.d, _s.flexRow, _s.aiCenter].join(' ')}>
        <Button
          radiusSmall
          onClick={() => this.handleOnClick(MARKETPLACE_LISTING_VIEW_TAB_TYPE_LIST)}
          icon='ul-list'
          iconSize='16px'
          color={tab === MARKETPLACE_LISTING_VIEW_TAB_TYPE_LIST ? 'primary' : 'secondary'}
          backgroundColor={tab === MARKETPLACE_LISTING_VIEW_TAB_TYPE_LIST ? 'tertiary' : 'secondary'}
          className={[_s.topRightRadius0, _s.bottomRightRadius0].join(' ')}
        />
        <Button
          radiusSmall
          onClick={() => this.handleOnClick(MARKETPLACE_LISTING_VIEW_TAB_TYPE_CARD)}
          icon='apps'
          iconSize='16px'
          color={tab === MARKETPLACE_LISTING_VIEW_TAB_TYPE_CARD ? 'primary' : 'secondary'}
          backgroundColor={tab === MARKETPLACE_LISTING_VIEW_TAB_TYPE_CARD ? 'tertiary' : 'secondary'}
          className={[_s.topLeftRadius0, _s.bottomLeftRadius0].join(' ')}
        />
      </div>
    )
   
  }

}

const mapStateToProps = (state) => ({
  tab: state.getIn(['marketplace_listing_search', 'view_tab']),
})

MarketplaceListingViewToggle.propTypes = {
  tab: PropTypes.string,
  onClick: PropTypes.func,
}

export default connect(mapStateToProps)(MarketplaceListingViewToggle)