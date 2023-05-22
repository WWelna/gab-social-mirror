import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { defineMessages, injectIntl } from 'react-intl'
import { isStaff } from '../../initial_state'
import {
  addShortcut,
  removeShortcut,
} from '../../actions/shortcuts'
import { blockGroup, unblockGroup } from '../../actions/groups'
import {
  isBlockingGroupId,
} from '../../utils/local_storage_blocks_mutes'
import {
  openPopover,
  closePopover,
} from '../../actions/popover'
import { POPOVER_SHARE } from '../../constants'
import PopoverLayout from './popover_layout'
import List from '../list'

class GroupOptionsPopover extends ImmutablePureComponent {

  handleOnClosePopover = () => {
    this.props.onClosePopover()
  }

  handleOnToggleShortcut = () => {
    this.handleOnClosePopover()
    if (this.props.isShortcut) {
      this.props.onRemoveShortcut(this.props.group.get('id'))
    } else {
      this.props.onAddShortcut(this.props.group.get('id'))
    }
  }

  handleOnShare = () => {
    this.props.onShare(this.props.group)
  }

  handleOnBlock = () => {
    this.handleOnClosePopover()
    this.props.onBlock(this.props.group.get('id'))
  }

  handleOnUnBlock = () => {
    this.handleOnClosePopover()
    this.props.onUnBlock(this.props.group.get('id'))
  }

  render() {
    const {
      group,
      intl,
      isAdmin,
      isShortcut,
      isXS,
      isMember,
    } = this.props

    if (!group) return <div/>

    const groupId = group.get('id')

    const listItems = []
    if (isAdmin) {
      listItems.push({
        hideArrow: true,
        icon: 'group',
        title: intl.formatMessage(messages.groupMembers),
        onClick: this.handleOnClosePopover,
        to: `/groups/${groupId}/members`,
        isHidden: !isAdmin,
      })
      listItems.push({
        hideArrow: true,
        icon: 'block',
        title: intl.formatMessage(messages.removedMembers),
        onClick: this.handleOnClosePopover,
        to: `/groups/${groupId}/removed-accounts`,
        isHidden: !isAdmin,
      })
      listItems.push({
        hideArrow: true,
        icon: 'pencil',
        title: intl.formatMessage(messages.editGroup),
        onClick: this.handleOnClosePopover,
        to: `/groups/${groupId}/edit`,
        isHidden: !isAdmin,
      })
      listItems.push({})
    }
      
    listItems.push({
      hideArrow: true,
      icon: 'share',
      title: 'Share group',
      onClick: this.handleOnShare,
    })
    listItems.push({})
    listItems.push({
      hideArrow: true,
      icon: isShortcut ? 'star' : 'star-outline',
      title: intl.formatMessage(isShortcut ? messages.remove_from_shortcuts : messages.add_to_shortcuts),
      onClick: this.handleOnToggleShortcut,
    })

    if (isStaff) {
      listItems.push({})
      listItems.push({
        title: intl.formatMessage(messages.open_in_admin, { name: group.getIn('title') }),
        href: `/admin/groups/${groupId}`,
        openInNewTab: true,
      })
    }

    if (!isBlockingGroupId(groupId)) {
      listItems.push({})
      listItems.push({
        title: 'Mute Group',
        onClick: this.handleOnBlock,
        hideArrow: true,
      })
    } else {
      listItems.push({})
      listItems.push({
        title: 'Unmute Group',
        onClick: this.handleOnUnBlock,
        hideArrow: true,
      })
    }

    return (
      <PopoverLayout
        width={240}
        isXS={isXS}
        onClose={this.handleOnClosePopover}
      >
        <List
          scrollKey='group_options'
          items={listItems}
          size={isXS ? 'large' : 'small'}
        />
      </PopoverLayout>
    )
  }

}

const messages = defineMessages({
  groupMembers: { id: 'group_members', defaultMessage: 'Group members' },
  removedMembers: { id: 'group_removed_members', defaultMessage: 'Removed accounts' },
  editGroup: { id: 'edit_group', defaultMessage: 'Edit group' },
  add_to_shortcuts: { id: 'account.add_to_shortcuts', defaultMessage: 'Add to shortcuts' },
  remove_from_shortcuts: { id: 'account.remove_from_shortcuts', defaultMessage: 'Remove from shortcuts' },
  open_in_admin: { id: 'status.admin_account', defaultMessage: 'Open moderation interface for @{name}' },
})

const mapStateToProps = (state, { group }) => {
  const groupId = group ? group.get('id') : null
  const shortcuts = state.getIn(['shortcuts', 'items'])
  const isShortcut = !!shortcuts.find((s) => {
    return s.get('shortcut_id') == groupId && s.get('shortcut_type') === 'group'
  })
  return { isShortcut }
}

const mapDispatchToProps = (dispatch, { innerRef }) => ({
  onClosePopover: () => dispatch(closePopover()),
  onAddShortcut(groupId) {
    dispatch(addShortcut('group', groupId))
  },
  onRemoveShortcut(groupId) {
    dispatch(removeShortcut(null, 'group', groupId))
  },
  onShare(group) {
    dispatch(openPopover(POPOVER_SHARE, {
      innerRef,
      group,
      position: 'top',
    }))
  },
  onBlock(groupId) {
    dispatch(blockGroup(groupId))
  },
  onUnBlock(groupId) {
    dispatch(unblockGroup(groupId))
  },
})

GroupOptionsPopover.defaultProps = {
  group: ImmutablePropTypes.map.isRequired,
  isAdmin: PropTypes.bool,
  isMember: PropTypes.bool,
  intl: PropTypes.object.isRequired,
  isXS: PropTypes.bool,
  isShortcut: PropTypes.bool,
  onAddShortcut: PropTypes.func.isRequired,
  onRemoveShortcut: PropTypes.func.isRequired,
  onClosePopover: PropTypes.func.isRequired,
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(GroupOptionsPopover))