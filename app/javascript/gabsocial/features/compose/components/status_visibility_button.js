import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { defineMessages, injectIntl } from 'react-intl'
import { openPopover } from '../../../actions/popover'
import ComposeExtraButton from './compose_extra_button'

const iconMap = {
  unlisted: 'unlock-filled',
  private: 'lock-filled',
  public: 'globe'
}

class StatusVisibilityButton extends React.PureComponent {
  setButton = ref => (this.button = ref)
  handleOnClick = () => this.props.onOpenPopover(this.button)
  render() {
    const { intl, small, privacy } = this.props
    return (
      <ComposeExtraButton
        icon={iconMap[privacy]}
        title={intl.formatMessage(messages.visibility)}
        onClick={this.handleOnClick}
        small={small}
        buttonRef={this.setButton}
        iconClassName={_s.cIconComposeSensitive}
      />
    )
  }
}

const messages = defineMessages({
  visibility: { id: 'privacy.visibility', defaultMessage: 'Visibility' }
})

const mapDispatchToProps = (dispatch, { onVisibility, privacy }) => ({
  onOpenPopover(targetRef) {
    dispatch(
      openPopover('STATUS_VISIBILITY', {
        targetRef,
        onVisibility,
        privacy
      })
    )
  }
})

StatusVisibilityButton.propTypes = {
  intl: PropTypes.object.isRequired,
  small: PropTypes.bool,
  onOpenPopover: PropTypes.func.isRequired,
  privacy: PropTypes.oneOf(['private', 'unlisted', 'public'])
}

export default injectIntl(
  connect(null, mapDispatchToProps)(StatusVisibilityButton)
)
