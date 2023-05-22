import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { defineMessages, injectIntl } from 'react-intl'
import { openPopover } from '../../../actions/popover'
import ComposeExtraButton from './compose_extra_button'

class EmojiPickerButton extends React.PureComponent {
  handleClick = e => this.props.onClick(this.button)
  setButton = ref => (this.button = ref)
  render() {
    const { active, intl, small } = this.props

    return (
      <ComposeExtraButton
        title={intl.formatMessage(messages.emoji)}
        onClick={this.handleClick}
        icon="happy"
        active={active}
        buttonRef={this.setButton}
        small={small}
        iconClassName={_s.cIconComposeEmoji}
      />
    )
  }
}

const messages = defineMessages({
  emoji: { id: 'emoji_button.label', defaultMessage: 'Insert emoji' }
})

const mapStateToProps = state => ({
  active: state.getIn(['popover', 'popoverType']) === 'EMOJI_PICKER'
})

const mapDispatchToProps = (dispatch, { composerId }) => ({
  onClick(targetRef) {
    dispatch(openPopover('EMOJI_PICKER', { targetRef, composerId }))
  }
})

EmojiPickerButton.propTypes = {
  intl: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  active: PropTypes.bool,
  small: PropTypes.bool,
  composerId: PropTypes.string
}

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(EmojiPickerButton)
)
