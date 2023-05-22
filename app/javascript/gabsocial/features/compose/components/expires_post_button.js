import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { injectIntl, defineMessages } from 'react-intl'
import { openPopover } from '../../../actions/popover'
import { POPOVER_STATUS_EXPIRATION_OPTIONS } from '../../../constants'
import ComposeExtraButton from './compose_extra_button'

class ExpiresPostButton extends React.PureComponent {
  setButton = ref => (this.button = ref)
  handleToggle = () => this.props.onOpenExpirationPopover(this.button)
  render() {
    const { intl, small, expires_at, composerId, popoverType, popoverProps } =
      this.props
    const popoverOpen =
      popoverType === POPOVER_STATUS_EXPIRATION_OPTIONS &&
      popoverProps &&
      popoverProps.composerId === composerId

    return (
      <ComposeExtraButton
        active={popoverOpen || expires_at !== null}
        buttonRef={this.setButton}
        icon="stopwatch"
        onClick={this.handleToggle}
        small={small}
        title={intl.formatMessage(messages.expires)}
        iconClassName={_s.cIconComposeExpires}
      />
    )
  }
}

const messages = defineMessages({
  expires: { id: 'expiration.title', defaultMessage: 'Status expiration' }
})

const mapStateToProps = state => ({
  popoverType: state.getIn(['popover', 'popoverType']),
  popoverProps: state.getIn(['popover', 'popoverProps'])
})

const mapDispatchToProps = (
  dispatch,
  { onExpires, expires_at, composerId }
) => ({
  onOpenExpirationPopover(targetRef) {
    dispatch(
      openPopover(POPOVER_STATUS_EXPIRATION_OPTIONS, {
        targetRef,
        onExpires,
        expires_at,
        composerId
      })
    )
  }
})

ExpiresPostButton.propTypes = {
  intl: PropTypes.object.isRequired,
  onOpenExpirationPopover: PropTypes.func.isRequired,
  onExpires: PropTypes.func,
  small: PropTypes.bool,
  expires_at: PropTypes.string
}

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(ExpiresPostButton)
)
