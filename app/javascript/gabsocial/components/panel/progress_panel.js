import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { injectIntl, defineMessages } from 'react-intl'
import { Konfettikanone } from 'react-konfettikanone'
import {
  URL_DISSENTER_SHOP,
  URL_DISSENTER_SHOP_DONATIONS,
} from '../../constants'
import { me } from '../../initial_state'
import { fetchExpenses } from '../../actions/expenses'
import PanelLayout from './panel_layout'
import ProgressBar from '../progress_bar'
import Button from '../button'
import Text from '../text'
import Icon from '../icon'

class ProgressPanel extends React.PureComponent {

  componentDidMount() {
    if (!this.props.isFetched) {
      this.props.onFetchExpenses()
    }
  }

  render() {
    const {
      intl,
      value,
      isFetched,
      isPro,
    } = this.props

    if (value === 0 && !isFetched) return null

    const isFunded = value >= 100

    const subtitle = (
      <div className={[_s.d, _s.flexRow, _s.aiCenter, _s.jcCenter].join(' ')}>
        <Text color='secondary' size='small' weight='bold' className={_s.mrAuto}>
          {intl.formatMessage(messages.operationsSubtitle)}
        </Text>
        <Button
          noClasses
          href={URL_DISSENTER_SHOP_DONATIONS}
          className={[_s.d, _s.flexRow, _s.aiCenter, _s.jcCenter, _s.outlineNone, _s.bgTransparent, _s.noUnderline].join(' ')}
        >
          <Text align='center' color='brand' weight='medium' className={_s.mr5}>
            Donate
          </Text>
          <Icon id='arrow-right' className={_s.cBrand} size='14px' />
        </Button>
      </div>
    )

    return (
      <PanelLayout
        noPadding
        title={intl.formatMessage(messages.operationsTitle)}
        subtitle={subtitle}
      >
        {
          isFunded &&
          <Konfettikanone launch colors={['#21cf7a1f', '#21cf7a3b', '#21cf7a5c', '#21cf7a80']} duration={50} />
        }
        <div className={[_s.d, _s.px15, _s.pb15, _s.pt5].join(' ')}>
          <ProgressBar
            progress={value}
            title={intl.formatMessage(messages.progressTitle, { value })}
            href={URL_DISSENTER_SHOP}
          />
        </div>
        { isFunded && isPro && (
          <div className={[_s.d, _s.px15, _s.pb15].join(' ')}>
            <Text align='left' size='small' weight='medium' color='secondary'>
              Thank you for being a GabPRO member!
            </Text>
          </div>
        )}
      </PanelLayout>
    )
  }

}

const messages = defineMessages({
  progressTitle: { id: 'progress_title', defaultMessage: '{value}% covered this month' },
  operationsTitle: { id: 'operations_title', defaultMessage: "Help keep Gab online" },
  operationsSubtitle: { id: 'operations_subtitle', defaultMessage: "We're 100% funded by you." },
  donationTitle: { id: 'make_donation', defaultMessage: 'Make a Donation' },
})

const mapStateToProps = (state) => ({
  isFetched: state.getIn(['expenses', 'fetched'], false),
  value: state.getIn(['expenses', 'value'], 0),
  isPro: state.getIn(['accounts', me, 'is_pro'], false),
})

const mapDispatchToProps = (dispatch) => ({
  onFetchExpenses() {
    dispatch(fetchExpenses())
  },
})

ProgressPanel.propTypes = {
  intl: PropTypes.object.isRequired,
  isFetched: PropTypes.bool.isRequired,
  isPro: PropTypes.bool.isRequired,
  value: PropTypes.number.isRequired,
  onFetchExpenses: PropTypes.func.isRequired,
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(ProgressPanel))
