import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { closePopover } from '../../actions/popover'
import { openModal } from '../../actions/modal'
import { MODAL_CONFIRM } from '../../constants'
import {
  clearNotifications,
} from '../../actions/notifications'
import { setFilter } from '../../actions/notifications'
import PopoverLayout from './popover_layout'
import SettingSwitch from '../setting_switch'
import List from '../list'
import Text from '../text'

class NotificationSettingsPopover extends React.PureComponent {

  handleOnClear = () => {
    this.props.onClearNotifications()
  }

  handleOnClosePopover = () => {
    this.props.onClosePopover()
  }

  render() {
    const {
      isXS,
      settings,
      onChangeSetting
    } = this.props


    const listItems = [
      isXS && {}, // spacer
      {
        title: 'Clear all notifications',
        onClick: () => this.handleOnClear(),
        isActive: false,
        hideArrow: true,
      },
    ].filter(Boolean)

    return (
      <PopoverLayout
        width={280}
        isXS={isXS}
        onClose={this.handleOnClosePopover}
      >
        <div className={[_s.d, _s.boxShadowNone].join(' ')}>
          {
            isXS &&
            <Text size='extraLarge' weight='medium' className={[_s.d, _s.px15, _s.py15, _s.borderBottom1PX, _s.borderColorSecondary].join(' ')}>
              Notification Settings
            </Text>
          }

          {
            isXS &&
            <div className={[_s.d, _s.px15, _s.py10].join(' ')}>
              <SettingSwitch
                prefix='notification'
                settings={settings}
                settingPath={'onlyVerified'}
                onChange={onChangeSetting}
                label='Only Verified Users'
                labelProps={{
                  size: 'large'
                }}
              />

              <SettingSwitch
                prefix='notification'
                settings={settings}
                settingPath={'onlyFollowing'}
                onChange={onChangeSetting}
                label='Only People I Follow'
                labelProps={{
                  size: 'large'
                }}
              />
            </div>
          }

          <List
            scrollKey='notification_settings'
            items={listItems}
            size={isXS ? 'large' : 'small'}
          />
        </div>
      </PopoverLayout>
    )
  }

}

const mapStateToProps = (state) => ({
  settings: state.getIn(['notifications', 'filter']),
})

const mapDispatchToProps = (dispatch) => ({
  onClosePopover:() => dispatch(closePopover()),
  onChangeSetting(path, value) {
    dispatch(setFilter(path, value))
  },
  onClearNotifications: () => {
    dispatch(closePopover()),
    dispatch(openModal(MODAL_CONFIRM, {
      title: 'Delete all Notifications',
      message: 'Are you sure you want to delete all of your notifications?',
      confirm: 'Delete',
      onConfirm: () => dispatch(clearNotifications()),
    }))
  }
})

NotificationSettingsPopover.defaultProps = {
  tab: PropTypes.string.isRequired,
  onClosePopover: PropTypes.func.isRequired,
  onSortLists: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(NotificationSettingsPopover)