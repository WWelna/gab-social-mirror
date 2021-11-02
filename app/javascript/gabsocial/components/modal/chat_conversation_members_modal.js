import React from 'react'
import PropTypes from 'prop-types'
import ModalLayout from './modal_layout'
import { ChatConversationMembers } from '../../features/ui/util/async_components'
import WrappedBundle from '../../features/ui/util/wrapped_bundle'

class ChatConversationMembersModal extends React.PureComponent {

  render() {
    const { onClose, chatConversationId } = this.props

    return (
      <ModalLayout
        title='Chat Conversation Members'
        width={480}
        onClose={onClose}
        noPadding
      >
        <WrappedBundle
          component={ChatConversationMembers}
          componentParams={{
            chatConversationId,
            onCloseModal: onClose,
            isModal: true,
          }}
        />
      </ModalLayout>
    )
  }

}

ChatConversationMembersModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  chatConversationId: PropTypes.string,
}

export default ChatConversationMembersModal