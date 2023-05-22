import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { closePopover } from '../../actions/popover'
import { openModal } from '../../actions/modal'
import { MODAL_CONFIRM } from '../../constants'
import {
  markReadNotifications,
  clearNotifications,
} from '../../actions/notifications'
import PopoverLayout from './popover_layout'
import List from '../list'

class NotificationSettingsPopover extends React.PureComponent {

  handleOnMarkAsRead = () => {
    this.props.onMarkReadNotifications()
    this.props.onClosePopover()
  }

  handleOnClear = () => {
    this.props.onClearNotifications()
  }

  handleOnClosePopover = () => {
    this.props.onClosePopover()
  }

  render() {
    const { isXS } = this.props

    const listItems = [
      {
        title: 'Mark all notifications as read',
        onClick: () => this.handleOnMarkAsRead(),
        isActive: false,
        hideArrow: true,
      },
      {},
      {
        title: 'Clear all notifications',
        onClick: () => this.handleOnClear(),
        isActive: false,
        hideArrow: true,
      },
    ]

    return (
      <PopoverLayout
        width={280}
        isXS={isXS}
        onClose={this.handleOnClosePopover}
      >
        <List
          scrollKey='notification_settings'
          items={listItems}
          size={isXS ? 'large' : 'small'}
        />
      </PopoverLayout>
    )
  }

}

const mapDispatchToProps = (dispatch) => ({
  onMarkReadNotifications: () => dispatch(markReadNotifications(true)),
  onClosePopover:() => dispatch(closePopover()),
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

export default connect(null, mapDispatchToProps)(NotificationSettingsPopover)