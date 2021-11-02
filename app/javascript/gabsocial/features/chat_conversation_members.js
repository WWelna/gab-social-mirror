import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Account from '../components/account'

class ChatConversationMembers extends React.PureComponent {

  onClickClose = () => {
    this.props.onClose()
  }

  render() {
    const { chatConversation } = this.props

    const otherAccounts = chatConversation.get('other_account_ids')

    return (
      <div className={[_s.d, _s.borderTop1PX, _s.borderColorSecondary].join(' ')}>
        {
          otherAccounts &&
          otherAccounts.map((accountId) => {
            return (
              <Account
                key={`chat-conversation-member-${accountId}`}
                id={accountId}
                compact
              />
            )
          })
        }
      </div>
    )

  }

}

const mapStateToProps = (state, { chatConversationId }) => {
  return {
    chatConversation: state.getIn(['chat_conversations', chatConversationId])
  }
}

ChatConversationMembers.propTypes = {
  onClose: PropTypes.func.isRequired,
}

export default connect(mapStateToProps)(ChatConversationMembers)