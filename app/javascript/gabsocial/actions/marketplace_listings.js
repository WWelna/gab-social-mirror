import api, { getLinks } from '../api'
import {
  importFetchedAccounts,
  importFetchedMarketplaceListings,
} from './importer'
import { me } from '../initial_state'
import {
  fromJS,
  Map as ImmutableMap,
  List as ImmutableList,
} from 'immutable'

export const MARKETPLACE_LISTINGS_EXPAND_BY_SELLER_REQUEST = 'MARKETPLACE_LISTINGS_EXPAND_BY_SELLER_REQUEST'
export const MARKETPLACE_LISTINGS_EXPAND_BY_SELLER_SUCCESS = 'MARKETPLACE_LISTINGS_EXPAND_BY_SELLER_SUCCESS'
export const MARKETPLACE_LISTINGS_EXPAND_BY_SELLER_FAIL = 'MARKETPLACE_LISTINGS_EXPAND_BY_SELLER_FAIL'

export const MARKETPLACE_LISTING_FETCH_REQUEST = 'MARKETPLACE_LISTING_FETCH_REQUEST'
export const MARKETPLACE_LISTING_FETCH_SUCCESS = 'MARKETPLACE_LISTING_FETCH_SUCCESS'
export const MARKETPLACE_LISTING_FETCH_FAIL = 'MARKETPLACE_LISTING_FETCH_FAIL'

export const MARKETPLACE_FRONT_PAGE_LISTINGS_EXPAND_REQUEST = 'MARKETPLACE_FRONT_PAGE_LISTINGS_EXPAND_REQUEST'
export const MARKETPLACE_FRONT_PAGE_LISTINGS_EXPAND_SUCCESS = 'MARKETPLACE_FRONT_PAGE_LISTINGS_EXPAND_SUCCESS'
export const MARKETPLACE_FRONT_PAGE_LISTINGS_EXPAND_FAIL = 'MARKETPLACE_FRONT_PAGE_LISTINGS_EXPAND_FAIL'

export const MARKETPLACE_LISTING_STATUS_CHANGES_FETCH_REQUEST = 'MARKETPLACE_LISTING_STATUS_CHANGES_FETCH_REQUEST'
export const MARKETPLACE_LISTING_STATUS_CHANGES_FETCH_SUCCESS = 'MARKETPLACE_LISTING_STATUS_CHANGES_FETCH_SUCCESS'
export const MARKETPLACE_LISTING_STATUS_CHANGES_FETCH_FAIL = 'MARKETPLACE_LISTING_STATUS_CHANGES_FETCH_FAIL'

export const MARKETPLACE_LISTING_STATUS_CHANGES_EXPAND_REQUEST = 'MARKETPLACE_LISTING_STATUS_CHANGES_EXPAND_REQUEST'
export const MARKETPLACE_LISTING_STATUS_CHANGES_EXPAND_SUCCESS = 'MARKETPLACE_LISTING_STATUS_CHANGES_EXPAND_SUCCESS'
export const MARKETPLACE_LISTING_STATUS_CHANGES_EXPAND_FAIL = 'MARKETPLACE_LISTING_STATUS_CHANGES_EXPAND_FAIL'

export const MARKETPLACE_LISTING_BUYER_CONVERSATIONS_FETCH_REQUEST = 'MARKETPLACE_LISTING_BUYER_CONVERSATIONS_FETCH_REQUEST'
export const MARKETPLACE_LISTING_BUYER_CONVERSATIONS_FETCH_SUCCESS = 'MARKETPLACE_LISTING_BUYER_CONVERSATIONS_FETCH_SUCCESS'
export const MARKETPLACE_LISTING_BUYER_CONVERSATIONS_FETCH_FAIL = 'MARKETPLACE_LISTING_BUYER_CONVERSATIONS_FETCH_FAIL'

export const MARKETPLACE_LISTING_BUYER_CONVERSATIONS_EXPAND_REQUEST = 'MARKETPLACE_LISTING_BUYER_CONVERSATIONS_EXPAND_REQUEST'
export const MARKETPLACE_LISTING_BUYER_CONVERSATIONS_EXPAND_SUCCESS = 'MARKETPLACE_LISTING_BUYER_CONVERSATIONS_EXPAND_SUCCESS'
export const MARKETPLACE_LISTING_BUYER_CONVERSATIONS_EXPAND_FAIL = 'MARKETPLACE_LISTING_BUYER_CONVERSATIONS_EXPAND_FAIL'

export const MARKETPLACE_LISTING_SET_STATUS_REQUEST = 'MARKETPLACE_LISTING_SET_STATUS_REQUEST'
export const MARKETPLACE_LISTING_SET_STATUS_SUCCESS = 'MARKETPLACE_LISTING_SET_STATUS_SUCCESS'
export const MARKETPLACE_LISTING_SET_STATUS_FAIL = 'MARKETPLACE_LISTING_SET_STATUS_FAIL'

