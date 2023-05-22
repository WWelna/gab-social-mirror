import React from 'react'
import PropTypes from 'prop-types'
import Button from '../../../components/button'
import { accept_content_types } from '../../../initial_state'

class ChatMessageComposeFormMediaUploadButton extends React.PureComponent {
  setFileInputRef = (ref) => {
    this.fileInputRef = ref
  }

  handleOnClick = () => {
    this.fileInputRef.click()
  }

  handleOnChange = (e) => {
    const { onUpload } = this.props

    if (e.target.files.length > 0 && !!onUpload) {
      onUpload(e.target.files)
    }
  }

  render() {
    const { resetFileKey, isDisabled } = this.props

    return (
      <Button
        noClasses
        title='Photo/Video'
        disabled={isDisabled}
        onClick={this.handleOnClick}
        icon="media"
        iconClassName={_s.cPrimary}
        className={[_s.d, _s.w40PX, _s.h100PC, _s.aiCenter, _s.jcCenter, _s.bgTransparent, _s.outlineNone, _s.cursorPointer].join(' ')}
      >
        <label>
          <span className={_s.displayNone}>
            Add media (JPEG, PNG, GIF, WebM, MP4, MOV)'
          </span>
          <input
            key={resetFileKey}
            ref={this.setFileInputRef}
            type="file"
            accept={accept_content_types.join(',')}
            onChange={this.handleOnChange}
            disabled={isDisabled}
            className={_s.displayNone}
            multiple
          />
        </label>
      </Button>
    )
  }
}

ChatMessageComposeFormMediaUploadButton.propTypes = {
  isDisabled: PropTypes.bool,
  onUpload: PropTypes.func.isRequired,
  resetFileKey: PropTypes.string,
}

export default ChatMessageComposeFormMediaUploadButton
