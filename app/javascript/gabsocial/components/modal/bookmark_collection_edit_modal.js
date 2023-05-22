import React from 'react'
import PropTypes from 'prop-types'
import ModalLayout from './modal_layout'
import { BookmarkCollectionEdit } from '../../features/ui/util/async_components'
import WrappedBundle from '../../features/ui/util/wrapped_bundle'

class BookmarkCollectionEditModal extends React.PureComponent {

  render() {
    const { bookmarkCollectionId, onClose } = this.props

    return (
      <ModalLayout
        title='Edit Bookmark Collection'
        width={500}
        onClose={onClose}
      >
        <WrappedBundle
          component={BookmarkCollectionEdit}
          componentParams={{ bookmarkCollectionId, isModal: true }}
        />
      </ModalLayout>
    )
  }

}

BookmarkCollectionEditModal.propTypes = {
  bookmarkCollectionId: PropTypes.string,
  onClose: PropTypes.func.isRequired,
}

export default BookmarkCollectionEditModal