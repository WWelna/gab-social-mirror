import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { injectIntl, defineMessages } from 'react-intl'
import { deleteList } from '../../actions/lists'
import ConfirmationModal from './confirmation_modal'

class ListDeleteModal extends ImmutablePureComponent {

  handleClick = () => {
    this.props.onConfirm(this.props.list.get('id'))
    this.props.history.push('/feeds')
  }

  render() {
    const { list, intl, onClose } = this.props

    const title = intl.formatMessage(messages.title, {
      list: !!list ? list.get('title') : '',
    })
    const message = intl.formatMessage(messages.listMessage, {
      list: !!list ? list.get('title') : '',
    })

    return (
      <ConfirmationModal
        title={title}
        message={message}
        confirm={intl.formatMessage(messages.delete)}
        onConfirm={this.handleClick}
        onClose={onClose}
      />
    )
  }

}

const messages = defineMessages({
  title: { id: 'list_delete_title', defaultMessage: 'Delete "{list}"' },
  listMessage: { id: 'confirmations.list_delete.message', defaultMessage: 'Are you sure you want to delete "{list}"?' },
  delete: { id: 'delete', defaultMessage: 'Delete' },
})

const mapDispatchToProps = (dispatch) => ({
  onConfirm: (listId) => dispatch(deleteList(listId)),
})

ListDeleteModal.propTypes = {
  list: ImmutablePropTypes.map.isRequired,
  intl: PropTypes.object.isRequired,
  onConfirm: PropTypes.func.isRequired,
}

export default withRouter(injectIntl(connect(null, mapDispatchToProps)(ListDeleteModal)))