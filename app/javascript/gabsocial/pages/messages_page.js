import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import isObject from 'lodash.isobject'
import { setChatConversationSelected } from '../actions/chats'
import { fetchChatConversation } from '../actions/chat_conversations'
import PageTitle from '../features/ui/util/page_title'
import MessagesLayout from '../layouts/messages_layout'

class MessagesPage extends React.PureComponent {

  componentDidUpdate(prevProps) {
    if ((prevProps.location !== this.props.location) ||
      (prevProps.chatConversation !== this.props.chatConversation)) {
      this.handleOnSetChatConversationSelected(this.props.params)
    }
  }

  componentDidMount() {
    const { chatConversation, chatConversationId } = this.props
    if (!chatConversation && !!chatConversationId) {
      this.props.onFetchChatConversation(chatConversationId)
    }
    this.handleOnSetChatConversationSelected(this.props.params)
  }

  handleOnSetChatConversationSelected = (propsParams) => {
    if (isObject(this.props.params)) {
      const { chatConversationId } = this.props.params
      if (chatConversationId) {
        this.props.onSetChatConversationSelected(chatConversationId)
        return
      }
    }

    this.props.onSetChatConversationSelected(null)
  }

  render() {
    const {
      children,
      isSettings,
      source,
    } = this.props

    return (
      <MessagesLayout
        showBackBtn
        isSettings={isSettings}
        title='Chats'
        source={source}
      >
        <PageTitle path='Chats' />
        {children}
      </MessagesLayout>
    )
  }

}

const mapStateToProps = (state, props) => {
  const chatConversationId = isObject(props.params) ? props.params.chatConversationId : null
  const chatConversation = !!chatConversationId ? state.getIn(['chat_conversations', chatConversationId]) : null

  return {
    chatConversationId,
    chatConversation,
  }
}

const mapDispatchToProps = (dispatch) => ({
  onSetChatConversationSelected(chatConversationId) {
    dispatch(setChatConversationSelected(chatConversationId))
  },
  onFetchChatConversation(chatConversationId) {
    dispatch(fetchChatConversation(chatConversationId))
  },
})

MessagesPage.propTypes = {
  children: PropTypes.node.isRequired,
  isSettings: PropTypes.func,
  source: PropTypes.string,
  onSetChatConversationSelected: PropTypes.func.isRequired,
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MessagesPage))