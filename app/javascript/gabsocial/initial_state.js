import get from 'lodash/get'

const element = document.getElementById('initial-state')
let initialState = {}

if (element !== null) {
  try {
    initialState = JSON.parse(element.textContent)
  } catch (initialStateParseError) {
    const { message, stack } = initialStateParseError
    console.error('error parsing initial state', message, stack)
  }
}

const getMeta = path => get(initialState, `meta.${path}`)

export const autoPlayGif = get(initialState, 'meta.auto_play_gif', true)
export const displayMedia = getMeta('display_media')
export const expandSpoilers = getMeta('expand_spoilers')
export const unfollowModal = getMeta('unfollow_modal')
export const boostModal = getMeta('boost_modal')
export const showVideos = get(initialState, 'meta.show_videos', true)
export const showSuggestedUsers = getMeta('show_suggested_users')
export const showGroups = getMeta('show_groups')
export const deleteModal = getMeta('delete_modal')
export const me = getMeta('me')
export const meUsername = getMeta('username')
export const version = getMeta('version')
export const isStaff = getMeta('is_staff')
export const unreadCount = getMeta('unread_count')
export const lastReadNotificationId = getMeta('last_read_notification_id')
export const isFirstSession = getMeta('is_first_session')
export const emailConfirmed = getMeta('email_confirmed')
export const meEmail = getMeta('email')
export const reportCategories = getMeta('report_categories')
export const proWantsAds = getMeta('pro_wants_ads')
export const accountId = me
export const loggedIn = typeof me === 'string' && me.length > 0
export const loggedOut = !loggedIn
export const isPro = get(initialState, `accounts.${accountId}.is_pro`)
export const activeReactions = getMeta('active_reactions')
export const allReactions = getMeta('all_reactions')
export const globalStatusContexts = getMeta('global_status_contexts')
export const accept_content_types = get(
  initialState,
  'media_attachments.accept_content_types'
)
export const default_privacy = get(initialState, 'compose.default_privacy')
export const default_sensitive = get(initialState, 'compose.default_sensitive')
export const default_status_expiration = get(
  initialState,
  'compose.default_status_expiration'
)
export const createdAt = loggedIn ? Date.parse(get(initialState, `accounts.${accountId}.created_at`)) : null
export const newUnreadWarningsCount = getMeta('new_unread_warnings_count')
export const blocking = getMeta('blocking')
export const muting = getMeta('muting')
export const blockedBy = getMeta('blocked_by')
export const blockingGroups = getMeta('blocking_groups')
export const filters = getMeta('filters')
export const expenses = getMeta('expenses')

export default initialState
