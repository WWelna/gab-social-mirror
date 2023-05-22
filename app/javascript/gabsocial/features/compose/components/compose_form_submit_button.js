import React from 'react'
import PropTypes from 'prop-types'
import { defineMessages, injectIntl } from 'react-intl'
import { CX } from '../../../constants'
import Button from '../../../components/button'
import Text from '../../../components/text'

function ComposeFormSubmitButton({
  intl,
  type,
  disabled,
  scheduled_at,
  isEdit,
  onSubmit,
  isUploading,
  uploadProgress,
  media_attachments
}) {
  if (type === 'comment') {
    const commentPublishBtnClasses = CX({
      d: 1,
      jcCenter: 1,
      displayNone: disabled
    })

    return (
      <div className={[_s.d, _s.flexRow, _s.aiStart, _s.mlAuto].join(' ')}>
        <div className={[_s.d, _s.flexRow, _s.mrAuto].join(' ')}>
          <div className={commentPublishBtnClasses}>
            <Button
              isNarrow
              radiusSmall
              onClick={onSubmit}
              isDisabled={disabled}
              className={_s.px15}
            >
              {intl.formatMessage(
                scheduled_at ? messages.schedulePost : messages.post
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  let backgroundColor
  let color
  if (disabled) {
    backgroundColor = 'tertiary'
    color = 'tertiary'
  } else if (type === 'navigation') {
    backgroundColor = 'white'
    color = 'brand'
  } else {
    backgroundColor = 'brand'
    color = 'white'
  }

  let msg

  if (scheduled_at) {
    msg = messages.schedulePost
  } else if (isEdit) {
    msg = messages.postEdit
  } else {
    msg = messages.post
  }

  let progress

  if (isUploading && media_attachments.length > 0 && progress < 100) {
    progress = ` ${Math.floor(uploadProgress)}%`
  }

  return (
    <div className={[_s.d, _s.jcCenter, _s.h40PX].join(' ')}>
      <div className={[_s.d, _s.w100PC].join(' ')}>
        <Button
          isBlock
          radiusSmall
          isDisabled={disabled}
          backgroundColor={backgroundColor}
          color={color}
          className={[_s.fs15PX, _s.px15, _s.flexGrow1, _s.mlAuto].join(' ')}
          onClick={onSubmit}
        >
          <Text color="inherit" size="medium" weight="bold" align="center">
            {intl.formatMessage(msg)}
            {progress}
          </Text>
        </Button>
      </div>
    </div>
  )
}

const messages = defineMessages({
  post: { id: 'compose_form.post', defaultMessage: 'Post' },
  postEdit: { id: 'compose_form.post_edit', defaultMessage: 'Post Edit' },
  schedulePost: {
    id: 'compose_form.schedule_post',
    defaultMessage: 'Schedule Post'
  }
})

ComposeFormSubmitButton.propTypes = {
  type: PropTypes.oneOf(['header', 'navigation', 'block', 'comment']),
  formLocation: PropTypes.string,
  autoJoinGroup: PropTypes.bool,
  isEdit: PropTypes.bool,
  onSubmit: PropTypes.func,
  isUploading: PropTypes.bool,
  uploadProgress: PropTypes.number,
  media_attachments: PropTypes.array
}

export default injectIntl(ComposeFormSubmitButton)
