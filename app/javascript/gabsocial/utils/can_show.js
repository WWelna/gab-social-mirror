import {
  isBlockedById,
  isBlockingId,
  isMutingId,
} from './local_storage_blocks_mutes'
import { me } from '../initial_state'

const BLOCKED_BY = 'blockedby'
const BLOCKING = 'blocking'
const MUTING = 'muting'
const FILTERING = 'filtering'
const SPAMFLAGGED = 'spamflagged'

export const canShowMediaItem = (attachment, account) => {
  if (!attachment) return {}

  const status = attachment.get('status')
  if (status.get('show_anyways')) return {}

  const accountId = account.get('id')
  const spamFlag = account.get('spam_flag')

  let canShow = true
  
  // Always show mine
  if (accountId === me) return { canShow }

  let label = null

  const isBlocking = isBlockingId(accountId)
  const isBlockedBy = isBlockedById(accountId)
  const isMuting = isMutingId(accountId)
  const isFiltered = status.get('filtered')
  const isSpamFlagged = spamFlag === 1

  // If blocked by, dont show media. Otherwise just hide (blur) it and have 
  // label appear in meta attributes.
  if (isBlockedBy) {
    canShow = false
  }
  else if (isMuting) {
    label = getMessage('attachment', 'account that posted it', MUTING)
  }
  else if (isSpamFlagged) {
    label = getMessage('attachment', 'account that posted it', SPAMFLAGGED)
  }
  else if (isBlocking) {
    label = getMessage('attachment', 'account that posted it', BLOCKING)
  }
  else if (isFiltered) {
    label = getMessage('attachment', 'account that posted it', FILTERING)
  }

  // 
  return { canShow, label }
}

export const canShowChatMessage = (chatMessage) => {
  if (!chatMessage) return {}
  if (chatMessage.get('show_anyways')) return {}

  const accountId = chatMessage.getIn(['account', 'id'])
  const spamFlag = chatMessage.getIn(['account', 'spam_flag'])

  // Always show mine
  if (accountId === me) return {}

  let nulled = false // hide completely, no option to view
  let label = null

  const isBlocking = isBlockingId(accountId)
  const isBlockedBy = isBlockedById(accountId) || isContentDisplayingBlockedBy(chatMessage.get('text'))
  const isMuting = isMutingId(accountId)
  const isFiltered = chatMessage.get('filtered')
  const isSpamFlagged = spamFlag === 1

  // If blocked by, then just show a label that its unavailable without option to show
  // in order to preserve history and to keep from entire conversation from disappearing
  // otherwise, display option to "show"
  if (isBlockedBy) {
    nulled = true
    label = getMessage('chat message', 'messenger', BLOCKED_BY)
  } 
  else if (isSpamFlagged) {
    label = getMessage('chat message', 'messenger', SPAMFLAGGED)
  }
  else if (isMuting) {
    label = getMessage('chat message', 'messenger', MUTING)
  }
  else if (isBlocking) {
    label = getMessage('chat message', 'messenger', BLOCKING)
  }
  else if (isFiltered) {
    label = getMessage('chat message', 'messenger', FILTERING)
  }

  return {
    nulled,
    label,
  }
}

export const canShowComment = (comment) => {
  if (!comment) return {}
  if (comment.get('show_anyways')) return {}

  const accountId = comment.getIn(['account', 'id'])
  const spamFlag = comment.getIn(['account', 'spam_flag'])

  // Always show mine
  if (accountId === me) return {}

  let nulled = false // hide completely, no option to view
  let label = null

  const isBlocking = isBlockingId(accountId)
  const isBlockedBy = isBlockedById(accountId) || isContentDisplayingBlockedBy(comment.get('content'))
  const isMuting = isMutingId(accountId)
  const isFiltered = comment.get('filtered')
  const isSpamFlagged = spamFlag === 1

  // 1. If blocked by, then just show a label that its unavailable without option to show
  // in order to preserve subcomments and to keep from entire conversation from disappearing
  // otherwise, display option to "show"
  if (isBlockedBy) {
    nulled = true
    label = getMessage('comment', 'commenter', BLOCKED_BY)
  } 
  else if (isSpamFlagged) {
    label = getMessage('comment', 'commenter', SPAMFLAGGED)
  }
  else if (isMuting) {
    label = getMessage('comment', 'commenter', MUTING)
  }
  else if (isBlocking) {
    label = getMessage('comment', 'commenter', BLOCKING)
  }
  else if (isFiltered) {
    label = getMessage('comment', 'commenter', FILTERING)
  }

  // 
  return { nulled, label }
}

