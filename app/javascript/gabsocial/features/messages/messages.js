import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ChatEmptyMessageBlock from './components/chat_conversations_empty_block'
import ChatMessageHeader from './components/chat_message_header'
import ChatMessageScrollingList from './components/chat_message_scrolling_list'
import ChatMessageComposeForm from './components/chat_message_compose_form'
import ChatConversationRequestApproveBar from './components/chat_conversation_request_approve_bar'

class Messages extends React.PureComponent {

  render () {
    const {
      selectedChatConversationId,
      chatConverationIsRequest,
      isXS,
    } = this.props

    return (
      <div className={[_s.d, _s.bgPrimary, _s.h100PC, _s.w100PC].join(' ')}>
        {
          !selectedChatConversationId &&
          <ChatEmptyMessageBlock />
        }
        {
          !!selectedChatConversationId &&
          <div className={[_s.d, _s.h100PC, _s.w100PC].join(' ')}>
            <ChatMessageHeader chatConversationId={selectedChatConversationId} />
            <ChatMessageScrollingList chatConversationId={selectedChatConversationId} />
            { !chatConverationIsRequest && <ChatMessageComposeForm chatConversationId={selectedChatConversationId} isXS={isXS} /> }
            { chatConverationIsRequest && <ChatConversationRequestApproveBar chatConversationId={selectedChatConversationId} isXS={isXS} /> }
          </div>
        }
      </div>
    )
  }

}

const mapStateToProps = (state) => {
  const selectedChatConversationId = state.getIn(['chats', 'selectedChatConversationId'], null)
  const chatConverationIsRequest = selectedChatConversationId ? !state.getIn(['chat_conversations', selectedChatConversationId, 'is_approved'], null) : false
  return {
    selectedChatConversationId,
    chatConverationIsRequest,
  }
}

Messages.propTypes = {
  isXS: PropTypes.bool,
  selectedChatConversationId: PropTypes.string,
  chatConverationIsRequest: PropTypes.bool.isRequired,
}

export default connect(mapStateToProps)(Messages)