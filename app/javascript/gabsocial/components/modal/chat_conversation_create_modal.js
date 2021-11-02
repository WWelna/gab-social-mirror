import React from 'react'
import PropTypes from 'prop-types'
import ModalLayout from './modal_layout'
import { ChatConversationCreate } from '../../features/ui/util/async_components'
import WrappedBundle from '../../features/ui/util/wrapped_bundle'

class ChatConversationCreateModal extends React.PureComponent {

  render() {
    const { onClose, chatConversationId } = this.props

    return (
      <ModalLayout
        title='New Message'
        width={480}
        onClose={onClose}
        noPadding
      >
        <WrappedBundle
          component={ChatConversationCreate}
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

ChatConversationCreateModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  chatConversationId: PropTypes.string,
}

export default ChatConversationCreateModal