/**
 * Only get APPROVED items by userId
 */
export const expandMarketplaceListingsBySeller = (userId, params={}) => (dispatch, getState) => {
  // must have id
  if (!userId) return

  // get existing user list items state
  const block = getState().getIn(['marketplace_listings_lists', 'user', userId])

  // check if has block and if it isnt already loading and no error
  if (!!block && (block.get('isLoading') || block.get('isError'))) {
    return
  }

  // check if initial load already occured and if we need to load more
  const isLoadingMore = !!params.maxId

  // if no maxId present, we need to load from the start or "since" 
  if (!params.maxId && !!block && block.get('items', ImmutableList()).size > 0) {
    params.sinceId = params.sinceId || block.getIn(['items', 0])
  }

  const next = !!block ? block.get('next') : null
  const url = next || '/api/v1/marketplace_listing_search'
  const isLoadingRecent = !!params.sinceId
  params = !!next ? {} : {
    params: {
      account_id: userId,
      max_id: params.maxId,
      since_id: params.sinceId,
    },
  }

  dispatch(expandMarketplaceListingsBySellerRequest(userId, isLoadingMore))

  api(getState).get(url, params).then((response) => {
    const next = getLinks(response).refs.find(link => link.rel === 'next')
    dispatch(importFetchedMarketplaceListings(response.data))
    dispatch(expandMarketplaceListingsBySellerSuccess(userId, next ? next.uri : null, response.data, response.code === 206, isLoadingRecent, isLoadingMore))
  }).catch((error) => {
    dispatch(expandMarketplaceListingsBySellerFail(error, userId))
  })
}

const expandMarketplaceListingsBySellerRequest = (userId, isLoadingMore) => ({
  type: MARKETPLACE_LISTINGS_EXPAND_BY_SELLER_REQUEST,
  userId,
  isLoadingMore,
})

const expandMarketplaceListingsBySellerSuccess = (userId, next, data, partial, isLoadingRecent, isLoadingMore) => ({
  type: MARKETPLACE_LISTINGS_EXPAND_BY_SELLER_SUCCESS,
  next,
  data,
  userId,
  partial,
  isLoadingRecent,
  isLoadingMore,
})

const expandMarketplaceListingsBySellerFail = (error, userId) => ({
  type: MARKETPLACE_LISTINGS_EXPAND_BY_SELLER_FAIL,
  error,
  userId,
})

/**
 * 
 * @param {*} listingId 
 * @returns 
 */
export const fetchMarketplaceListingById = (listingId) => (dispatch, getState) => {
  const existing = getState().getIn(['marketplace_listings', `${listingId}`])
  // if already got it, dont refetch
  if (!!existing) return

  dispatch(fetchMarketplaceListingByIdRequest(listingId))

  api(getState).get(`/api/v1/marketplace_listings/${listingId}`)
  .then(({ data }) => {
    dispatch(importFetchedMarketplaceListings([data]))
    dispatch(fetchMarketplaceListingByIdSuccess(data, listingId))
  })
  .catch((err) => {
    dispatch(fetchMarketplaceListingByIdFail(err, listingId))
  })
}

const fetchMarketplaceListingByIdRequest = (listingId) => ({
  type: MARKETPLACE_LISTING_FETCH_REQUEST,
  listingId,
})

const fetchMarketplaceListingByIdSuccess = (data, listingId) => ({
  type: MARKETPLACE_LISTING_FETCH_SUCCESS,
  data,
  listingId,
})

const fetchMarketplaceListingByIdFail = (error, listingId) => ({
  type: MARKETPLACE_LISTING_FETCH_FAIL,
  error,
  listingId,
})

/**
 * 
 * @param {*} marketplaceListingId 
 * @returns 
 */
export const setMarketplaceListingStatus = (marketplaceListingId, newStatus) => (dispatch, getState) => {
  if (!me) return false

  dispatch(setMarketplaceListingStatusRequest(marketplaceListingId))

  api(getState).post(`/api/v1/marketplace_listings/${marketplaceListingId}/set_status`, {
    status: newStatus,
  })
  .then(({data}) => {
    dispatch(setMarketplaceListingStatusSuccess(marketplaceListingId, data))
  })
  .catch((err) => dispatch(setMarketplaceListingStatusFail(marketplaceListingId, err)))
}

const setMarketplaceListingStatusRequest = (marketplaceListingId) => ({
  type: MARKETPLACE_LISTING_SET_STATUS_REQUEST,
  marketplaceListingId,
})

