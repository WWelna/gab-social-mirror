import escapeTextContentForBrowser from 'escape-html'
import emojify from '../../components/emoji/emoji'
import { unescapeHTML } from '../../utils/html'
import normalizeReactionsCounts from '../../utils/reactions_counts_sort'
import { allReactions, expandSpoilers } from '../../initial_state'

const domParser = new DOMParser()

/**
 * 
 */
const makeEmojiMap = record => record.emojis.reduce((obj, emoji) => {
  obj[`:${emoji.shortcode}:`] = emoji
  return obj
}, {})

/**
 * 
 */
export const normalizeAccount = (account) => {
  account = { ...account }

  const emojiMap = makeEmojiMap(account)
  const displayName = account.display_name.trim().length === 0 ? account.username : account.display_name

  account.display_name_html = emojify(escapeTextContentForBrowser(displayName), emojiMap)
  account.display_name_plain = emojify(escapeTextContentForBrowser(displayName), emojiMap, true)
  account.note_emojified = emojify(account.note, emojiMap)
  account.note_plain = unescapeHTML(account.note)

  if (account.fields) {
    account.fields = account.fields.map(pair => ({
      ...pair,
      name_emojified: emojify(escapeTextContentForBrowser(pair.name)),
      value_emojified: emojify(pair.value, emojiMap),
      value_plain: unescapeHTML(pair.value),
    }))
  }

  if (account.moved) {
    account.moved = account.moved.id
  }

  return account
}

const statusDefaults = { emojis: [], mentions: [] }

// fakePollId is for GroupModerationStatus
let fakePollId = 0

/**
 * 
 */
export const normalizeStatus = (status, normalOldStatus) => {
  const normalStatus   = Object.assign({}, statusDefaults, status)
  normalStatus.account = status.account_id || status.account.id

  if (status.reblog && status.reblog.id) {
    normalStatus.reblog = status.reblog.id
  }

  if (status.quote && status.quote.id) {
    normalStatus.quote = status.quote.id
  }

  if (status.poll) {
    normalStatus.poll = status.poll.id || (fakePollId += 1)
  }

  if (!!status.group || !!status.group_id) {
    normalStatus.group = status.group_id || status.group.id
  }

  if (status.reaction || status.reaction_id) {
    normalStatus.reaction = status.reaction_id || status.reaction.id
  } else {

    if (normalOldStatus && normalOldStatus.get('reaction')) {
      normalStatus.reaction = normalOldStatus.get('reaction')
      normalStatus.favourited = true
    } else if (normalOldStatus && normalOldStatus.get('reaction_id')) {
      normalStatus.reaction = allReactions.find(r => r.id == normalOldStatus.get('reaction_id'))
      normalStatus.favourited = true
    }

  }

  if (normalOldStatus && !normalStatus.favourited && normalOldStatus.get('favourited')) {
    normalStatus.favourited = true
    normalStatus.reaction = 1
  }

  if (normalOldStatus && normalOldStatus.get('reblogged')) {
    normalStatus.reblogged = normalOldStatus.get('reblogged')
  }

  try {
    // sort max-min
    normalStatus.reactions_counts = normalizeReactionsCounts(status.reactions_counts)
  } catch (error) {
    
  }

  // Only calculate these values when status first encountered
  // Otherwise keep the ones already in the reducer
  if (normalOldStatus && normalOldStatus.get('content') === normalStatus.content && normalOldStatus.get('spoiler_text') === normalStatus.spoiler_text) {
    normalStatus.search_index = normalOldStatus.get('search_index')
    normalStatus.contentHtml = normalOldStatus.get('contentHtml')
    normalStatus.spoilerHtml = normalOldStatus.get('spoilerHtml')
    normalStatus.hidden = normalOldStatus.get('hidden')
  } else {
    const spoilerText = normalStatus.spoiler_text || ''
    const searchContent = [spoilerText, status.content].join('\n\n').replace(/<br\s*\/?>/g, '\n').replace(/<\/p><p>/g, '\n\n')
    const emojiMap = makeEmojiMap(normalStatus)
    const theContent = !!normalStatus.rich_content ? normalStatus.rich_content : normalStatus.content

    normalStatus.search_index = domParser.parseFromString(searchContent, 'text/html').documentElement.textContent
    normalStatus.contentHtml = emojify(theContent, emojiMap, false, true)
    normalStatus.spoilerHtml = emojify(escapeTextContentForBrowser(spoilerText), emojiMap)
    normalStatus.hidden = expandSpoilers ? false : spoilerText.length > 0 || normalStatus.sensitive
  }

  return normalStatus
}

const pollDefaults = {
  emojis: [],
  expired: false,
  // expires_at:
  multiple: false,
  voted: true,
  voted_for: null,
  votes_count: 0
}

/**
 * 
 */
export const normalizePoll = (poll) => {
  const normalPoll = Object.assign({}, pollDefaults, poll)

  const emojiMap = makeEmojiMap(normalPoll)

  if (normalPoll.options.every(item => typeof item === 'string')) {
    normalPoll.options = normalPoll.options.map((title, id) => ({ id, title }))
  }

  normalPoll.options = normalPoll.options.map((option) => ({
    ...option,
    title_emojified: emojify(escapeTextContentForBrowser(option.title), emojiMap),
  }))

  return normalPoll
}
