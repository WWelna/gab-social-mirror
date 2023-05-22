import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Map as ImmutableMap } from 'immutable'
import { closeModal } from '../../actions/modal'
import Bundle from '../../features/ui/util/bundle'
import ModalBase from './modal_base'
import BundleErrorModal from './bundle_error_modal'
import LoadingModal from './loading_modal'
import { openPopover } from '../../actions/popover'

import {
  MODAL_ALBUM_CREATE,
  MODAL_BLOCK_ACCOUNT,
  MODAL_BOOKMARK_COLLECTION_CREATE,
  MODAL_BOOKMARK_COLLECTION_EDIT,
  MODAL_BOOST,
  MODAL_CHAT_CONVERSATION_CREATE,
  MODAL_CHAT_CONVERSATION_DELETE,
  MODAL_CHAT_CONVERSATION_MEMBERS,
  MODAL_COMPOSE,
  MODAL_CONFIRM,
  MODAL_DECK_COLUMN_ADD,
  MODAL_DECK_COLUMN_ADD_OPTIONS,
  MODAL_DISPLAY_OPTIONS,
  MODAL_EDIT_PROFILE,
  MODAL_EDIT_SHORTCUTS,
  MODAL_EMAIL_CONFIRMATION_REMINDER,
  MODAL_GROUP_CREATE,
  MODAL_GROUP_DELETE,
  MODAL_GROUP_PASSWORD,
  MODAL_HOME_TIMELINE_SETTINGS,
  MODAL_HOTKEYS,
  MODAL_LIST_ADD_USER,
  MODAL_LIST_CREATE,
  MODAL_LIST_DELETE,
  MODAL_LIST_EDITOR,
  MODAL_LIST_MEMBERS,
  MODAL_LIST_SUBSCRIBERS,
  MODAL_LIST_TIMELINE_SETTINGS,
  MODAL_MARKETPLACE_LISTING_FILTER,
  MODAL_MEDIA,
  MODAL_MUTE,
  MODAL_PRO_UPGRADE,
  MODAL_REPORT,
  MODAL_REMOVE_REPLY,
  MODAL_STATUS,
  MODAL_STATUS_LIKES,
  MODAL_STATUS_REPOSTS,
  MODAL_STATUS_QUOTES,
  MODAL_STATUS_REVISIONS,
  MODAL_UNAUTHORIZED,
  MODAL_UNFOLLOW,
  MODAL_VIDEO,
  POPOVER_STATUS_MODAL_CONFIRM,
  leadingAtMention
} from '../../constants'

import {
  AlbumCreateModal,
  BlockAccountModal,
  BookmarkCollectionCreateModal,
  BookmarkCollectionEditModal,
  BoostModal,
  ChatConversationCreateModal,
  ChatConversationDeleteModal,
  ChatConversationMembersModal,
  ComposeModal,
  ConfirmationModal,
  DeckColumnAddModal,
  DeckColumnAddOptionsModal,
  DisplayOptionsModal,
  EditProfileModal,
  EditShortcutsModal,
  EmailConfirmationReminderModal,
  GroupCreateModal,
  GroupDeleteModal,
  GroupPasswordModal,
  HomeTimelineSettingsModal,
  HotkeysModal,
  ListAddUserModal,
  ListCreateModal,
  ListDeleteModal,
  ListEditorModal,
  ListMembersModal,
  ListSubscribersModal,
  ListTimelineSettingsModal,
  MarketplaceListingFilterModal,
  MediaModal,
  MuteModal,
  ProUpgradeModal,
  ReportModal,
  StatusModal,
  StatusLikesModal,
  StatusRepostsModal,
  StatusQuotesModal,
  StatusRevisionsModal,
  UnauthorizedModal,
  UnfollowModal,
  VideoModal,
  RemoveReplyModal
} from '../../features/ui/util/async_components'

const MODAL_COMPONENTS = {
  [MODAL_ALBUM_CREATE]: AlbumCreateModal,
  [MODAL_BLOCK_ACCOUNT]: BlockAccountModal,
  [MODAL_BOOKMARK_COLLECTION_CREATE]: BookmarkCollectionCreateModal,
  [MODAL_BOOKMARK_COLLECTION_EDIT]: BookmarkCollectionEditModal,
  [MODAL_BOOST]: BoostModal,
  [MODAL_CHAT_CONVERSATION_CREATE]: ChatConversationCreateModal,
  [MODAL_CHAT_CONVERSATION_DELETE]: ChatConversationDeleteModal,
  [MODAL_CHAT_CONVERSATION_MEMBERS]: ChatConversationMembersModal,
  [MODAL_COMPOSE]: ComposeModal,
  [MODAL_CONFIRM]: ConfirmationModal,
  [MODAL_DECK_COLUMN_ADD]: DeckColumnAddModal,
  [MODAL_DECK_COLUMN_ADD_OPTIONS]: DeckColumnAddOptionsModal,
  [MODAL_DISPLAY_OPTIONS]: DisplayOptionsModal,
  [MODAL_EDIT_SHORTCUTS]: EditShortcutsModal,
  [MODAL_EDIT_PROFILE]: EditProfileModal,
  [MODAL_EMAIL_CONFIRMATION_REMINDER]: EmailConfirmationReminderModal,
  [MODAL_GROUP_CREATE]: GroupCreateModal,
  [MODAL_GROUP_DELETE]: GroupDeleteModal,
  [MODAL_GROUP_PASSWORD]: GroupPasswordModal,
  [MODAL_HOME_TIMELINE_SETTINGS]: HomeTimelineSettingsModal,
  [MODAL_HOTKEYS]: HotkeysModal,
  [MODAL_LIST_ADD_USER]: ListAddUserModal,
  [MODAL_LIST_CREATE]: ListCreateModal,
  [MODAL_LIST_DELETE]: ListDeleteModal,
  [MODAL_LIST_EDITOR]: ListEditorModal,
  [MODAL_LIST_MEMBERS]: ListMembersModal,
  [MODAL_LIST_SUBSCRIBERS]: ListSubscribersModal,
  [MODAL_LIST_TIMELINE_SETTINGS]: ListTimelineSettingsModal,
  [MODAL_MARKETPLACE_LISTING_FILTER]: MarketplaceListingFilterModal,
  [MODAL_MEDIA]: MediaModal,
  [MODAL_MUTE]: MuteModal,
  [MODAL_PRO_UPGRADE]: ProUpgradeModal,
  [MODAL_REPORT]: ReportModal,
  [MODAL_STATUS]: StatusModal,
  [MODAL_STATUS_LIKES]: StatusLikesModal,
  [MODAL_STATUS_REPOSTS]: StatusRepostsModal,
  [MODAL_STATUS_QUOTES]: StatusQuotesModal,
  [MODAL_STATUS_REVISIONS]: StatusRevisionsModal,
  [MODAL_UNAUTHORIZED]: UnauthorizedModal,
  [MODAL_UNFOLLOW]: UnfollowModal,
  [MODAL_VIDEO]: VideoModal,
  [MODAL_REMOVE_REPLY]: RemoveReplyModal,
}

