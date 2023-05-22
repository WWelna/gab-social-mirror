import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import { withRouter } from 'react-router-dom'
import { me, isStaff, boostModal, deleteModal } from '../../initial_state'
import { makeGetStatus } from '../../selectors'
import {
  repost,
  unrepost,
  pin,
  unpin,
  isPin,
  bookmark,
  unbookmark,
  isBookmark,
  unmention
} from '../../actions/interactions'
import { unmuteAccount } from '../../actions/accounts'
import {
  deleteStatus,
  editStatus,
  muteStatus,
  unmuteStatus,
  fetchConversationOwner,
  removeReply,
} from '../../actions/statuses'
import {
  fetchBookmarkCollections,
  updateBookmarkCollectionStatus
} from '../../actions/bookmarks'
import {
  fetchGroupRelationships,
  createRemovedAccount,
  groupRemoveStatus,
  pinGroupStatus,
  unpinGroupStatus,
  isPinnedGroupStatus
} from '../../actions/groups'
import { initReport } from '../../actions/reports'
import { openModal } from '../../actions/modal'
import { closePopover, openPopover } from '../../actions/popover'
import {
  MODAL_PRO_UPGRADE,
  POPOVER_SHARE,
  MODAL_COMPOSE,
  MODAL_BLOCK_ACCOUNT,
  MODAL_REMOVE_REPLY,
} from '../../constants'
import PopoverLayout from './popover_layout'
import Button from '../button'
import List from '../list'
import Text from '../text'

class StatusOptionsPopover extends ImmutablePureComponent {
  state = {
    showingBookmarkCollections: false
  }

  componentDidMount() {
    const { status, statusId, groupRelationships } = this.props

    if (!!status.get('conversation_id')) {
      if (!status.get('conversation_owner')) {
        this.props.fetchOwner(statusId, status.get('conversation_id'))
      }
    }

    if (status.get('pinnable')) {
      this.props.fetchIsPin(statusId)
    }
    this.props.fetchIsBookmark(statusId)

    if (!!status.get('group')) {
      this.props.fetchIsPinnedGroupStatus(
        status.getIn(['group', 'id'], null),
        statusId
      )
    }

    if (!groupRelationships && this.props.groupId) {
      this.props.onFetchGroupRelationships(this.props.groupId)
    }
  }

  handleGroupRemoveAccount = () => {
    const { status } = this.props
    this.props.onGroupRemoveAccount(
      status.getIn(['group', 'id']),
      status.getIn(['account', 'id'])
    )
  }

  handleGroupRemovePost = () => {
    const { status } = this.props

    this.props.onGroupRemoveStatus(
      status.getIn(['group', 'id']),
      status.get('id')
    )
  }

  handleReport = () => {
    this.props.onReport(this.props.status)
  }

  handleBlockClick = () => {
    this.props.onBlock(this.props.status)
  }

  handleMuteClick = () => {
    this.props.onMute(this.props.status.get('account'))
  }

  handlePinClick = () => {
    this.props.onPin(this.props.status)
  }

  handleGroupPinStatus = () => {
    this.props.onPinGroupStatus(this.props.status)
  }

  handleBookmarkClick = () => {
    this.handleBookmarkChangeClick()
  }

  handleBookmarkChangeClick = () => {
    if (!this.props.bookmarkCollectionsIsFetched)
      this.props.onFetchBookmarkCollections()
    this.setState({ showingBookmarkCollections: true })
  }

  handleBookmarkChangeBackClick = () => {
    this.setState({ showingBookmarkCollections: false })
  }

  handleBookmarkChangeSelectClick = bookmarkCollectionId => {
    if (this.props.status.get('bookmarked')) {
      this.props.onUpdateBookmarkCollectionStatus(
        this.props.status.get('id'),
        bookmarkCollectionId
      )
    } else {
      this.props.onBookmark(this.props.status, bookmarkCollectionId)
    }
  }

  handleBookmarkRemoveClick = () => {
    this.props.onBookmark(this.props.status)
  }

  handleDeleteClick = () => {
    this.props.onDelete(this.props.status)
  }

  handleEditClick = () => {
    this.props.onEdit(this.props.status)
  }

  handleRepostClick = e => {
    this.props.onRepost(this.props.status, e)
  }

  handleOnOpenSharePopover = () => {
    this.props.onOpenSharePopover(this.props.innerRef, this.props.status)
  }

