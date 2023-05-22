import React from 'react'
import PropTypes from 'prop-types'
import ModalLayout from './modal_layout'
import ListSubscribers from '../../features/list_subscribers'

class ListSubscribersModal extends React.PureComponent {

  render() {
    const { onClose, listId } = this.props

    return (
      <ModalLayout
        title='Feed Subscribers'
        width={500}
        onClose={onClose}
        noPadding
      >
        <ListSubscribers listId={listId} isModal />
      </ModalLayout>
    )
  }

}

ListSubscribersModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  listId: PropTypes.string.isRequired,
}

export default ListSubscribersModal