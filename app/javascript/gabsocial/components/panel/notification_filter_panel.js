import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { defineMessages, injectIntl } from 'react-intl'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { POPOVER_NOTIFICATION_SETTINGS } from '../../constants'
import { setFilter } from '../../actions/notifications'
import { openPopover } from '../../actions/popover'
import PanelLayout from './panel_layout'
import SettingSwitch from '../setting_switch'
import Icon from '../icon'

class NotificationFilterPanel extends ImmutablePureComponent {

  handleOnClickSettings = () => {
    this.props.onOpenPopover(this.node)
  }

  setRef = (n) => {
    this.node = n
  }

  render() {
    const {
      intl,
      onChange,
      settings,
    } = this.props

    return (
      <PanelLayout
        title='Notification Settings'
        headerButtonTitle={<Icon id='cog'/>}
        headerButtonRef={this.setRef}
        headerButtonAction={this.handleOnClickSettings}
      >
        <SettingSwitch
          prefix='notification'
          settings={settings}
          settingPath={'onlyVerified'}
          onChange={onChange}
          label={intl.formatMessage(messages.onlyVerified)}
        />

        <SettingSwitch
          prefix='notification'
          settings={settings}
          settingPath={'onlyFollowing'}
          onChange={onChange}
          label={intl.formatMessage(messages.onlyFollowing)}
        />
      </PanelLayout>
    )
  }
}

const messages = defineMessages({
  title: { id: 'notification_filters', defaultMessage: 'Notification Filters' },
  onlyVerified: { id: 'notification_only_verified', defaultMessage: 'Only Verified Users' },
  onlyFollowing: { id: 'notification_only_following', defaultMessage: 'Only People I Follow' },
})

const mapStateToProps = (state) => ({
  settings: state.getIn(['notifications', 'filter']),
})

const mapDispatchToProps = (dispatch) => ({
  onChange(path, value) {
    dispatch(setFilter(path, value))
  },
  onOpenPopover(targetRef) {
    dispatch(openPopover(POPOVER_NOTIFICATION_SETTINGS, {
      targetRef,
    }))
  }
})

NotificationFilterPanel.propTypes = {
  intl: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  settings: ImmutablePropTypes.map.isRequired,
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(NotificationFilterPanel))