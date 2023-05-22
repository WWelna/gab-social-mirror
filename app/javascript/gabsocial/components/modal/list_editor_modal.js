import React from 'react'
import PropTypes from 'prop-types'
import ModalLayout from './modal_layout'
import { ListEdit } from '../../features/ui/util/async_components'
import WrappedBundle from '../../features/ui/util/wrapped_bundle'

class ListEditorModal extends React.PureComponent {

  render() {
    const { onClose, id, tab } = this.props

    return (
      <ModalLayout
        title='Edit Feed'
        width={500}
        onClose={onClose}
        noPadding
      >
        <WrappedBundle component={ListEdit} componentParams={{ id, tab }} />
      </ModalLayout>
    )
  }

}

ListEditorModal.propTypes = {
  intl: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  tab: PropTypes.string, 
}

export default ListEditorModal