  handleOnUnmention = () => {
    this.props.onUnmention(this.props.status)
  }

  handleOnConversationMuteClick = () => {
    this.props.onMuteConversation(this.props.status)
  }

  handleClosePopover = () => {
    this.props.onClosePopover()
  }

  handleRemoveClick = () => {
    this.props.onRemove(this.props.status.get('id'), this.props.status.get('account'))
  }

  handleRemoveAndBlockClick = () => {
    this.props.onRemoveAndBlock(this.props.status.get('id'), this.props.status.get('account_id'))
  }

  render() {
    const {
      isXS,
      intl,
      status,
      groupRelationships,
      bookmarkCollections,
      isMentioned
    } = this.props
    const { showingBookmarkCollections } = this.state

    if (!status) return <div />

    const publicStatus = ['public', 'unlisted'].includes(
      status.get('visibility')
    )
    const isReply = !!status.get('in_reply_to_id')
    const withGroupAdmin = !!groupRelationships
      ? groupRelationships.get('admin') || groupRelationships.get('moderator')
      : false

    let menu = []

    if (me) {
      if (isReply) {
        menu.push({
          icon: 'pencil',
          hideArrow: true,
          title: intl.formatMessage(messages.repostWithComment),
          onClick: () => this.props.onQuote(status)
        })
      }

      menu.push({
        icon: 'bookmark',
        hideArrow: status.get('bookmarked'),
        title: intl.formatMessage(
          status.get('bookmarked') ? messages.unbookmark : messages.bookmark
        ),
        onClick: status.get('bookmarked')
          ? this.handleBookmarkRemoveClick
          : this.handleBookmarkChangeClick
      })

      if (status.get('bookmarked')) {
        menu.push({
          icon: 'bookmark',
          title: 'Update bookmark collection',
          onClick: this.handleBookmarkChangeClick
        })
      }

      if (isMentioned) {
        menu.push({
          icon: 'subtract',
          hideArrow: true,
          title: 'Untag myself',
          onClick: this.handleOnUnmention
        })
      }

      menu.push({
        icon: 'audio-mute',
        hideArrow: true,
        title: status.get('muted')
          ? 'Unmute conversation'
          : 'Mute Conversation',
        onClick: this.handleOnConversationMuteClick
      })

      if (status.getIn(['account', 'id']) === me) {
        if (publicStatus) {
          menu.push({
            icon: 'pin',
            hideArrow: true,
            title: intl.formatMessage(
              status.get('pinned') ? messages.unpin : messages.pin
            ),
            onClick: this.handlePinClick
          })
        }

        menu.push({
          icon: 'trash',
          hideArrow: true,
          title: intl.formatMessage(messages.delete),
          onClick: this.handleDeleteClick
        })
        menu.push({
          icon: 'pencil',
          hideArrow: true,
          title: intl.formatMessage(messages.edit),
          onClick: this.handleEditClick
        })
      } else {
        menu.push({
          icon: 'audio-mute',
          hideArrow: true,
          title: intl.formatMessage(messages.mute, {
            name: status.getIn(['account', 'username'])
          }),
          onClick: this.handleMuteClick
        })

        menu.push({
          icon: 'block',
          hideArrow: true,
          title: intl.formatMessage(messages.block, {
            name: status.getIn(['account', 'username'])
          }),
          onClick: this.handleBlockClick,
        })

        if (status.get('account').get('id') != me && status.get('conversation_owner') == me && !!status.get('in_reply_to_id')) {
          menu.push({
            icon: 'trash',
            hideArrow: true,
            title: 'Remove Reply',
            onClick: this.handleRemoveClick
          })
          menu.push({
            icon: 'block',
            hideArrow: true,
            title: 'Remove Reply and Block',
            onClick: this.handleRemoveAndBlockClick,
          })
        }

        menu.push({
          icon: 'warning',
          hideArrow: true,
          title: intl.formatMessage(messages.report, {
            name: status.getIn(['account', 'username'])
          }),
          onClick: this.handleReport
        })
      }
    }

    if (withGroupAdmin || (!!groupRelationships && isStaff)) {
      let pinned = status.get('pinned_by_group')
      menu.push(null)
      if (!pinned) {
        if (status.getIn(['account', 'id']) !== me) {
          menu.push({
            icon: 'trash',
            hideArrow: true,
            title: intl.formatMessage(messages.group_remove_account),
            onClick: this.handleGroupRemoveAccount
          })
        }
        menu.push({
          icon: 'trash',
          hideArrow: true,
          title: intl.formatMessage(messages.group_remove_post),
          onClick: this.handleGroupRemovePost
        })
        menu.push(null)
      }
      menu.push({
        icon: 'pin',
        hideArrow: true,
        title: intl.formatMessage(pinned ? messages.groupUnpin : messages.groupPin),
        onClick: this.handleGroupPinStatus
      })
    }

    menu.push(null)
    menu.push({
      icon: 'share',
      hideArrow: true,
      title: intl.formatMessage(messages.share),
      onClick: this.handleOnOpenSharePopover
    })

    if (isStaff) {
      menu.push(null)

      menu.push({
        title: intl.formatMessage(messages.admin_account, {
          name: status.getIn(['account', 'username'])
        }),
        href: `/admin/accounts/${status.getIn(['account', 'id'])}`,
        openInNewTab: true
      })
      menu.push({
        title: intl.formatMessage(messages.admin_status),
        href: `/admin/accounts/${status.getIn([
          'account',
          'id'
        ])}/account_statuses/${status.get('id')}`,
        openInNewTab: true
      })
    }

    const popoverWidth = !isStaff ? 260 : 362

    const bookmarkCollectionsArr = bookmarkCollections.toIndexedSeq().toArray()
    let bookmarkCollectionItems = !!bookmarkCollectionsArr
      ? bookmarkCollectionsArr.map(bookmarkCollection => ({
          hideArrow: true,
          onClick: () =>
            this.handleBookmarkChangeSelectClick(bookmarkCollection.get('id')),
          title: bookmarkCollection.get('title'),
          isActive:
            bookmarkCollection.get('id') ===
            status.get('bookmark_collection_id')
        }))
      : []
    bookmarkCollectionItems.unshift({
      hideArrow: true,
      onClick: () => this.handleBookmarkChangeSelectClick('saved'),
      title: 'Saved',
      isActive:
        !status.get('bookmark_collection_id') && status.get('bookmarked')
    })

    return (
      <PopoverLayout
        isXS={isXS}
        onClose={this.handleClosePopover}
        width={popoverWidth}
      >
        {!showingBookmarkCollections && (
          <List
            scrollKey="profile_options"
            items={menu}
            size={isXS ? 'large' : 'small'}
          />
        )}
        {showingBookmarkCollections && (
          <div className={[_s.d, _s.w100PC].join(' ')}>
            <div className={[_s.d, _s.flexRow, _s.bgSecondary].join(' ')}>
              <Button
                isText
                icon="back"
                color="primary"
                backgroundColor="none"
                className={[_s.aiCenter, _s.jcCenter, _s.pl15, _s.pr5].join(
                  ' '
                )}
                onClick={this.handleBookmarkChangeBackClick}
              />
              <Text className={[_s.d, _s.pl5, _s.py10].join(' ')}>
                Select bookmark collection:
              </Text>
            </div>
            <div
              className={[
                _s.d,
                _s.w100PC,
                _s.overflowYScroll,
                _s.maxH340PX
              ].join(' ')}
            >
              <List
                scrollKey="status_options_bookmark_collections"
                showLoading={bookmarkCollectionItems.length === 0}
                emptyMessage="You have no bookmark collections yet."
                items={bookmarkCollectionItems}
                size={isXS ? 'large' : 'small'}
              />
            </div>
          </div>
        )}
      </PopoverLayout>
    )
  }
}

