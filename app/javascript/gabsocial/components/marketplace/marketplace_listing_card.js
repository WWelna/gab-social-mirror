import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'
import { NavLink } from 'react-router-dom'
import { CX } from '../../constants'
import { fetchMarketplaceListingById } from '../../actions/marketplace_listings'
import Text from '../text'
import Image from '../image'
import Icon from '../icon'

class MarketplaceListingCard extends ImmutablePureComponent {

  state = {
    isHovering: false,
  }

  componentDidMount() {
    const { item, onFetchMarketplaceListingById, id } = this.props

    if (!item) onFetchMarketplaceListingById(id)
  }

  componentDidUpdate(prevProps) {
    // const { item, onFetchMarketplaceListingById, id } = this.props
    //
  }

  handleOnMouseEnter = () => {
    this.setState({ isHovering: true })
  }

  handleOnMouseLeave = () => {
    this.setState({ isHovering: false })
  }

  render() {
    const { item } = this.props
    const { isHovering } = this.state

    if (!item) return null

    const firstImg = item.get('media_attachments').first()
    const priceClasses = CX({
      pb5: 1,
      underline: isHovering,
    })

    return (
      <NavLink
        className={[_s.d, _s.flexGrow1, _s.noUnderline, _s.bgSubtle_onHover, _s.radiusSmall, _s.border1PX, _s.borderColorSecondary, _s.overflowHidden].join(' ')}
        to={`/marketplace/item/${item.get('id')}`}
      >
        <div
          className={[_s.d].join(' ')}
          onMouseEnter={this.handleOnMouseEnter}
          onMouseLeave={this.handleOnMouseLeave}
        >
          <div className={[_s.d, _s.w100PC, _s.mb10].join(' ')}>
            <div className={[_s.d, _s.w100PC, _s.pt100PC].join(' ')}>
              <div className={[_s.d, _s.posAbs, _s.top0, _s.w100PC, _s.right0, _s.bottom0, _s.left0].join(' ')}>
                <div className={[_s.d, _s.w100PC, _s.h100PC, _s.aiCenter, _s.jcCenter, _s.bgTertiary, _s.borderBottom1PX, _s.borderColorSecondary].join(' ')}>
                  {firstImg ?
                    <Image
                      height='100%'
                      width='100%'
                      src={firstImg.get('preview_url')}
                    />
                    :
                    <Icon id='media' className={_s.cSecondary} size='60px' />
                  }
                </div>
              </div>
            </div>
          </div>

          <div className={[_s.d, _s.px10, _s.pb10].join(' ')}>
            <Text weight='bold' size='medium' className={priceClasses}>{item.get('price_label')}</Text>
            <Text>{item.get('title')}</Text>
            { !!item.get('location') && <Text color='secondary' size='small' className={_s.pt5}>{item.get('location')}</Text>}
          </div>
        </div>
      </NavLink>
    )
  }
}

const mapStateToProps = (state, { id }) => ({
  item: state.getIn(['marketplace_listings', `${id}`]),
})

const mapDispatchToProps = (dispatch) => ({
  onFetchMarketplaceListingById(id) {
    dispatch(fetchMarketplaceListingById(id))
  },
})

MarketplaceListingCard.propTypes = {
  id: PropTypes.string,
  item: ImmutablePropTypes.map,
  onFetchMarketplaceListingById: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(MarketplaceListingCard)
