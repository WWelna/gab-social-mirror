import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import DatePicker from 'react-datepicker'
import { FormattedMessage } from 'react-intl'
import moment from 'moment-mini'
import { closePopover } from '../../actions/popover'
import PopoverLayout from './popover_layout'
import Button from '../button'
import Text from '../text'

import '!style-loader!css-loader!react-datepicker/dist/react-datepicker.css'

class DatePickerPopover extends React.PureComponent {
  state = { scheduled_at: this.props.scheduled_at }

  onChange = evt => {
    const scheduled_at = evt.target && evt.type ? null : evt
    this.setState({ scheduled_at })
    this.props.onSchedule(evt)
  }

  render() {
    const { scheduled_at } = this.state
    const { isPro, isXS } = this.props
    const datePickerDisabled = !isPro

    return (
      <PopoverLayout
        width={360}
        isXS={isXS}
        onClose={this.props.onClosePopover}
      >
        <div className={[_s.d, _s.bgSubtle].join(' ')}>
          <DatePicker
            inline
            target={this}
            minDate={new Date()}
            selected={scheduled_at}
            onChange={this.onChange}
            timeFormat="p"
            timeIntervals={15}
            timeCaption="Time"
            dateFormat="MMM d, yyyy h:mm aa"
            disabled={datePickerDisabled}
            showTimeSelect
            popperModifiers={{
              offset: {
                enabled: true,
                offset: '0px, 5px'
              },
              preventOverflow: {
                enabled: true,
                escapeWithReference: false,
                boundariesElement: 'viewport'
              }
            }}
          />
        </div>
        {scheduled_at && (
          <div
            className={[
              _s.d,
              _s.aiCenter,
              _s.flexRow,
              _s.px10,
              _s.py10,
              _s.borderTop1PX,
              _s.borderColorSecondary
            ].join(' ')}
          >
            <Text size="extraSmall" color="secondary">
              <FormattedMessage
                id="scheduled_for_datetime"
                defaultMessage="Scheduled for {datetime}"
                values={{
                  datetime: moment(scheduled_at).format('lll')
                }}
              />
            </Text>
            <div className={_s.mlAuto}>
              <Button
                isNarrow
                radiusSmall
                color="primary"
                backgroundColor="tertiary"
                onClick={this.onChange}
              >
                <Text color="inherit" size="small">
                  <FormattedMessage id="remove" defaultMessage="Remove" />
                </Text>
              </Button>
            </div>
          </div>
        )}
      </PopoverLayout>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  onClosePopover: () => dispatch(closePopover())
})

DatePickerPopover.propTypes = {
  scheduled_at: PropTypes.date,
  isPro: PropTypes.bool,
  position: PropTypes.string,
  small: PropTypes.bool,
  isXS: PropTypes.bool,
  onClosePopover: PropTypes.func.isRequired,
  onSchedule: PropTypes.func
}

export default connect(null, mapDispatchToProps)(DatePickerPopover)