const messages = defineMessages({
  delete: { id: 'status.delete', defaultMessage: 'Delete' },
  edit: { id: 'status.edit', defaultMessage: 'Edit' },
  mute: { id: 'account.mute', defaultMessage: 'Mute @{name}' },
  block: { id: 'account.block', defaultMessage: 'Remove Reply & Block @{name}' },
  reply: { id: 'status.reply', defaultMessage: 'Reply' },
  more: { id: 'status.more', defaultMessage: 'More' },
  share: { id: 'status.share', defaultMessage: 'Share' },
  replyAll: { id: 'status.replyAll', defaultMessage: 'Reply to thread' },
  repost: { id: 'repost', defaultMessage: 'Repost' },
  quote: { id: 'status.quote', defaultMessage: 'Quote' },
  repost_private: { id: 'status.repost', defaultMessage: 'Repost' },
  cancel_repost_private: {
    id: 'status.cancel_repost_private',
    defaultMessage: 'Remove Repost'
  },
  cannot_repost: {
    id: 'status.cannot_repost',
    defaultMessage: 'This post cannot be reposted'
  },
  cannot_quote: {
    id: 'status.cannot_quote',
    defaultMessage: 'This post cannot be quoted'
  },
  like: { id: 'status.like', defaultMessage: 'Like' },
  report: { id: 'status.report', defaultMessage: 'Report @{name}' },
  pin: { id: 'status.pin', defaultMessage: 'Pin on profile' },
  unpin: { id: 'status.unpin', defaultMessage: 'Unpin from profile' },
  groupPin: { id: 'status.group_pin', defaultMessage: 'Pin in group' },
  groupUnpin: { id: 'status.group_unpin', defaultMessage: 'Unpin from group' },
  bookmark: { id: 'status.bookmark', defaultMessage: 'Bookmark status' },
  unbookmark: { id: 'status.unbookmark', defaultMessage: 'Remove bookmark' },
  admin_account: {
    id: 'status.admin_account',
    defaultMessage: 'Open moderation interface for @{name}'
  },
  admin_status: {
    id: 'status.admin_status',
    defaultMessage: 'Open this status in the moderation interface'
  },
  group_remove_account: {
    id: 'status.remove_account_from_group',
    defaultMessage: 'Remove account from group'
  },
  group_remove_post: {
    id: 'status.remove_post_from_group',
    defaultMessage: 'Remove status from group'
  },
  repostWithComment: {
    id: 'quote_repost_comment',
    defaultMessage: 'Quote repost'
  },
  share: { id: 'status.share_gab', defaultMessage: 'Share gab' }
})

