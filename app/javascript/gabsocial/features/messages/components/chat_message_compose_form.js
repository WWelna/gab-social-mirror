import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Textarea from 'react-textarea-autosize'
import get from 'lodash/get'
import api from '../../../api'
import { openPopover } from '../../../actions/popover'
import { sendChatMessage } from '../../../actions/chat_messages'
import {
  COMPOSE_MAX_MEDIA_ATTACHMENTS_LIMIT,
  CX,
  EXPIRATION_OPTION_NAMES,
  POPOVER_CHAT_CONVERSATION_EXPIRATION_OPTIONS,
} from '../../../constants'
import Button from '../../../components/button'
import Text from '../../../components/text'
import ChatMessageComposeFormMediaUploadButton from './chat_message_compose_form_media_upload_btn'
import uuid from '../../../utils/uuid'
import UploadForm from '../../compose/components/upload_form'

class ChatMessageComposeForm extends React.PureComponent {

  state = {
    focused: !this.props.isXS,
    value: '',
    isUploading: false,
    uploadProgress: 0,
    resetFileKey: uuid(),
    mediaIds: [],
    mediaAttachments: [],
  }

  // paste comes in from draftjs or textarea
  onPaste = (e) => {
    if (e && evt.e > 0) return this.onUpload(e)
    const files = get(evt, 'clipboardData.files')
    if (files && files.length > 0) this.onUpload(files)
  }
  
  // When one or more files are added to the composer.
  onUpload = (files) => { 
    // create a new array or the UI wont update
    const newAttachments = [].concat(this.state.mediaAttachments)
    Array.from(files).forEach(function (file) {
      if (file.size === 0) return

      const found = newAttachments.some((item) =>
        item.name === file.name &&
        item.size === file.size &&
        item.type === file.type
      )

      // console.warn('skipping file we already have', file)
      if (found === false && newAttachments.length < COMPOSE_MAX_MEDIA_ATTACHMENTS_LIMIT) {
        file.description = ''
        newAttachments.push(file)
      }
    })

    this.setState({
      resetFileKey: uuid(),
      mediaAttachments: newAttachments,
    })

    // wait for state updates to finish
    setTimeout(() => this.updateAttachments(), 30)
  }

  updateAttachment = (file, opts) => {
    const newAttachments = [].concat(this.state.mediaAttachments)
    const index = newAttachments.indexOf(file)
    if (index !== -1) {
      newAttachments[index] = Object.assign(newAttachments[index], opts)
    } else {
      console.warn('cannot find attachment by index', file, index)
    }
    this.setState({ mediaAttachments: newAttachments })
  }

  updateMediaIds = () => {
    const mediaIds = [].concat(this.state.mediaAttachments
      .filter((file) => file.id !== undefined)
      .map((file) => file.id)
    )
    this.setState({ mediaIds })
  }


  onFileRemove = (removeIndex) => {
    const newAttachments = [].concat(this.state.mediaAttachments).filter((_, itemIndex) => removeIndex !== itemIndex)
    this.setState({mediaAttachments: newAttachments})
    // wait for state updates to finish
    setTimeout(() => this.updateMediaIds(), 30)
  }

  updateAttachments = () => {
    const vm = this
    const { mediaAttachments } = vm.state

    // size of files not yet uploaded
    const totalBytes = mediaAttachments
      .filter((file) => file.id === undefined && file.uploading !== true)
      .reduce((acm, file) => acm + (file.size || 0), 0)

    const uploadedBytes = []

    function updateProgressBar() {
      const transferred = uploadedBytes.reduce((acm, size = 0) => acm + size, 0)
      const uploadProgress = (transferred / totalBytes) * 100
      vm.setState({ uploadProgress })
    }

    vm.setState({ isUploading: true, uploadProgress: 0 })

    const uploadAttachment = (file, fileIndex) =>
      function uploadAttachmentInner(resolve, reject) {
        if (file.id || file.uploading)  resolve()

        vm.updateAttachment(file, { uploading: true })

        const mediaForm = new FormData()
        mediaForm.append('file', file)
        const axiosOptions = {
          onUploadProgress({ loaded }) {
            uploadedBytes[fileIndex] = loaded
            vm.updateAttachment(file, { bytesUploaded: loaded })
            updateProgressBar()
          },
        }

        api().post('/api/v1/media', mediaForm, axiosOptions).then((res) =>{
          const { id, preview_url, url, blurhash } = res.data
          file.id = id
          vm.updateAttachment(file, {
            uploading: false,
            id,
            preview_url,
            url,
            blurhash,
            error: null
          })
          resolve()
        }).catch((err) => {
          console.error('error uploading file', file, fileIndex, err)
          vm.props.onUploadError(err, file)
          const code =
            err.status ||
            err.statusCode ||
            get(err, 'response.status') ||
            err.code
          let message = `error uploading file '${file.name}'`
          const serverMessage = get(err, 'response.data.error')
          if (typeof serverMessage === 'string') {
            message = `${message}, message: ${serverMessage}`
          }
          if (file.type) {
            message = `${message}, type: ${file.type}`
          }
          if (code !== undefined) {
            message = `${message}, code: ${code}`
          }
          vm.updateAttachment(file, {
            uploading: false,
            error: message
          })
          reject(err)
        })
      }

    Promise.all(mediaAttachments.map((file, fileIndex) => {
      return new Promise(uploadAttachment(file, fileIndex))
    })).then(() => {
      vm.setState({ isUploading: false })
      vm.updateMediaIds()
    }).catch((err) => {
      const { message, stack } = err
      console.error('error uploading files', message, stack)
      vm.setState({ isUploading: false })
      vm.updateMediaIds()
    })
  }

