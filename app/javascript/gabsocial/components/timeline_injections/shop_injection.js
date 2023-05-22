import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { defineMessages, injectIntl } from 'react-intl'
import { URL_DISSENTER_SHOP } from '../../constants'
import ShopItem from '../shop_item'
import TimelineInjectionLayout from './timeline_injection_layout'

class ShopInjection extends React.PureComponent {
  render() {
    const { intl, items, isError, injectionId } = this.props

    if (!items || isError || !Array.isArray(items)) return <div />
    if (items.length <= 0) return <div />

    return (
      <TimelineInjectionLayout
        id={injectionId}
        title={intl.formatMessage(messages.title)}
        buttonHref={URL_DISSENTER_SHOP}
        buttonTitle={intl.formatMessage(messages.shop_now)}
      >
        {items.map((block, i) => (
          <ShopItem
            key={`shop-item-injection-${i}`}
            image={block.image}
            name={block.name}
            link={block.link}
            price={block.price}
          />
        ))}
      </TimelineInjectionLayout>
    )
  }
}

const messages = defineMessages({
  title: { id: 'shop_panel.title', defaultMessage: 'Dissenter Shop' },
  shop_now: {
    id: 'shop_panel.shop_now',
    defaultMessage: 'Visit the Dissenter Shop'
  }
})

const mapStateToProps = state => ({
  items: state.getIn(['shop', 'featured', 'items']),
  isError: state.getIn(['shop', 'featured', 'isError'])
})

ShopInjection.propTypes = {
  intl: PropTypes.object,
  items: PropTypes.array,
  isError: PropTypes.bool,
  injectionId: PropTypes.string
}

export default injectIntl(connect(mapStateToProps)(ShopInjection))