const mapStateToProps = (state, { statusId }) => {
  if (!me) return null

  const status = statusId ? makeGetStatus()(state, { id: statusId }) : undefined
  const groupId = status ? status.getIn(['group', 'id']) : undefined
  const groupRelationships = state.getIn(['group_relationships', groupId])
  const isMentioned =
    status && me
      ? !!status.get('mentions').find(item => `${item.get('id')}` === `${me}`)
      : false

  return {
    status,
    groupId,
    groupRelationships,
    isMentioned,
    bookmarkCollectionsIsFetched: state.getIn([
      'bookmark_collections',
      'isFetched'
    ]),
    bookmarkCollections: state.getIn(['bookmark_collections', 'items'])
  }
}

const mapDispatchToProps = dispatch => ({
  fetchOwner(statusId, conversationId) {
    dispatch(fetchConversationOwner(statusId, conversationId))
  },

  fetchIsPin(statusId) {
    dispatch(isPin(statusId))
  },

  fetchIsBookmark(statusId) {
    dispatch(isBookmark(statusId))
  },

  fetchIsPinnedGroupStatus(groupId, statusId) {
    dispatch(isPinnedGroupStatus(groupId, statusId))
  },

  onPin(status) {
    dispatch(closePopover())

    if (status.get('pinned')) {
      dispatch(unpin(status))
    } else {
      dispatch(pin(status))
    }
  },

  onBookmark(status, bookmarkCollectionId) {
    dispatch(closePopover())

    if (status.get('bookmarked')) {
      dispatch(unbookmark(status))
    } else {
      dispatch(bookmark(status, bookmarkCollectionId))
    }
  },

  onQuote(quoteStatus) {
    dispatch(closePopover())

    // the status goes into modalProps then ComposeModal
    dispatch(openModal(MODAL_COMPOSE, { quoteStatus }))
  },

  onRepost(status) {
    dispatch(closePopover())
    const alreadyReposted = status.get('reblogged')

    if (boostModal && !alreadyReposted) {
      dispatch(
        openModal(MODAL_BOOST, {
          status,
          onRepost: () => dispatch(repost(status))
        })
      )
    } else {
      if (alreadyReposted) {
        dispatch(unrepost(status))
      } else {
        dispatch(repost(status))
      }
    }
  },

  onDelete(status, history) {
    dispatch(closePopover())

    if (!deleteModal) {
      dispatch(deleteStatus(status.get('id'), history))
    } else {
      dispatch(
        openModal('CONFIRM', {
          message: (
            <FormattedMessage
              id="confirmations.delete.message"
              defaultMessage="Are you sure you want to delete this status?"
            />
          ),
          confirm: (
            <FormattedMessage
              id="confirmations.delete.confirm"
              defaultMessage="Delete"
            />
          ),
          onConfirm: () => dispatch(deleteStatus(status.get('id'), history))
        })
      )
    }
  },

  onEdit(status) {
    dispatch(closePopover())
    dispatch(editStatus(status))
  },

  onBlock(status) {
    dispatch(closePopover())
    const account = status.get('account')
    dispatch(
      openModal(MODAL_BLOCK_ACCOUNT, {
        accountId: account.get('id'),
        block: true,
      })
    )
  },
  onMute(account) {
    dispatch(closePopover())
    if (account.getIn(['relationship', 'muting'])) {
      dispatch(unmuteAccount(account.get('id')))
    } else {
      dispatch(
        openModal('MUTE', {
          accountId: account.get('id')
        })
      )
    }
  },
  onUnmention(status) {
    dispatch(closePopover())
    dispatch(unmention(status))
  },
  onReport(status) {
    dispatch(closePopover())
    dispatch(initReport(status.get('account'), status))
  },

  onGroupRemoveAccount(groupId, accountId) {
    dispatch(closePopover())
    dispatch(createRemovedAccount(groupId, accountId))
  },

  onGroupRemoveStatus(groupId, statusId) {
    dispatch(closePopover())
    dispatch(groupRemoveStatus(groupId, statusId))
  },

  onFetchGroupRelationships(groupId) {
    dispatch(fetchGroupRelationships([groupId]))
  },

  onOpenSharePopover(targetRef, status) {
    dispatch(closePopover())
    dispatch(
      openPopover(POPOVER_SHARE, {
        targetRef,
        status,
        position: 'top'
      })
    )
  },

  onMuteConversation(status) {
    if (status.get('muted')) {
      dispatch(unmuteStatus(status.get('id')))
    } else {
      dispatch(muteStatus(status.get('id')))
    }
  },

  onOpenProUpgradeModal() {
    dispatch(closePopover())
    dispatch(openModal(MODAL_PRO_UPGRADE))
  },
  onPinGroupStatus(status) {
    dispatch(closePopover())

    if (status.get('pinned_by_group')) {
      dispatch(
        unpinGroupStatus(status.getIn(['group', 'id']), status.get('id'))
      )
    } else {
      dispatch(pinGroupStatus(status.getIn(['group', 'id']), status.get('id')))
    }
  },
  onFetchBookmarkCollections() {
    dispatch(fetchBookmarkCollections())
  },
  onUpdateBookmarkCollectionStatus(statusId, bookmarkCollectionId) {
    dispatch(updateBookmarkCollectionStatus(statusId, bookmarkCollectionId))
    dispatch(closePopover())
  },
  onClosePopover: () => dispatch(closePopover()),
  onRemoveAndBlock(statusId, accountId) {
    dispatch(closePopover())
    dispatch(
      openModal(MODAL_REMOVE_REPLY, {
        statusId,
        accountId,
        block: true,
      })
    )
  },
  onRemove(statusId, account) {
    dispatch(closePopover())
    if (account.getIn(['relationship', 'blocking'])) {
      dispatch(removeReply(statusId, false))
    } else {
      dispatch(
        openModal(MODAL_REMOVE_REPLY, {
          statusId,
          accountId: account.get('id'),
          block: false,
        })
      )
    }
  },
})

StatusOptionsPopover.propTypes = {
  status: ImmutablePropTypes.map,
  statusId: PropTypes.string.isRequired,
  groupRelationships: ImmutablePropTypes.map,
  groupId: PropTypes.string,
  onQuote: PropTypes.func.isRequired,
  onRepost: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onMute: PropTypes.func.isRequired,
  onBlock: PropTypes.func.isRequired,
  onReport: PropTypes.func.isRequired,
  onPin: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
  onFetchGroupRelationships: PropTypes.func.isRequired,
  onOpenProUpgradeModal: PropTypes.func.isRequired,
  onClosePopover: PropTypes.func.isRequired,
  fetchIsPinnedGroupStatus: PropTypes.func.isRequired,
  fetchIsBookmark: PropTypes.func.isRequired,
  fetchIsPin: PropTypes.func.isRequired,
  fetchOwner: PropTypes.func.isRequired,
  onFetchBookmarkCollections: PropTypes.func.isRequired,
  onUpdateBookmarkCollectionStatus: PropTypes.func.isRequired,
  onUnmention: PropTypes.func.isRequired,
  isXS: PropTypes.bool
}

export default withRouter(
  injectIntl(connect(mapStateToProps, mapDispatchToProps)(StatusOptionsPopover))
)
