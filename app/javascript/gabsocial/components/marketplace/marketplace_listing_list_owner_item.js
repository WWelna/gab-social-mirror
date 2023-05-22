import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import moment from 'moment-mini'
import { connect } from 'react-redux'
import { fetchMarketplaceListingById } from '../../actions/marketplace_listings'
import { openPopover } from '../../actions/popover'
import { me } from '../../initial_state'
import {
  CX,
  BREAKPOINT_EXTRA_SMALL,
  POPOVER_MARKETPLACE_LISTING_CHANGE_STATUS,
  POPOVER_MARKETPLACE_LISTING_OPTIONS,
} from '../../constants'
import MarketplaceListingStatusTag from './marketplace_listing_status_tag'
import isObject from 'lodash/isObject'
import Text from '../text'
import Button from '../button'
import Icon from '../icon'
import Image from '../image'

class MarketplaceListingListItem extends ImmutablePureComponent {

  componentDidUpdate(prevProps) {
    const { item, onFetchMarketplaceListingById, id } = this.props
    
    if (!item && id !== prevProps.id) onFetchMarketplaceListingById(id)
  }

  componentDidMount() {
    const { item, onFetchMarketplaceListingById, id } = this.props
    
    if (!item) onFetchMarketplaceListingById(id)
  }

  handleOnOpenChangeStatus = () => {
    this.props.onOpenMarketplaceListingChangeStatus(this.changeStatusNode, this.props.id)
  }

  handleOnOpenOptions = () => {
    this.props.onOpenMarketplaceListingOptions(this.optionsNode, this.props.id)
  }

  setChangeStatusRef = (n) => {
    this.changeStatusNode = n
  }

  setOptionsRef = (n) => {
    this.optionsNode = n
  }

  render() {
    const { item, isOwner, isXS } = this.props

    if (!item || !isOwner) return null

    const firstImg = item.get('media_attachments').first()
    const containerClasses = CX({
      d: 1,
      w100PC: 1,
      px10: !isXS,
      px5: isXS,
      pt10: 1,
      pb10: !isXS,
      pb15: isXS,
      flexRow: !isXS,
      borderColorSecondary: 1,
      borderBottom1PX: 1,
      mb10: 1,
    })

    const contentClasses = CX({
      d: 1,
      flex1: 1,
      pl15: !isXS && !!firstImg,
      pt15: isXS,
    })

    return (
      <div className={containerClasses}>
        <Image
          height='132px'
          width='132px'
          src={firstImg ? firstImg.get('preview_url') : null}
          className={[_s.radiusSmall, _s.overflowHidden].join(' ')}
        />
        <div className={contentClasses}>
          <div className={[_s.d].join(' ')}>
            {/* : todo : truncate */}
            <Text weight='bold' size='large' className={_s.pb5}>{item.get('title')}</Text>
            <Text size='medium' className={[_s.pb2, _s.pt2].join(' ')}>{item.get('price_label')}</Text>
            <Text color='secondary' size='small' className={[_s.pb2, _s.pt5].join(' ')}>
              Listed on {moment(item.get('created_at')).format('MM/DD/YYYY')}
              &nbsp;&nbsp;·&nbsp;&nbsp;
              <MarketplaceListingStatusTag statusI={item.get('status_i')} statusS={item.get('status_s')} />
            </Text>
          </div>

          <div className={[_s.d, _s.flexRow, _s.flexWrap, _s.mtAuto, _s.pt10].join(' ')}>
            <Button
              radiusSmall
              isOutline
              backgroundColor='none'
              color='brand'
              className={[_s.minW120PX, _s.aiCenter, _s.mr10].join(' ')}
              to={`/marketplace/item/${item.get('id')}`}
            >
              <Text color='inherit' weight='bold' align='center'>View Listing</Text>
            </Button>
            <Button
              radiusSmall
              backgroundColor='tertiary'
              color='secondary'
              className={[_s.minW120PX, _s.aiCenter, _s.mr10].join(' ')}
              buttonRef={this.setChangeStatusRef}
              onClick={this.handleOnOpenChangeStatus}
            >
              <Text color='inherit' weight='bold' align='center'>Change Listing Status</Text>
            </Button>
            <Button
              radiusSmall
              backgroundColor='tertiary'
              color='secondary'
              icon='ellipsis'
              iconSize='14px'
              iconClassName={_s.pt2}
              buttonRef={this.setOptionsRef}
              onClick={this.handleOnOpenOptions}
              className={[_s.aiCenter].join(' ')}
            />
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, { id }) => {
  const item = state.getIn(['marketplace_listings', `${id}`], null)

  return {
    item,
    isOwner: !!item ? item.getIn(['account', 'id']) === me : false,
    isXS: state.getIn(['settings', 'window_dimensions', 'width']) <= BREAKPOINT_EXTRA_SMALL,
  }
}


const mapDispatchToProps = (dispatch) => ({
  onFetchMarketplaceListingById(id) {
    dispatch(fetchMarketplaceListingById(id))
  },
  onOpenMarketplaceListingChangeStatus(targetRef, id) {
    dispatch(openPopover(POPOVER_MARKETPLACE_LISTING_CHANGE_STATUS, {
      targetRef,
      id,
    }))
  },
  onOpenMarketplaceListingOptions(targetRef, id) {
    dispatch(openPopover(POPOVER_MARKETPLACE_LISTING_OPTIONS, {
      targetRef,
      id,
    }))
  },
})

MarketplaceListingListItem.propTypes = {
  onFetchMarketplaceListingById: PropTypes.func,
  onOpenMarketplaceListingOptions: PropTypes.func,
  id: PropTypes.string,
  isXS: PropTypes.bool,
  item: ImmutablePropTypes.map,
}

export default connect(mapStateToProps, mapDispatchToProps)(MarketplaceListingListItem)
