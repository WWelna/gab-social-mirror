import React from 'react'
import PropTypes from 'prop-types'
import { injectIntl, defineMessages } from 'react-intl'
import Switch from '../../../components/switch'

const SensitiveMediaButton = ({ sensitive, onSensitive, intl }) => (
  <div className={[_s.d, _s.aiStart, _s.px5, _s.py10].join(' ')}>
    <Switch
      id="mark-sensitive"
      type="checkbox"
      checked={sensitive}
      onChange={onSensitive}
      label={intl.formatMessage(messages.markAsSensitive)}
    />
  </div>
)

const messages = defineMessages({
  markAsSensitive: {
    id: 'compose_form.sensitive.hide',
    defaultMessage: 'Mark media as sensitive'
  }
})

SensitiveMediaButton.propTypes = {
  sensitive: PropTypes.bool,
  disabled: PropTypes.bool,
  onSensitive: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired
}

export default injectIntl(SensitiveMediaButton)
