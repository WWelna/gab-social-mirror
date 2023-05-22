import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { Map as ImmutableMap } from 'immutable'
import { connect } from 'react-redux'
import ComposeForm from '../../features/compose/components/compose_form'
import Block from '../block'
import Heading from '../heading'
import Button from '../button'
import {
  leadingAtMention,
  POPOVER_STATUS_MODAL_CONFIRM,
  MODAL_COMPOSE
} from '../../constants'
import { openPopover } from '../../actions/popover'

const createInitialState = () => ({ text: '', markdown: '', media_attachments: [] })

const { isMap } = ImmutableMap

class ComposeModal extends React.Component {
  state = createInitialState()

  onClickClose = evt => {
    const {
      onOpenConfirmPopover,
      modalProps = {},
      replyStatus,
      editStatus
    } = this.props
    const { text, markdown, media_attachments } = this.state
    const isComment =
      this.props.isComment || modalProps.replyStatus || replyStatus
    const isEdit = isMap(editStatus)

    const hasText = typeof text === 'string' && text.trim().length > 0
    const hasMarkdown = typeof markdown === 'string' && markdown.trim().length > 0
    const hasAttachments =
      Array.isArray(media_attachments) && media_attachments.length > 0
    const hasContent = hasText || hasMarkdown || hasAttachments
    const isJustMention = leadingAtMention.test(text) || leadingAtMention.test(markdown)
    const defaultReply = hasContent && isComment && isJustMention
    const defaultEdit = isEdit &&
      editStatus.get('text') === text &&
      editStatus.get('markdown') === markdown
    const onClose = () => {
      this.props.onClose(MODAL_COMPOSE)
      this.setState(createInitialState())
    }
    const onConfirmDiscard = () => onClose()
    const onConfirmKeep = () => {
      /*noop*/
    }

    if (hasContent && !defaultReply && !defaultEdit) {
      const targetRef = evt.target
      return onOpenConfirmPopover({
        onConfirmDiscard,
        onConfirmKeep,
        targetRef,
        isEdit
      })
    }

    onClose()
  }

  // text, media_attachments sent up from ComposeForm
  onContentUpdated = update => {
    this.setState(update)
    if (this.props.onUpdateRootContent) {
      update.closeRef = this.closeRef
      this.props.onUpdateRootContent(update)
    }
  }

  setCloseRef = ref => (this.closeRef = ref)

  render() {
    const {
      isEditing,
      quoteStatus,
      editStatus,
      replyStatus,
      mentionAccount,
      initialText,
      groupId
    } = this.props

    const { in_reply_to_id, quote_of_id } =
      (isMap(editStatus) && editStatus.toJS()) || {}

    const isEdit = isEditing || isMap(editStatus)
    const isComment =
      this.props.isComment || isMap(replyStatus) || in_reply_to_id
    const isQuote = this.props.isQuote || isMap(quoteStatus) || quote_of_id
    let title = 'Compose new gab'

    if (isEdit && isComment) {
      title = 'Edit comment'
    } else if (isEdit && isQuote) {
      title = 'Edit quote'
    } else if (isEdit) {
      title = 'Edit gab'
    } else if (isComment) {
      title = 'Compose reply'
    } else if (isQuote) {
      title = 'Compose quote'
    } else if (mentionAccount && isMap(mentionAccount)) {
      const username = mentionAccount.get('username', '')
      title = `Mention @${username}`
    }

    return (
      <div style={{ width: '640px' }} className={[_s.d, _s.modal].join(' ')}>
        <Block>
          <div
            className={[
              _s.d,
              _s.flexRow,
              _s.aiCenter,
              _s.jcCenter,
              _s.borderBottom1PX,
              _s.borderColorSecondary,
              _s.h53PX,
              _s.pl5,
              _s.pr10
            ].join(' ')}
          >
            <div
              className={[
                _s.d,
                _s.w115PX,
                _s.aiStart,
                _s.jcCenter,
                _s.mrAuto
              ].join(' ')}
            >
              <Button
                buttonRef={this.setCloseRef}
                backgroundColor="none"
                title={'Close'}
                onClick={this.onClickClose}
                color="secondary"
                icon="close"
                iconSize="10px"
              />
            </div>
            <Heading size="h2">{title}</Heading>
            <div
              className={[
                _s.d,
                _s.w115PX,
                _s.aiEnd,
                _s.jcCenter,
                _s.mlAuto
              ].join(' ')}
            >
              {/* used to be submit, now pushes heading to center */}
            </div>
          </div>
          <div className={[_s.d, _s.pt5].join(' ')}>
            <ComposeForm
              composerId="compose-modal"
              isModal
              formLocation="modal"
              quoteStatus={quoteStatus}
              editStatus={editStatus}
              replyStatus={replyStatus}
              mentionAccount={mentionAccount}
              initialText={initialText}
              onContentUpdated={this.onContentUpdated}
              autoFocus
              groupId={groupId}
            />
          </div>
        </Block>
      </div>
    )
  }
}

ComposeModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
  isComment: PropTypes.bool,
  quoteStatus: ImmutablePropTypes.map,
  editStatus: ImmutablePropTypes.map,
  replyStatus: ImmutablePropTypes.map,
  mentionAccount: ImmutablePropTypes.map,
  initialText: PropTypes.string,
  groupId: PropTypes.string,
}

const mapDispatchToProps = dispatch => ({
  onOpenConfirmPopover: opts =>
    dispatch(openPopover(POPOVER_STATUS_MODAL_CONFIRM, opts))
})

export default connect(null, mapDispatchToProps)(ComposeModal)
