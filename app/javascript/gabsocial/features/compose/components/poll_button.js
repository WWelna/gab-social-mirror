import React from 'react'
import PropTypes from 'prop-types'
import { defineMessages, injectIntl } from 'react-intl'
import ComposeExtraButton from './compose_extra_button'

const PollButton = ({ intl, disabled, small, poll, onPollToggle }) => (
  <ComposeExtraButton
    title={intl.formatMessage(
      poll !== null ? messages.remove_poll : messages.add_poll
    )}
    disabled={disabled}
    onClick={onPollToggle}
    icon="poll"
    small={small}
    active={poll !== null}
    iconClassName={_s.cIconComposePoll}
  />
)

const messages = defineMessages({
  add_poll: { id: 'poll_button.add_poll', defaultMessage: 'Add poll' },
  title: { id: 'poll_button.title', defaultMessage: 'Poll' },
  remove_poll: { id: 'poll_button.remove_poll', defaultMessage: 'Remove poll' }
})

PollButton.propTypes = {
  disabled: PropTypes.bool,
  onPollToggle: PropTypes.func,
  intl: PropTypes.object,
  small: PropTypes.bool,
  poll: PropTypes.object
}

export default injectIntl(PollButton)
