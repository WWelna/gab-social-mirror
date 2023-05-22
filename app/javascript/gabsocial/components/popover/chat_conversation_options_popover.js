import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { connect } from 'react-redux'
import { closePopover } from '../../actions/popover'
import { openModal } from '../../actions/modal'
import { hideChatConversation } from '../../actions/chat_conversations'
import { setChatConversationSelected } from '../../actions/chats'
import { initReport } from '../../actions/reports'
import {
  muteChatConversation,
  unmuteChatConversation,
  pinChatConversation,
  unpinChatConversation,
  leaveGroupChatConversation,
} from '../../actions/chat_conversation_accounts'
import { purgeChatMessages } from '../../actions/chat_messages'
import { makeGetChatConversation } from '../../selectors'
import { MODAL_CHAT_CONVERSATION_MEMBERS } from '../../constants'
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
    this.props.onPurge()
    this.handleOnClosePopover()
  }

  handleOnReport = (account) => {
    this.props.onReport(account)
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
      chatConversation,
    } = this.props

    const otherAccounts = !!chatConversation ? chatConversation.get('other_accounts') : null

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
    if (!isGroupChat && otherAccounts && otherAccounts.size === 1) {
      const otherAccount = otherAccounts.get(0)
      const amITalkingToMyself = otherAccount.get('id') === me
      if (!amITalkingToMyself) {
        items.push({})
        items.push({
          hideArrow: true,
          title: `Report @${otherAccount.get('acct')}`,
          onClick: () => this.handleOnReport(otherAccount),
        })
      }
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
  chatConversation: makeGetChatConversation()(state, { id: chatConversationId }),
  isMuted: state.getIn(['chat_conversations', chatConversationId, 'is_muted']),
  isPinned: state.getIn(['chat_conversations', chatConversationId, 'is_pinned']),
  isGroupChat: state.getIn(['chat_conversations', chatConversationId, 'is_group_chat']),
})

const mapDispatchToProps = (dispatch, { chatConversationId }) => ({
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
  },
  onReport(account) {
    dispatch(initReport(account, null, { noStatuses: true }))
  },
})

ChatConversationOptionsPopover.propTypes = {
  isXS: PropTypes.bool,
  chatConversation: ImmutablePropTypes.map,
  isChatConversationRequest: PropTypes.bool,
  onClosePopover: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatConversationOptionsPopover)