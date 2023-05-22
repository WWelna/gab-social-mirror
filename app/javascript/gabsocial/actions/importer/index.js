import isObject from 'lodash/isObject'
import {
  normalizeAccount,
  normalizeStatus,
  normalizePoll,
} from './normalizer'
import { fetchContext } from '../statuses'
import { importGroups } from '../groups'

export const ACCOUNT_IMPORT  = 'ACCOUNT_IMPORT'
export const ACCOUNTS_IMPORT = 'ACCOUNTS_IMPORT'
export const STATUS_IMPORT   = 'STATUS_IMPORT'
export const STATUSES_IMPORT = 'STATUSES_IMPORT'
export const POLLS_IMPORT    = 'POLLS_IMPORT'
export const LISTS_IMPORT    = 'LISTS_IMPORT'
export const CHAT_MESSAGES_IMPORT = 'CHAT_MESSAGES_IMPORT'
export const MARKETPLACE_LISTINGS_IMPORT = 'MARKETPLACE_LISTINGS_IMPORT'
export const REACTIONS_IMPORT = 'REACTIONS_IMPORT'

export const ACCOUNT_FETCH_FAIL_FOR_USERNAME_LOOKUP = 'ACCOUNT_FETCH_FAIL_FOR_USERNAME_LOOKUP'

/**
 * 
 */
const pushUnique = (array, object) => {
  if (array.every(element => element.id !== object.id)) {
    array.push(object);
  }
}

export const importAccount = (account) => ({
  type: ACCOUNT_IMPORT,
  account,
})

export const importAccounts = (accounts) => ({
  type: ACCOUNTS_IMPORT,
  accounts,
})

export const importStatus = (status) => ({
  type: STATUS_IMPORT,
  status,
})

export const importStatuses = (statuses) => ({
  type: STATUSES_IMPORT,
  statuses,
})

export const importPolls = (polls) => ({
  type: POLLS_IMPORT,
  polls,
})

export const importLists = (lists) => ({
  type: LISTS_IMPORT,
  lists,
})

export const importChatMessages = (chatMessages) => ({
  type: CHAT_MESSAGES_IMPORT,
  chatMessages,
})

export const importMarketplaceListings = (marketplaceListings) => ({
  type: MARKETPLACE_LISTINGS_IMPORT,
  marketplaceListings,
})

export const importReactions = (reactions, customEmojis) => ({
  type: REACTIONS_IMPORT,
  reactions,
  customEmojis,
})

export const importFetchedAccount = (account) => {
  return importFetchedAccounts([account]);
}

export const importFetchedAccounts = (accounts) => {
  const normalAccounts = [];

  const processAccount = (account) => {
    pushUnique(normalAccounts, normalizeAccount(account));

    if (account.moved) {
      processAccount(account.moved);
    }
  }

  accounts.forEach(processAccount);

  return importAccounts(normalAccounts);
}

export const importFetchedStatus = (status) => {
  return importFetchedStatuses([status]);
}

// fakePollId is for GroupModerationStatus
let fakePollId = 0

export const importFetchedStatuses = (statuses) => (dispatch, getState) => {
  const accounts = []
  const normalStatuses = []
  const polls = []
  const groups = []
  const reactions = []

  const processStatus = (status) => {
    if (status.reblog && status.reblog.id) {
      processStatus(status.reblog)
    }

    if (status.quote && status.quote.id) {
      processStatus(status.quote)
    }

    pushUnique(normalStatuses, normalizeStatus(status, getState().getIn(['statuses', status.id])))

    if (isObject(status.account)) pushUnique(accounts, status.account)
    if (isObject(status.group)) pushUnique(groups, status.group)
    
    if (status.poll) {
      if (status.poll.id === undefined) {
        fakePollId += 1
        status.poll.id = fakePollId
      }
      pushUnique(polls, normalizePoll(status.poll))
    }

    if (status.reaction && status.reaction.id) {
      pushUnique(reactions, status.reaction)
    }

    if (Array.isArray(status.reactions)) {
      status.reactions.forEach((block) => {
        // no reaction if just normal "like"
        if (block.reaction) pushUnique(reactions, block.reaction)
      })
    }
  }

  statuses.forEach(processStatus)

  dispatch(importPolls(polls))
  dispatch(importFetchedAccounts(accounts))
  dispatch(importStatuses(normalStatuses))
  dispatch(importGroups(groups))
  dispatch(importReactions(reactions, getState().get('custom_emojis')))
}

export const importFetchedPoll = (poll) => (dispatch) => {
  dispatch(importPolls([normalizePoll(poll)]))
}

export const importErrorWhileFetchingAccountByUsername = (username) => ({
  type: ACCOUNT_FETCH_FAIL_FOR_USERNAME_LOOKUP,
  username
})

export const importFetchedChatMessages = (chatMessages) => (dispatch, getState) => {
  dispatch(importChatMessages(chatMessages))
}

export const importFetchedMarketplaceListings = (marketplaceListings) => (dispatch, getState) => {
  if (!Array.isArray(marketplaceListings)) return
  
  // import included accounts alongside
  const accounts = []
  marketplaceListings.forEach((marketplaceListing) => {
    if (isObject(marketplaceListing.account)) pushUnique(accounts, marketplaceListing.account)
  })
  dispatch(importFetchedAccounts(accounts))
  
  // import listings
  dispatch(importMarketplaceListings(marketplaceListings))
}

export const importFetchedLists = (lists) => (dispatch) => {
  if (!Array.isArray(lists)) return

  // import included accounts alongside
  const accounts = []
  lists.forEach((list) => {
    if (isObject(list.account)) pushUnique(accounts, list.account)
  })
  dispatch(importFetchedAccounts(accounts))
  
  dispatch(importLists(lists))
}
