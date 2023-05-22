import React from 'react'
import PropTypes from 'prop-types'
import { injectIntl, defineMessages } from 'react-intl'
import { Konfettikanone } from 'react-konfettikanone'
import {
  URL_DISSENTER_SHOP,
  URL_DISSENTER_SHOP_DONATIONS
} from '../../constants'
import { expenses, isPro } from '../../initial_state'
import PanelLayout from './panel_layout'
import ProgressBar from '../progress_bar'
import Button from '../button'
import Text from '../text'
import Icon from '../icon'

class ProgressPanel extends React.PureComponent {
  render() {
    const { intl } = this.props

    const isFunded = expenses >= 100

    const subtitle = (
      <div className={[_s.d, _s.flexRow, _s.aiCenter, _s.jcCenter].join(' ')}>
        <Text
          color="secondary"
          size="small"
          weight="bold"
          className={_s.mrAuto}
        >
          {intl.formatMessage(messages.operationsSubtitle)}
        </Text>
        <Button
          noClasses
          href={URL_DISSENTER_SHOP_DONATIONS}
          className={[
            _s.d,
            _s.flexRow,
            _s.aiCenter,
            _s.jcCenter,
            _s.outlineNone,
            _s.bgTransparent,
            _s.noUnderline
          ].join(' ')}
        >
          <Text align="center" color="brand" weight="medium" className={_s.mr5}>
            Donate
          </Text>
          <Icon id="arrow-right" className={_s.cBrand} size="14px" />
        </Button>
      </div>
    )

    return (
      <PanelLayout
        key="progress-panel"
        noPadding
        title={intl.formatMessage(messages.operationsTitle)}
        subtitle={subtitle}
      >
        {isFunded && (
          <Konfettikanone
            launch
            colors={['#21cf7a1f', '#21cf7a3b', '#21cf7a5c', '#21cf7a80']}
            duration={50}
          />
        )}
        <div className={[_s.d, _s.px15, _s.pb15, _s.pt5].join(' ')}>
          <ProgressBar
            progress={expenses}
            title={intl.formatMessage(messages.progressTitle, {
              value: expenses
            })}
            href={URL_DISSENTER_SHOP}
          />
        </div>
        {isFunded && isPro && (
          <div className={[_s.d, _s.px15, _s.pb15].join(' ')}>
            <Text align="left" size="small" weight="medium" color="secondary">
              Thank you for being a GabPRO member!
            </Text>
          </div>
        )}
      </PanelLayout>
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

ProgressPanel.propTypes = { intl: PropTypes.object.isRequired }

export default injectIntl(ProgressPanel)