  handleOnSendChatMessage = () => {
    const { chatConversationId } = this.props
    const { value, mediaIds } = this.state
    this.props.onSendChatMessage({
      mediaIds,
      text: value,
    }, chatConversationId)
    // document.querySelector('#gabsocial').focus()
    this.onFocus()
    this.setState({
      value: '',
      isUploading: false,
      uploadProgress: 0,
      resetFileKey: uuid(),
      mediaIds: [],
      mediaAttachments: [],
    })
  }

  handleOnExpire = () => {
    this.props.onShowExpirePopover(this.expiresBtn)
  }

  onChange = (e) => {
    this.setState({ value: e.target.value })
  }

  onBlur = () => {
    this.setState({ focused: false })
  }

  onFocus = () => {
    this.setState({ focused: true })
  }

  onKeyDown = (e) => {
    const { disabled } = this.props

    if (disabled) return e.preventDefault()

    // Ignore key events during text composition
    // e.key may be a name of the physical key even in this case (e.x. Safari / Chrome on Mac)
    if (e.which === 229) return

    switch (e.key) {
    case 'Escape':
      document.querySelector('#gabsocial').focus()
      break
    case 'Enter':
      this.handleOnSendChatMessage()
      return e.preventDefault()
    case 'Tab':
      this.sendBtn.focus()
      return e.preventDefault()
      break
    }

    if (e.defaultPrevented) return
  }

  setTextbox = (c) => {
    this.textbox = c
  }

  setSendBtn = (c) => {
    this.sendBtn = c
  }

  setExpiresBtn = (c) => {
    this.expiresBtn = c
  }

