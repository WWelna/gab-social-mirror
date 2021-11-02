import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { connect } from 'react-redux'
import { closePopover } from '../../actions/popover'
import { openModal } from '../../actions/modal'
import { hideChatConversation } from '../../actions/chat_conversations'
import { setChatConversationSelected } from '../../actions/chats'
import {
  muteChatConversation,
  unmuteChatConversation,
  pinChatConversation,
  unpinChatConversation,
  leaveGroupChatConversation,
} from '../../actions/chat_conversation_accounts'
import { purgeChatMessages } from '../../actions/chat_messages'
import {
  MODAL_PRO_UPGRADE,
  MODAL_CHAT_CONVERSATION_MEMBERS,
} from '../../constants'
import { me } from '../../initial_state'
import PopoverLayout from './popover_layout'
import List from '../list'

class ChatConversationOptionsPopover extends ImmutablePureComponent {

  handleOnHide = () => {
    this.props.onHide()
    this.handleOnClosePopover()
  }

  handleOnMute = () => {
    if (this.props.isMuted) {
      this.props.onUnmute()
    } else {
      this.props.onMute()
    }
    this.handleOnClosePopover()
  }

  handleOnPin = () => {
    if (this.props.isPinned) {
      this.props.onUnpin()
    } else {
      this.props.onPin()
    }
    this.handleOnClosePopover()
  }

  handleOnPurge = () => {
    if (!this.props.isPro) {
      this.props.openProUpgradeModal()
    } else {
      this.props.onPurge()
    }

    this.handleOnClosePopover()
  }

  handleOnLeaveGroupChat = () => {
    this.props.onLeaveGroupChatConversation()
    this.handleOnClosePopover()
  }

  handleOnViewMembers = () => {
    this.props.openMembersModal()
    this.handleOnClosePopover()
  }

  handleOnClosePopover = () => {
    this.props.onClosePopover()
  }

  render() {
    const {
      isXS,
      isMuted,
      isPinned,
      isChatConversationRequest,
      isGroupChat,
    } = this.props

    const items = [
      {
        hideArrow: true,
        title: 'Hide Conversation',
        subtitle: 'Hide until next message',
        onClick: () => this.handleOnHide(),
      },
    ]
    if (!isChatConversationRequest) {
      items.push({})
      items.push({
        hideArrow: true,
        title: isPinned ? 'Un-Pin Conversation' : 'Pin Conversation',
        subtitle: isPinned ? null : 'Show this conversation at top of list',
        onClick: () => this.handleOnPin(),
      })
      items.push({})
      items.push({
        hideArrow: true,
        title: isMuted ? 'Unmute Conversation' : 'Mute Conversation',
        subtitle: isMuted ? null : 'Don\'t get notified of new messages',
        onClick: () => this.handleOnMute(),
      })
      items.push({})
      items.push({
        hideArrow: true,
        title: 'Purge messages',
        subtitle: 'Remove all of your messages in this conversation',
        onClick: () => this.handleOnPurge(),
      })
    }
    if (isGroupChat) {
      items.push({})
      items.push({
        hideArrow: true,
        title: 'Leave group chat',
        onClick: () => this.handleOnLeaveGroupChat(),
      })
      items.push({
        hideArrow: true,
        title: 'View members',
        onClick: () => this.handleOnViewMembers(),
      })
    }

    return (
      <PopoverLayout
        width={220}
        isXS={isXS}
        onClose={this.handleOnClosePopover}
      >
        <List
          size={isXS ? 'large' : 'small'}
          scrollKey='chat_conversation_options'
          items={items}
        />
      </PopoverLayout>
    )
  }
}

const mapStateToProps = (state, { chatConversationId }) => ({
  isPro: state.getIn(['accounts', me, 'is_pro']),
  isMuted: state.getIn(['chat_conversations', chatConversationId, 'is_muted']),
  isPinned: state.getIn(['chat_conversations', chatConversationId, 'is_pinned']),
  isGroupChat: state.getIn(['chat_conversations', chatConversationId, 'is_group_chat']),
})

const mapDispatchToProps = (dispatch, { chatConversationId }) => ({
  openProUpgradeModal() {
    dispatch(openModal(MODAL_PRO_UPGRADE))
  },
  onPurge() {
    dispatch(purgeChatMessages(chatConversationId))
  },
  onHide() {
    dispatch(hideChatConversation(chatConversationId))
    dispatch(setChatConversationSelected(null))
  },
  onMute() {
    dispatch(muteChatConversation(chatConversationId))
  },
  onUnmute() {
    dispatch(unmuteChatConversation(chatConversationId))
  },
  onPin() {
    dispatch(pinChatConversation(chatConversationId))
  },
  onUnpin() {
    dispatch(unpinChatConversation(chatConversationId))
  },
  onClosePopover() {
    dispatch(closePopover())
  },
  onLeaveGroupChatConversation() {
    dispatch(leaveGroupChatConversation(chatConversationId))
  },
  openMembersModal() {
    dispatch(openModal(MODAL_CHAT_CONVERSATION_MEMBERS, {
      chatConversationId,
    }))
  }
})

ChatConversationOptionsPopover.propTypes = {
  isXS: PropTypes.bool,
  isPro: PropTypes.bool.isRequired,
  chatConversation: ImmutablePropTypes.map,
  isChatConversationRequest: PropTypes.bool,
  onClosePopover: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatConversationOptionsPopover)