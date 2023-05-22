import React from 'react'
import PropTypes from 'prop-types'
import { defineMessages, injectIntl } from 'react-intl'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { StatusQuotes } from '../../features/ui/util/async_components'
import WrappedBundle from '../../features/ui/util/wrapped_bundle'
import ModalLayout from './modal_layout'

class StatusQuotesModal extends ImmutablePureComponent {

  render() {
    const {
      intl,
      onClose,
      status,
    } = this.props

    const params = {
      statusId: status.get('id'),
    }

    return (
      <ModalLayout
        title={intl.formatMessage(messages.title)}
        width={620}
        onClose={onClose}
        noPadding
      >
        <WrappedBundle component={StatusQuotes} componentParams={params} />
      </ModalLayout>
    )
  }

}

const messages = defineMessages({
  title: { id: 'quotes', defaultMessage: 'Quotes' },
})

StatusQuotesModal.propTypes = {
  intl: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  status: ImmutablePropTypes.map.isRequired,
}

export default injectIntl(StatusQuotesModal)