import React from 'react'
import PropTypes from 'prop-types'
import ModalLayout from './modal_layout'
import ListCreate from '../../features/list_create'

class ListCreateModal extends React.PureComponent {

  render() {
    const { onClose } = this.props

    return (
      <ModalLayout
        title='Create feed'
        width={500}
        onClose={onClose}
      >
        <ListCreate isModal />
      </ModalLayout>
    )
  }

}

ListCreateModal.propTypes = {
  onClose: PropTypes.func.isRequired,
}

export default ListCreateModal