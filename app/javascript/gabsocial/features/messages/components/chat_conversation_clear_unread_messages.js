import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { chatConversationUnreadCountReset } from '../../../actions/chat_conversations'
import { openModal } from '../../../actions/modal'
import { MODAL_CONFIRM } from '../../../constants'
import Button from '../../../components/button'
import Text from '../../../components/text'

class ChatConversationClearUnreadMessages extends React.PureComponent {

  handleOnClick = () => {
    this.props.onOpenConfirmationModal(this.handleOnChatConversationUnreadCountReset)
  }

  handleOnChatConversationUnreadCountReset = () => {
    this.props.onChatConversationUnreadCountReset()
  }

  render() {
    const { unreadChatsCount } = this.props

    if (isNaN(unreadChatsCount) || unreadChatsCount <= 0) return null

    return (
      <Button
        noClasses
        className={[_s.d, _s.w100PC, _s.bgTransparent, _s.bgSubtle_onHover, _s.borderBottom1PX, _s.borderColorSecondary, _s.noUnderline, _s.outlineNone, _s.cursorPointer].join(' ')}
        onClick={this.handleOnClick}
      >
        <div className={[_s.d, _s.px15, _s.py15, _s.aiCenter, _s.flexRow].join(' ')}>
          <Text size='medium'>Mark all as read</Text>
        </div>
      </Button>
    )
  }

}


const mapStateToProps = (state) => ({
  unreadChatsCount: state.getIn(['chats', 'chatsUnreadCount']),
})

const mapDispatchToProps = (dispatch) => ({
  onChatConversationUnreadCountReset() {
    dispatch(chatConversationUnreadCountReset())
  },
  onOpenConfirmationModal(onConfirm) {
    dispatch(openModal(MODAL_CONFIRM, {
      title: 'Are you sure?',
      message: 'This action will mark all of your unread messages as "read". Your unread message counter will be set to 0. No messages will be deleted.',
      confirm: 'Yes',
      onConfirm,
    }))
  },
})

ChatConversationClearUnreadMessages.propTypes = {
  onChatConversationUnreadCountReset: PropTypes.func,
  onOpenConfirmationModal: PropTypes.func,
  unreadChatsCount: PropTypes.number,
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatConversationClearUnreadMessages)