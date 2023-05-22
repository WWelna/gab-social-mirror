import React from 'react'
import PropTypes from 'prop-types'
import ModalLayout from './modal_layout'
import ListMembers from '../../features/list_members'

class ListMembersModal extends React.PureComponent {

  render() {
    const { onClose, listId } = this.props

    return (
      <ModalLayout
        title='Feed Members'
        width={500}
        onClose={onClose}
        noPadding
      >
        <ListMembers listId={listId} isModal />
      </ModalLayout>
    )
  }

}

ListMembersModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  listId: PropTypes.string.isRequired,
}

export default ListMembersModal