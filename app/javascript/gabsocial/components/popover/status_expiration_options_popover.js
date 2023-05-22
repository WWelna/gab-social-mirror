import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { defineMessages, injectIntl } from 'react-intl'
import { closePopover } from '../../actions/popover'
import {
  EXPIRATION_OPTION_5_MINUTES,
  EXPIRATION_OPTION_1_HOUR,
  EXPIRATION_OPTION_6_HOURS,
  EXPIRATION_OPTION_1_DAY,
  EXPIRATION_OPTION_3_DAYS,
  EXPIRATION_OPTION_7_DAYS
} from '../../constants'
import PopoverLayout from './popover_layout'
import List from '../list'
import Text from '../text'

class StatusExpirationOptionsPopover extends React.PureComponent {
  handleOnSetStatusExpiration = expires_at => {
    this.props.onExpires(expires_at)
    this.handleOnClosePopover()
  }

  handleOnClosePopover = () => {
    this.props.onClosePopover()
  }

  render() {
    const { expires_at, intl, isXS } = this.props

    const listItems = [
      {
        hideArrow: true,
        title: 'None',
        onClick: () => this.handleOnSetStatusExpiration(null),
        isActive: !expires_at
      },
      {
        hideArrow: true,
        title: intl.formatMessage(messages.minutes, { number: 5 }),
        onClick: () =>
          this.handleOnSetStatusExpiration(EXPIRATION_OPTION_5_MINUTES),
        isActive: expires_at === EXPIRATION_OPTION_5_MINUTES
      },
      {
        hideArrow: true,
        title: intl.formatMessage(messages.minutes, { number: 60 }),
        onClick: () =>
          this.handleOnSetStatusExpiration(EXPIRATION_OPTION_1_HOUR),
        isActive: expires_at === EXPIRATION_OPTION_1_HOUR
      },
      {
        hideArrow: true,
        title: '6 hours',
        title: intl.formatMessage(messages.hours, { number: 6 }),
        onClick: () =>
          this.handleOnSetStatusExpiration(EXPIRATION_OPTION_6_HOURS),
        isActive: expires_at === EXPIRATION_OPTION_6_HOURS
      },
      {
        hideArrow: true,
        title: intl.formatMessage(messages.hours, { number: 24 }),
        onClick: () =>
          this.handleOnSetStatusExpiration(EXPIRATION_OPTION_1_DAY),
        isActive: expires_at === EXPIRATION_OPTION_1_DAY
      },
      {
        hideArrow: true,
        title: '3 days',
        title: intl.formatMessage(messages.days, { number: 3 }),
        onClick: () =>
          this.handleOnSetStatusExpiration(EXPIRATION_OPTION_3_DAYS),
        isActive: expires_at === EXPIRATION_OPTION_3_DAYS
      },
      {
        hideArrow: true,
        title: intl.formatMessage(messages.days, { number: 7 }),
        onClick: () =>
          this.handleOnSetStatusExpiration(EXPIRATION_OPTION_7_DAYS),
        isActive: expires_at === EXPIRATION_OPTION_7_DAYS
      }
    ]

    if (expires_at) {
      listItems.unshift({
        hideArrow: true,
        title: 'Remove expiration',
        onClick: () => this.handleOnSetStatusExpiration(null)
      })
    }

    return (
      <PopoverLayout
        width={210}
        isXS={isXS}
        onClose={this.handleOnClosePopover}
      >
        <Text className={[_s.d, _s.px15, _s.py10, _s.bgSecondary].join(' ')}>
          This gab deletes after:
        </Text>
        <List
          scrollKey="status_expiration"
          items={listItems}
          size={isXS ? 'large' : 'small'}
        />
      </PopoverLayout>
    )
  }
}

const messages = defineMessages({
  minutes: {
    id: 'intervals.full.minutes',
    defaultMessage: '{number, plural, one {# minute} other {# minutes}}'
  },
  hours: {
    id: 'intervals.full.hours',
    defaultMessage: '{number, plural, one {# hour} other {# hours}}'
  },
  days: {
    id: 'intervals.full.days',
    defaultMessage: '{number, plural, one {# day} other {# days}}'
  }
})

const mapDispatchToProps = dispatch => ({
  onClosePopover() {
    dispatch(closePopover())
  }
})

StatusExpirationOptionsPopover.defaultProps = {
  intl: PropTypes.object.isRequired,
  isXS: PropTypes.bool,
  onExpires: PropTypes.func,
  expires_at: PropTypes.string
}

export default injectIntl(
  connect(null, mapDispatchToProps)(StatusExpirationOptionsPopover)
)
