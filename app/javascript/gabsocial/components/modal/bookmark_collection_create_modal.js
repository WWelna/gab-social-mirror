import React from 'react'
import PropTypes from 'prop-types'
import ModalLayout from './modal_layout'
import { BookmarkCollectionCreate } from '../../features/ui/util/async_components'
import WrappedBundle from '../../features/ui/util/wrapped_bundle'

class BookmarkCollectionCreateModal extends React.PureComponent {

  render() {
    const { onClose } = this.props

    return (
      <ModalLayout
        title='Create Bookmark Collection'
        width={500}
        onClose={onClose}
      >
        <WrappedBundle component={BookmarkCollectionCreate} componentParams={{ isModal: true }} />
      </ModalLayout>
    )
  }

}

BookmarkCollectionCreateModal.propTypes = {
  onClose: PropTypes.func.isRequired,
}

export default BookmarkCollectionCreateModal