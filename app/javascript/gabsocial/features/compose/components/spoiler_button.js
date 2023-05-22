import React from 'react'
import PropTypes from 'prop-types'
import { injectIntl, defineMessages } from 'react-intl'
import ComposeExtraButton from './compose_extra_button'

const SpoilerButton = ({ intl, small, spoiler, onSpoiler }) => (
  <ComposeExtraButton
    title={intl.formatMessage(messages.title)}
    icon="warning"
    onClick={onSpoiler}
    small={small}
    active={spoiler}
    iconClassName={_s.cIconComposeSpoiler}
  />
)

const messages = defineMessages({
  marked: {
    id: 'compose_form.spoiler.marked',
    defaultMessage: 'Text is hidden behind warning'
  },
  unmarked: {
    id: 'compose_form.spoiler.unmarked',
    defaultMessage: 'Text is not hidden'
  },
  title: { id: 'compose_form.spoiler.title', defaultMessage: 'Warning' }
})

SpoilerButton.propTypes = {
  intl: PropTypes.object.isRequired,
  small: PropTypes.bool,
  spoiler: PropTypes.bool,
  onSpoiler: PropTypes.func
}

export default injectIntl(SpoilerButton)