const setMarketplaceListingStatusSuccess = (marketplaceListingId, data) => ({
  type: MARKETPLACE_LISTING_SET_STATUS_SUCCESS,
  marketplaceListingId,
  data,
})

const setMarketplaceListingStatusFail = (marketplaceListingId, error) => ({
  type: MARKETPLACE_LISTING_SET_STATUS_FAIL,
  marketplaceListingId,
  error,
})

/**
 * 
 */
export const fetchMarketplaceListingStatusChanges = (marketplaceListingId) => (dispatch, getState) => {
  if (!me || !marketplaceListingId) return

  if (getState().getIn(['marketplace_listing_status_changes', marketplaceListingId, 'isLoading'])) {
    return
  }

  dispatch(fetchMarketplaceListingStatusChangesRequest(marketplaceListingId))

  api(getState).get(`/api/v1/marketplace_listings/${marketplaceListingId}/status_changes`).then(response => {
    const next = getLinks(response).refs.find(link => link.rel === 'next')
    dispatch(fetchMarketplaceListingStatusChangesSuccess(marketplaceListingId, response.data, next ? next.uri : null))
  }).catch(error => {
    dispatch(fetchMarketplaceListingStatusChangesFail(error, marketplaceListingId))
  })
}

const fetchMarketplaceListingStatusChangesRequest = (marketplaceListingId) => ({
  type: MARKETPLACE_LISTING_STATUS_CHANGES_FETCH_REQUEST,
  marketplaceListingId,
})

const fetchMarketplaceListingStatusChangesSuccess = (marketplaceListingId, statusChanges, next) => ({
  type: MARKETPLACE_LISTING_STATUS_CHANGES_FETCH_SUCCESS,
  marketplaceListingId,
  statusChanges,
  next,
})

const fetchMarketplaceListingStatusChangesFail = (error, marketplaceListingId) => ({
  type: MARKETPLACE_LISTING_STATUS_CHANGES_FETCH_FAIL,
  marketplaceListingId,
  showToast: true,
  error,
})

/**
 * 
 */
export const expandMarketplaceListingStatusChanges = (marketplaceListingId) => (dispatch, getState) => {
  if (!me || !marketplaceListingId) return

  const url = getState().getIn(['marketplace_listing_status_changes', marketplaceListingId, 'next'], null)

  if (url === null || getState().getIn(['marketplace_listing_status_changes', marketplaceListingId, 'isLoading'])) {
    return
  }

  dispatch(expandMarketplaceListingStatusChangesRequest(marketplaceListingId))

  api(getState).get(url).then(response => {
    const next = getLinks(response).refs.find(link => link.rel === 'next')
    dispatch(expandMarketplaceListingStatusChangesSuccess(marketplaceListingId, response.data, next ? next.uri : null))
  }).catch(error => {
    dispatch(expandMarketplaceListingStatusChangesFail(error, marketplaceListingId))
  })
}

const expandMarketplaceListingStatusChangesRequest = (marketplaceListingId) => ({
  type: MARKETPLACE_LISTING_STATUS_CHANGES_EXPAND_REQUEST,
  marketplaceListingId,
})

const expandMarketplaceListingStatusChangesSuccess = (marketplaceListingId, statusChanges, next) => ({
  type: MARKETPLACE_LISTING_STATUS_CHANGES_EXPAND_SUCCESS,
  marketplaceListingId,
  statusChanges,
  next,
})

const expandMarketplaceListingStatusChangesFail = (error, marketplaceListingId) => ({
  type: MARKETPLACE_LISTING_STATUS_CHANGES_EXPAND_FAIL,
  marketplaceListingId,
  showToast: true,
  error,
})

// 

/**
 * 
 */
 export const fetchMarketplaceListingBuyers = (marketplaceListingId) => (dispatch, getState) => {
  if (!me || !marketplaceListingId) return

  const block = getState().getIn(['chat_conversation_lists', marketplaceListingId])
  if (!!block && block.get('isLoading')) {
    return
  }

  dispatch(fetchMarketplaceListingBuyersRequest(marketplaceListingId))

  api(getState).get(`/api/v1/marketplace_listings/${marketplaceListingId}/buyers`).then(response => {
    const next = getLinks(response).refs.find(link => link.rel === 'next')
    const conversationsAccounts = [].concat.apply([], response.data.map((c) => c.other_accounts))
    dispatch(importFetchedAccounts(conversationsAccounts))
    dispatch(fetchMarketplaceListingBuyersSuccess(marketplaceListingId, response.data, next ? next.uri : null))
  }).catch(error => {
    dispatch(fetchMarketplaceListingBuyersFail(error, marketplaceListingId))
  })  
}

