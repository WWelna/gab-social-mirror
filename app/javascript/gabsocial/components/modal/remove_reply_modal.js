import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { makeGetAccount } from '../../selectors'
import { removeReply } from '../../actions/statuses'
import ConfirmationModal from './confirmation_modal'

class RemoveReplyModal extends React.PureComponent {

  handleBlock = () => {
    this.props.onRemoveReply(this.props.statusId, true)
  }

  handleRemove = () => {
    this.props.onRemoveReply(this.props.statusId, false)
  }

  render() {
    const { statusId, accountId, intl, block, onClose } = this.props

    const title = block ? 'Remove Reply & Block' : 'Remove Reply'
    const message = block ? 'Do you want to remove this reply and block the account?' : 'Do you want to remove this reply?'

    return (
      <ConfirmationModal
        title={title}
        message={message}
        confirm={'Confirm'}
        onConfirm={block ? this.handleBlock : this.handleRemove}
        onCancel={onClose}
        onClose={onClose}
      />
    )
  }

}

const mapDispatchToProps = (dispatch) => ({
  onRemoveReply(statusId, block) {
    dispatch(removeReply(statusId, block))
  },
})

RemoveReplyModal.propTypes = {
  accountId: PropTypes.object.isRequired,
  statusId: PropTypes.string.isRequired,
  onRemoveReply: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}

export default connect(null, mapDispatchToProps)(RemoveReplyModal)