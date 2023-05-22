import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import moment from 'moment-mini'
import { connect } from 'react-redux'
import { NavLink } from 'react-router-dom'
import { fetchMarketplaceListingById } from '../../actions/marketplace_listings'
import Text from '../text'
import Image from '../image'
import Icon from '../icon'

class MarketplaceListingListItem extends ImmutablePureComponent {

  componentDidUpdate(prevProps) {
    const { item, onFetchMarketplaceListingById, id } = this.props
    
    if (!item && id !== prevProps.id) onFetchMarketplaceListingById(id)
  }

  componentDidMount() {
    const { item, onFetchMarketplaceListingById, id } = this.props
    
    if (!item) onFetchMarketplaceListingById(id)
  }

  render() {
    const { item } = this.props

    if (!item) return null

    const firstImg = item.get('media_attachments').first()

    return (
      <NavLink
        className={[_s.d, _s.w100PC, _s.px10, _s.py15, _s.flexRow, _s.borderColorSecondary, _s.borderBottom1PX, _s.noUnderline, _s.bgSubtle_onHover].join(' ')}
        to={`/marketplace/item/${item.get('id')}`}
      >

        <div className={[_s.d, _s.border1PX, _s.radiusSmall, _s.overflowHidden, _s.borderColorSecondary, _s.mr15].join(' ')}>
          { firstImg ?
            <Image
              height='132px'
              width='132px'
              src={firstImg.get('preview_url')}
            />
            :
            <div className={[_s.bgTertiary, _s.d, _s.aiCenter, _s.jcCenter].join(' ')} style={{ height: '132px', width: '132px'}}>
              <Icon id='media' className={_s.cSecondary} size='40px' />
            </div>
          }
        </div>

        <div className={[_s.d, _s.flex1].join(' ')}>
          <div className={[_s.d].join(' ')}>
            <Text weight='bold' size='large' className={_s.pb5}>{item.get('title')}</Text>
            <Text size='medium' className={[_s.pb2, _s.pt2].join(' ')}>{item.get('price_label')}</Text>
            <Text color='secondary' size='small' className={[_s.pb2, _s.pt2].join(' ')}>
              Listed on {moment(item.get('created_at')).format('MM/DD/YYYY')}
            </Text>
          </div>
        </div>
      </NavLink>
    )
  }
}

const mapStateToProps = (state, { id }) => ({
  item: state.getIn(['marketplace_listings', `${id}`], null),
})

const mapDispatchToProps = (dispatch) => ({
  onFetchMarketplaceListingById(id) {
    dispatch(fetchMarketplaceListingById(id))
  },
})

MarketplaceListingListItem.propTypes = {
  id: PropTypes.string,
  item: ImmutablePropTypes.map,
  onFetchMarketplaceListingById: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(MarketplaceListingListItem)