  render () {
    const {
      isXS,
      expiresAtValue,
      chatConversationId,
      chatConversation,
      isRequest,
    } = this.props
    const {
      focused,
      value,
      isUploading,
      uploadProgress,
      resetFileKey,
      mediaIds,
      mediaAttachments,
    } = this.state
    const disabled = false

    const textareaClasses = CX({
      d: 1,
      font: 1,
      wrap: 1,
      resizeNone: 1,
      bgTransparent: 1,
      outlineNone: 1,
      lineHeight125: 1,
      cPrimary: 1,
      px10: 1,
      fs14PX: 1,
      maxH200PX: 1,
      w100PC: 1,
      py10: 1,
    })

    const expireBtnClasses = CX({
      d: 1,
      bgTransparent: 1,
      borderRight1PX: 1,
      borderColorSecondary: 1,
      w40PX: 1,
      h100PC: 1,
      aiCenter: 1,
      jcCenter: 1,
      cursorPointer: 1,
      outlineNone: 1,
      cWhite: !!expiresAtValue,
      fw500: !!expiresAtValue,
      bgBlack: !!expiresAtValue,
    })

    const mobileInnerClasses = CX({
      d: 1,
      w100PC: 1,
      pb5: 1,
      px15: 1,
      aiCenter: 1,
      jcCenter: 1,
      saveAreaInsetPB: !focused,
      saveAreaInsetPL: 1,
      saveAreaInsetPR: 1,
    })

    const textarea = (
      <Textarea
        id='chat-message-compose-input'
        inputRef={this.setTextbox}
        className={textareaClasses}
        disabled={disabled}
        placeholder='Type a new message...'
        autoFocus={!isXS}
        value={value}
        onChange={this.onChange}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        onKeyDown={this.onKeyDown}
        focused={focused.toString()}
        aria-autocomplete='list'
        maxLength={1600}
      />
    )

    const button = (
      <Button
        buttonRef={this.setSendBtn}
        isDisabled={isUploading}
        onClick={this.handleOnSendChatMessage}
      >
        <Text color='inherit' weight='medium' className={isXS ? undefined : _s.px10}>Send</Text>
      </Button>
    )

    const expiresBtnTitle = !!expiresAtValue ? (EXPIRATION_OPTION_NAMES[expiresAtValue] || undefined) : undefined
    const expiresBtn = (
      <Button
        noClasses
        buttonRef={this.setExpiresBtn}
        className={expireBtnClasses}
        onClick={this.handleOnExpire}
        icon={!expiresAtValue ? 'stopwatch' : undefined}
        iconSize='15px'
        iconClassName={_s.cPrimary}
      >
        {expiresBtnTitle}
      </Button>
    )

    const uploadBtn = (
      <div>
        <ChatMessageComposeFormMediaUploadButton
          isDisabled={mediaAttachments.length > 8}
          onUpload={this.onUpload}
          resetFileKey={uuid()}
        />
      </div>
    )

    const uploadBox = (isUploading || mediaAttachments.length > 0) && (
      <div className={[_s.d, _s.mt5, _s.mb5, _s.w100PC, _s.maxH200PX, _s.overflowYScroll].join(' ')}>
        <UploadForm
          media_attachments={mediaAttachments}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          onFileRemove={this.onFileRemove}
        />
      </div>
    )


    if (isXS) {
      return (
        <div className={[_s.d, _s.z4, _s.minH58PX, _s.w100PC, _s.mtAuto, _s.bgPrimary].join(' ')}>
          <div className={[_s.d, _s.minH58PX, _s.bgPrimary, _s.aiCenter, _s.z3, _s.bottom0, _s.right0, _s.left0, _s.posFixed].join(' ')}>
            <div className={mobileInnerClasses}>
              <div className={[_s.d, _s.aiCenter, _s.minH58PX, _s.w100PC, _s.borderTop1PX, _s.borderColorSecondary, _s.px10].join(' ')}>
                {uploadBox}
                <div className={[_s.d, _s.flexRow, _s.aiCenter, _s.minH58PX, _s.w100PC].join(' ')}>
                  <div className={[_s.d, _s.flexRow, _s.flexGrow1, _s.radiusRounded, _s.border1PX, _s.borderColorSecondary, _s.overflowHidden].join(' ')}>
                    <div className={[_s.d, _s.flexRow, _s.borderColorSecondary, _s.borderRight1PX].join(' ')}>
                      {expiresBtn}
                      {uploadBtn}
                    </div>
                    <div className={[_s.d, _s.flexGrow1].join(' ')}>
                      {textarea}
                    </div>
                  </div>
                  <div className={[_s.d, _s.pl10, _s.h100PC, _s.aiCenter, _s.jcCenter].join(' ')}>
                    {button}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className={[_s.d, _s.posAbs, _s.bottom0, _s.left0, _s.right0, _s.minH58PX, _s.bgPrimary, _s.w100PC, _s.borderTop1PX, _s.borderColorSecondary, _s.px15].join(' ')}>
        {uploadBox}
        <div className={[_s.d, _s.flexRow, _s.aiCenter].join(' ')}>
          <div className={[_s.d, _s.pr15, _s.flexGrow1, _s.py10].join(' ')}>
            <div className={[_s.d, _s.flexRow, _s.radiusRounded, _s.border1PX, _s.borderColorSecondary, _s.overflowHidden].join(' ')}>
              <div className={[_s.d, _s.flexRow, _s.borderColorSecondary, _s.borderRight1PX].join(' ')}>
                {expiresBtn}
                {uploadBtn}
              </div>
              <div className={[_s.d, _s.flexGrow1].join(' ')}>
                {textarea}
              </div>
            </div>
          </div>
          <div className={[_s.d, _s.h100PC, _s.mtAuto, _s.mb10, _s.aiCenter, _s.jcCenter].join(' ')}>
            {button}
          </div>
        </div>
      </div>
    )
  }

}

const mapStateToProps = (state, { chatConversationId }) => ({
  expiresAtValue: state.getIn(['chat_conversations', chatConversationId, 'chat_message_expiration_policy']),
  isRequest: state.getIn(['chat_conversations', chatConversationId, 'is_approved']) === false,
  chatConversation: state.getIn(['chat_conversations', chatConversationId]),
})

const mapDispatchToProps = (dispatch, { chatConversationId }) => ({
  onSendChatMessage(options, chatConversationId) {
    dispatch(sendChatMessage(options, chatConversationId))
  },
  onShowExpirePopover(targetRef) {
    dispatch(openPopover(POPOVER_CHAT_CONVERSATION_EXPIRATION_OPTIONS, {
      targetRef,
      chatConversationId,
      position: 'top',
    }))
  }
})

ChatMessageComposeForm.propTypes = {
  chatConversationId: PropTypes.string,
  isXS: PropTypes.bool,
  onSendChatMessage: PropTypes.func.isRequired,
  onShowExpirePopover: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatMessageComposeForm)