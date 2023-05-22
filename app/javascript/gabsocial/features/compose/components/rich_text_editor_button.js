import React from 'react'
import PropTypes from 'prop-types'
import { injectIntl, defineMessages } from 'react-intl'
import ComposeExtraButton from './compose_extra_button'

const RichTextEditorButton = ({
  intl,
  small,
  rte_controls_visible,
  onRichTextToggle
}) => (
  <ComposeExtraButton
    title={intl.formatMessage(messages.title)}
    icon="rich-text"
    onClick={onRichTextToggle}
    small={small}
    active={rte_controls_visible}
    iconClassName={_s.cIconComposeRichText}
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
  title: { id: 'compose_form.rte.title', defaultMessage: 'Rich Text Editor' }
})

RichTextEditorButton.propTypes = {
  intl: PropTypes.object,
  small: PropTypes.bool,
  onRichTextToggle: PropTypes.func
}

export default injectIntl(RichTextEditorButton)
