import React from 'react'
import PropTypes from 'prop-types'
import ModalLayout from './modal_layout'
import { MarketplaceListingFilterPanel } from '../../features/ui/util/async_components'
import WrappedBundle from '../../features/ui/util/wrapped_bundle'

class MarketplaceListingFilterModal extends React.PureComponent {

  render() {
    const { onClose, isXS } = this.props

    return (
      <ModalLayout
        title={isXS ? '' : 'Search'}
        width={500}
        onClose={onClose}
        noPadding
      >
        <WrappedBundle
          component={MarketplaceListingFilterPanel}
          componentParams={{ isXS, isModal: true }}
        />
      </ModalLayout>
    )
  }

}

MarketplaceListingFilterModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  isXS: PropTypes.bool,
}

export default MarketplaceListingFilterModal