const CENTERED_XS_MODALS = [
  MODAL_BLOCK_ACCOUNT,
  MODAL_CONFIRM,
  MODAL_GROUP_DELETE,
  MODAL_LIST_DELETE,
  MODAL_MUTE,
  MODAL_UNAUTHORIZED,
  MODAL_UNFOLLOW
]

const createInitialState = () => ({
  text: '',
  markdown: '',
  media_attachments: [],
  closeRef: null
})

const { isMap } = ImmutableMap

class ModalRoot extends React.Component {
  state = createInitialState()

  get visible() {
    const { modalType } = this.props
    return typeof modalType === 'string' && modalType.length > 0
  }

  componentDidUpdate() {
    if (this.visible) {
      document.body.classList.add(_s.overflowYHidden)
    } else {
      document.body.classList.remove(_s.overflowYHidden)
    }
  }

  onClickClose = msg => {
    const onClose = () => {
      this.props.onClose(this.props.modalType)
      this.setState(createInitialState())
    }

    if (this.props.modalType !== MODAL_COMPOSE || msg === MODAL_COMPOSE) {
      return onClose()
    }

    /*
    
    For modal compose ask the user if they want to keep their content.
    
    */
    const { text, markdown, media_attachments, closeRef } = this.state
    const { modalProps = {} } = this.props
    const isComment = isMap(modalProps.replyStatus) || modalProps.isComment
    const isEdit = isMap(modalProps.editStatus)

    const hasText = typeof text === 'string' && text.trim().length > 0
    const hasMarkdown = typeof markdown === 'string' && markdown.trim().length > 0
    const hasAttachments =
      Array.isArray(media_attachments) && media_attachments.length > 0
    const hasContent = hasText || hasMarkdown || hasAttachments
    const isJustMention = leadingAtMention.test(text) || leadingAtMention.test(markdown)
    const defaultReply = hasContent && isComment && isJustMention
    const defaultEdit = isEdit &&
      modalProps.editStatus.get('text') === text &&
      modalProps.editStatus.get('markdown') === markdown
    const onConfirmDiscard = () => onClose()
    const onConfirmKeep = () => {
      /*noop*/
    }

    if (hasContent && !defaultReply && !defaultEdit) {
      const targetRef = closeRef
      const useProximity = false // don't use mouse distance to close
      return this.props.onOpenConfirmPopover({
        onConfirmDiscard,
        onConfirmKeep,
        targetRef,
        useProximity,
        isEdit
      })
    }

    onClose()
  }

  renderLoading = () => <LoadingModal />

  renderError = () => <BundleErrorModal onClose={this.onClickClose} />

  // text, media_attachments sent up from ComposeModal
  onUpdateRootContent = update => this.setState(update)

  render() {
    const { visible } = this
    const { modalType, modalProps } = this.props
    return (
      <ModalBase
        onClose={this.onClickClose}
        isCenteredXS={CENTERED_XS_MODALS.indexOf(modalType) > -1}
        type={modalType}
      >
        {visible && (
          <Bundle
            fetchComponent={MODAL_COMPONENTS[modalType]}
            loading={this.renderLoading}
            error={this.renderError}
            renderDelay={150}
          >
            {Component => (
              <Component
                {...modalProps}
                onClose={this.onClickClose}
                onUpdateRootContent={this.onUpdateRootContent}
              />
            )}
          </Bundle>
        )}
      </ModalBase>
    )
  }
}

const mapStateToProps = state => ({
  modalType: state.getIn(['modal', 'modalType']),
  modalProps: state.getIn(['modal', 'modalProps'], {})
})

const mapDispatchToProps = dispatch => ({
  onClose: () => dispatch(closeModal()),
  onOpenConfirmPopover: opts =>
    dispatch(openPopover(POPOVER_STATUS_MODAL_CONFIRM, opts))
})

ModalRoot.propTypes = {
  modalType: PropTypes.string,
  modalProps: PropTypes.object,
  onClose: PropTypes.func.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalRoot)
