import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { defineMessages, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import ComposeExtraButton from './compose_extra_button'
import { accept_content_types, loggedOut } from '../../../initial_state'
import { openModal } from '../../../actions/modal'
import { MODAL_UNAUTHORIZED } from '../../../constants'

class UploadButton extends ImmutablePureComponent {
  setFileInputRef = ref => (this.fileInputRef = ref)
  handleClick = () => {
    if (loggedOut) {
      return this.props.loginSignupPrompt()
    }
    this.fileInputRef.click()
  }
  handleChange = e => {
    if (e.target.files.length > 0) {
      this.props.onUpload(e.target.files)
    }
  }
  render() {
    const { intl, resetFileKey, disabled, small = true } = this.props
    return (
      <ComposeExtraButton
        title={intl.formatMessage(messages.title)}
        disabled={disabled}
        onClick={this.handleClick}
        small={small}
        icon="media"
        iconClassName={_s.cIconComposeMedia}
      >
        <label>
          <span className={_s.displayNone}>
            {intl.formatMessage(messages.upload)}
          </span>
          <input
            key={resetFileKey}
            ref={this.setFileInputRef}
            type="file"
            accept={accept_content_types.join(',')}
            onChange={this.handleChange}
            disabled={disabled}
            className={_s.displayNone}
            multiple
          />
        </label>
      </ComposeExtraButton>
    )
  }
}

const messages = defineMessages({
  upload: {
    id: 'upload_button.label',
    defaultMessage: 'Add media (JPEG, PNG, GIF, WebM, MP4, MOV)'
  },
  title: { id: 'upload_button.title', defaultMessage: 'Photo/Video' }
})

UploadButton.propTypes = {
  intl: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  onUpload: PropTypes.func.isRequired,
  resetFileKey: PropTypes.string,
  small: PropTypes.bool
}

const mapDispatchToProps = dispatch => ({
  loginSignupPrompt: () => dispatch(openModal(MODAL_UNAUTHORIZED))
})

export default connect(null, mapDispatchToProps)(injectIntl(UploadButton))