export const canShowStatus = (status, {
  isChild,
  quoteParent,
  scrollKey,
  contextType,
  ancestorStatus,
}) => {

  if (ancestorStatus) status = ancestorStatus

  if (!status) return {}
  if (status.get('show_anyways')) return {}

  let canShow = true
  let nulled = false // hide completely, no option to view
  let label = null

  const accountId = status.getIn(['account', 'id'])

  const isBlocking = isBlockingId(accountId)
  const isBlockedBy = isBlockedById(accountId) ||  isContentDisplayingBlockedBy(status.get('content'))
  const isMuting = isMutingId(accountId)
  const isFiltered = status.get('filtered')
  const isSpamFlagged = status.getIn(['account', 'spam_flag']) === 1

  const reblog = status.get('reblog')
  const reblogIsBlockedBy = !!reblog ? isBlockedById(reblog.getIn(['account', 'id'])) || isContentDisplayingBlockedBy(reblog.get('content')) : false

  // 1.a If I QUOTED this status.
  if (!!quoteParent && quoteParent.getIn(['account', 'id']) === me && isChild) {
    if (isBlockedBy) {
      nulled = true
      label = getMessage('quoted status', 'author', BLOCKED_BY)
    }
    else if (isMuting) {
      label = getMessage('quoted status', 'author', MUTING)
    }
    else if (isBlocking) {
      label = getMessage('quoted status', 'author', BLOCKING)
    }
    else if (isFiltered) {
      label = getMessage('quoted status', 'author', FILTERING)
    }
  }

  // 1.b If someone else QUOTED this status.
  else if (!!quoteParent && quoteParent.getIn(['account', 'id']) !== me && isChild) {
    if (isBlockedBy) {
      nulled = true
      label = getMessage('quoted status', 'author', BLOCKED_BY)
    }
    else if (isMuting) {
      label = getMessage('quoted status', 'author', MUTING)
    }
    else if (isBlocking) {
      label = getMessage('quoted status', 'author', BLOCKING)
    }
    else if (isFiltered) {
      label = getMessage('quoted status', 'author', FILTERING)
    }
  }

  // 2. If I REPOSTED this status.
  else if (accountId === me && !!reblog) {
    // : todo : figure out if we should change home_feed.rb to allow to show mutes
    // and blocks in order for client to find out what to do with them here:
    if (reblogIsBlockedBy) {
      nulled = true
      label = getMessage('repost', 'author', BLOCKED_BY)
    }
    else if (isMutingId(reblog.getIn(['account', 'id']))) {
      label = getMessage('repost', 'author', MUTING)
    }
    else if (isBlockingId(reblog.getIn(['account', 'id']))) {
      label = getMessage('repost', 'author', BLOCKING)
    }
    else if (reblog.get('filtered')) {
      label = getMessage('repost', 'author', FILTERING)
    }
  }

  // 3. If viewing this status within composer. Such as when you make comment or quote post.
  // And that status's author blocks me. We don't do anything here if I am muting or
  // blocking or filtering the content due to the fact that I would have already seen the
  // content in order to perform an action on it. Thus, there is no need to hide is it
  //  _again_ within the composer.
  else if (contextType === 'compose') {
    if (isBlockedBy) {
      nulled = true
      label = getMessage('status', 'author', BLOCKED_BY)
    }
  }

  // 4. If viewing status on a users profile
  else if (scrollKey === 'account_timeline') {
    // 4.1. If status is a repost
    if (!!reblog){
      // If its mine, show it
      if (reblog.getIn(['account', 'id']) === me) {
        // SHOW!
      }
      // Not mine and blocking, muting or blocked by or filtering content
      // then hide with label
      else if (reblogIsBlockedBy) {
        nulled = true
        label = getMessage('repost', 'author', BLOCKED_BY)
      }
      else if (isMutingId(reblog.getIn(['account', 'id']))) {
        label = getMessage('repost', 'author', MUTING)
      }
      else if (isBlockingId(reblog.getIn(['account', 'id']))) {
        label = getMessage('repost', 'author', BLOCKING)
      }
      else if (reblog.get('filtered')) {
        label = getMessage('repost', 'author', FILTERING)
      }
    }
    // 4.2. If status is not a repost
    else {
      if (isBlockedBy) {
        nulled = true
        label = getMessage('status', 'author', BLOCKED_BY)
      }
      else if (isMuting)   label = getMessage('status', 'author', MUTING)
      else if (isBlocking) label = getMessage('status', 'author', BLOCKING)
      else if (isFiltered) label = getMessage('status', 'author', FILTERING)
    }
  }

  // 5. If viewing status on notifications page
  else if (contextType === 'notification') {
    // 5.1. If status is a repost
    if (!!reblog){
      // If its mine, show it
      if (reblog.getIn(['account', 'id']) === me) {
        // SHOW!
      }
      // Not mine and blocked by, show with label, no option to view
      else if (reblogIsBlockedBy) {
        nulled = true
        label = getMessage('status', 'author', BLOCKED_BY)
      }
      // Not mine and I am muting or blocking don't show at all
      else if (isMutingId(reblog.getIn(['account', 'id'])) ||
          isBlockingId(reblog.getIn(['account', 'id']))) {
        canShow = false
      }
      // If just filtered, then allow option to view
      else if (reblog.get('filtered')) {
        label = getMessage('status', 'author', FILTERING)
      }
    }
    // 5.2. If status is not a repost
    else {
      // If I'm blocked and then show with label, no option to view
      if (isBlockedBy) {
        nulled = true
        label = getMessage('status', 'author', BLOCKED_BY)
      }
      // I am muting or blocking don't show at all
      else if (isMuting || isBlocking) {
        canShow = false
      }
      // If just filtered, then allow option to view
      else if (isFiltered) {
        label = getMessage('status', 'author', FILTERING)
      }
    }
  }

  // 6. If on status feature page
  else if (contextType === 'feature') {
    // 6.1 and it is a REPOST
    if (!!reblog) {
      // If its mine, show it
      if (reblog.getIn(['account', 'id']) === me) {
        // SHOW!
      }
      // Not mine and blocking, muting or blocked by or filtering content
      // then hide with label
      else if (reblogIsBlockedBy) {
        nulled = true
        label = getMessage('repost', 'author', BLOCKED_BY)
      }
      else if (isMutingId(reblog.getIn(['account', 'id']))) {
        label = getMessage('repost', 'author', MUTING)
      }
      else if (isBlockingId(reblog.getIn(['account', 'id']))) {
        label = getMessage('repost', 'author', BLOCKING)
      }
      else if (reblog.get('filtered')) {
        label = getMessage('repost', 'author', FILTERING)
      }
    }
    else {
      if (isBlockedBy) {
        nulled = true
        label = getMessage('status', 'author', BLOCKED_BY)
      }
      else if (isMuting)   label = getMessage('status', 'author', MUTING)
      else if (isBlocking) label = getMessage('status', 'author', BLOCKING)
      else if (isFiltered) label = getMessage('status', 'author', FILTERING)
    }
  }

  // 7. Hide status completely if blocked_by or blocking and does not fall into [PRIOR]
  else if (isBlockedBy || isBlocking || isSpamFlagged) {
    canShow = false
  }

  // 8. If muting and is in notifications or home timeline, hide status
  else if (isMuting && (scrollKey === 'home_timeline' || contextType === 'notification')) {
    canShow = false
  }
  // 6. If muting and NOT IN notifications or home timeline, show status
  else if (isMuting) {
    // SHOW!
  }
  // 7. If filtering this status and it does not fall into [PRIOR], hide completely
  else if (isFiltered) {
    canShow = false
  }

  // 
  return { canShow, nulled, label }
}

const getMessage = (content, author, type) => {
  switch (type) {
    case BLOCKED_BY:
      return `This ${content} is unavailable because the ${author} has you blocked.`
    case BLOCKING:
      return `This ${content} is hidden because you are blocking the ${author}.`
    case MUTING:
      return `This ${content} is hidden because you are muting the ${author}.`
    case FILTERING:
      return `This ${content} is hidden because it contains a word or phrase that you have filtered.`
    case SPAMFLAGGED:
      return `This ${content} is hidden because it has been flagged as spam.`
    default:
      return 'This content is unavailable.'
  }
}

// - we need to perform this "test" on each piece of content because...
// - userA loads gab thus fetching all of their CURRENT blocked_by, mutes,
// and blocking. If userA is on gab for 30 minutes, and within that 30 minutes
// userB blocks userA, that block_by value is NOT in the list of
// client-side/local-storage values (only known in backend), thus we need to check
// the content coming from the server by this text.
// - An alternative would be to pass through a socket/stream upon userB block of userA
// and append userB accountId onto the list of blocked_by values for userA
const isContentDisplayingBlockedBy = (text) => {
  return text === '[HIDDEN – USER BLOCKS YOU]'
}