const fetchMarketplaceListingBuyersRequest = (marketplaceListingId) => ({
  type: MARKETPLACE_LISTING_BUYER_CONVERSATIONS_FETCH_REQUEST,
  marketplaceListingId,
})

const fetchMarketplaceListingBuyersSuccess = (marketplaceListingId, chatConversations, next) => ({
  type: MARKETPLACE_LISTING_BUYER_CONVERSATIONS_FETCH_SUCCESS,
  marketplaceListingId,
  chatConversations,
  next,
})

const fetchMarketplaceListingBuyersFail = (error, marketplaceListingId) => ({
  type: MARKETPLACE_LISTING_BUYER_CONVERSATIONS_FETCH_FAIL,
  marketplaceListingId,
  showToast: true,
  error,
})

/**
 * 
 */
export const expandMarketplaceListingBuyers = (marketplaceListingId) => (dispatch, getState) => {
  if (!me || !marketplaceListingId) return

  const url = getState().getIn(['marketplace_listing_status_changes', marketplaceListingId, 'next'], null)

  if (url === null || getState().getIn(['marketplace_listing_status_changes', marketplaceListingId, 'isLoading'])) {
    return
  }

  dispatch(expandMarketplaceListingBuyersRequest(marketplaceListingId))

  api(getState).get(url).then(response => {
    const next = getLinks(response).refs.find(link => link.rel === 'next')
    const conversationsAccounts = [].concat.apply([], response.data.map((c) => c.other_accounts))
    dispatch(importFetchedAccounts(conversationsAccounts))
    dispatch(expandMarketplaceListingBuyersSuccess(marketplaceListingId, response.data, next ? next.uri : null))
  }).catch(error => {
    dispatch(expandMarketplaceListingBuyersFail(error, marketplaceListingId))
  })
}

const expandMarketplaceListingBuyersRequest = (marketplaceListingId) => ({
  type: MARKETPLACE_LISTING_BUYER_CONVERSATIONS_EXPAND_REQUEST,
  marketplaceListingId,
})

const expandMarketplaceListingBuyersSuccess = (marketplaceListingId, chatConversations, next) => ({
  type: MARKETPLACE_LISTING_BUYER_CONVERSATIONS_EXPAND_SUCCESS,
  marketplaceListingId,
  chatConversations,
  next,
})

const expandMarketplaceListingBuyersFail = (error, marketplaceListingId) => ({
  type: MARKETPLACE_LISTING_BUYER_CONVERSATIONS_EXPAND_FAIL,
  marketplaceListingId,
  showToast: true,
  error,
})

//


/**
 * 
 */
export const expandMarketplaceListingFrontPage = (params={}) => (dispatch, getState) => {
  // get existing user list items state
  const block = getState().getIn(['marketplace_listings_lists', 'frontpage'])

  // check if has block and if it isnt already loading and no error
  if (!!block && (block.get('isLoading') || block.get('isError'))) {
    return
  }

  // check if initial load already occured and if we need to load more
  const isLoadingMore = !!params.maxId

  // if no maxId present, we need to load from the start or "since" 
  if (!params.maxId && !!block && block.get('items', ImmutableList()).size > 0) {
    params.sinceId = params.sinceId || block.getIn(['items', 0])
  }

  const next = !!block ? block.get('next') : null
  const url = next || '/api/v1/marketplace_listing_search'
  const isLoadingRecent = !!params.sinceId
  params = !!next ? {} : {
    params: {
      sort_by: 'newest',
      max_id: params.maxId,
      since_id: params.sinceId,
    },
  }

  dispatch(expandMarketplaceListingFrontPageRequest(isLoadingMore))

  api(getState).get(url, params).then((response) => {
    const next = getLinks(response).refs.find(link => link.rel === 'next')
    dispatch(importFetchedMarketplaceListings(response.data))
    dispatch(expandMarketplaceListingFrontPageSuccess(next ? next.uri : null, response.data, response.code === 206, isLoadingRecent, isLoadingMore))
  }).catch((error) => {
    dispatch(expandMarketplaceListingFrontPageFail(error))
  })
}

const expandMarketplaceListingFrontPageRequest = (isLoadingMore) => ({
  type: MARKETPLACE_FRONT_PAGE_LISTINGS_EXPAND_REQUEST,
  isLoadingMore,
})

const expandMarketplaceListingFrontPageSuccess = (next, data, partial, isLoadingRecent, isLoadingMore) => ({
  type: MARKETPLACE_FRONT_PAGE_LISTINGS_EXPAND_SUCCESS,
  data,
  next,
  partial,
  isLoadingRecent,
  isLoadingMore,
})

const expandMarketplaceListingFrontPageFail = (error) => ({
  type: MARKETPLACE_FRONT_PAGE_LISTINGS_EXPAND_FAIL,
  error,
})



