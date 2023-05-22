import React from 'react'
import PropTypes from 'prop-types'
import { injectIntl, defineMessages } from 'react-intl'
import { URL_DISSENTER_SHOP } from '../../constants'
import TimelineInjectionLayout from './timeline_injection_layout'
import ProgressBar from '../progress_bar'
import { expenses } from '../../initial_state'

class ProgressInjection extends React.PureComponent {
  render() {
    const { intl, isXS, injectionId } = this.props

    return (
      <TimelineInjectionLayout
        title={intl.formatMessage(messages.operationsTitle)}
        subtitle={intl.formatMessage(messages.operationsSubtitle)}
        buttonHref={URL_DISSENTER_SHOP}
        buttonTitle={intl.formatMessage(messages.donationTitle)}
        id={injectionId}
        isXS={isXS}
      >
        <div className={[_s.d, _s.pt5, _s.pb15, _s.w100PC].join(' ')}>
          <ProgressBar
            progress={expenses}
            title={intl.formatMessage(messages.progressTitle, {
              value: expenses
            })}
            href={URL_DISSENTER_SHOP}
          />
        </div>
      </TimelineInjectionLayout>
    )
  }
}

const messages = defineMessages({
  progressTitle: {
    id: 'progress_title',
    defaultMessage: '{value}% covered this month'
  },
  operationsTitle: {
    id: 'operations_title',
    defaultMessage: 'Help keep Gab online'
  },
  operationsSubtitle: {
    id: 'operations_subtitle',
    defaultMessage: "We're 100% funded by you."
  },
  donationTitle: { id: 'make_donation', defaultMessage: 'Make a Donation' }
})

ProgressInjection.propTypes = {
  injectionId: PropTypes.string,
  intl: PropTypes.object,
  isXS: PropTypes.bool
}

export default injectIntl(ProgressInjection)
