import api, { getLinks } from '../api'
import { importFetchedMarketplaceListings } from './importer'
import { me  } from '../initial_state'

export const MARKETPLACE_LISTINGS_FETCH_SAVES_REQUEST = 'MARKETPLACE_LISTINGS_FETCH_SAVES_REQUEST'
export const MARKETPLACE_LISTINGS_FETCH_SAVES_SUCCESS = 'MARKETPLACE_LISTINGS_FETCH_SAVES_SUCCESS'
export const MARKETPLACE_LISTINGS_FETCH_SAVES_FAIL = 'MARKETPLACE_LISTINGS_FETCH_SAVES_FAIL'

export const MARKETPLACE_LISTINGS_EXPAND_SAVES_REQUEST = 'MARKETPLACE_LISTINGS_EXPAND_SAVES_REQUEST'
export const MARKETPLACE_LISTINGS_EXPAND_SAVES_SUCCESS = 'MARKETPLACE_LISTINGS_EXPAND_SAVES_SUCCESS'
export const MARKETPLACE_LISTINGS_EXPAND_SAVES_FAIL = 'MARKETPLACE_LISTINGS_EXPAND_SAVES_FAIL'

export const MARKETPLACE_LISTING_SAVE_REQUEST = 'MARKETPLACE_LISTING_SAVE_REQUEST'
export const MARKETPLACE_LISTING_SAVE_SUCCESS = 'MARKETPLACE_LISTING_SAVE_SUCCESS'
export const MARKETPLACE_LISTING_SAVE_FAIL = 'MARKETPLACE_LISTING_SAVE_FAIL'

export const MARKETPLACE_LISTING_UNSAVE_REQUEST = 'MARKETPLACE_LISTING_UNSAVE_REQUEST'
export const MARKETPLACE_LISTING_UNSAVE_SUCCESS = 'MARKETPLACE_LISTING_UNSAVE_SUCCESS'
export const MARKETPLACE_LISTING_UNSAVE_FAIL = 'MARKETPLACE_LISTING_UNSAVE_FAIL'

export const MARKETPLACE_LISTING_CHECK_SAVED_REQUEST = 'MARKETPLACE_LISTING_CHECK_SAVED_REQUEST'
export const MARKETPLACE_LISTING_CHECK_SAVED_SUCCESS = 'MARKETPLACE_LISTING_CHECK_SAVED_SUCCESS'
export const MARKETPLACE_LISTING_CHECK_SAVED_FAIL = 'MARKETPLACE_LISTING_CHECK_SAVED_FAIL'

/**
 * 
 */
 export const fetchMarketplaceListingSaves = () => (dispatch, getState) => {
  if (!me) return

  if (getState().getIn(['marketplace_listings_lists', 'saves', 'isLoading'])) {
    return
  }

  dispatch(fetchMarketplaceListingSavesRequest())

  api(getState).get(`/api/v1/marketplace_listing_saves`).then(response => {
    const next = getLinks(response).refs.find(link => link.rel === 'next')
    dispatch(importFetchedMarketplaceListings(response.data))
    dispatch(fetchMarketplaceListingSavesSuccess(response.data, next ? next.uri : null))
  }).catch((error) => {
    dispatch(fetchMarketplaceListingSavesFail(error))
  })  
}

const fetchMarketplaceListingSavesRequest = () => ({
  type: MARKETPLACE_LISTINGS_FETCH_SAVES_REQUEST,
})

const fetchMarketplaceListingSavesSuccess = (marketplaceListings, next) => ({
  type: MARKETPLACE_LISTINGS_FETCH_SAVES_SUCCESS,
  marketplaceListings,
  next,
})

const fetchMarketplaceListingSavesFail = (error) => ({
  type: MARKETPLACE_LISTINGS_FETCH_SAVES_FAIL,
  showToast: true,
  error,
})

/**
 * 
 */
export const expandMarketplaceListingSaves = () => (dispatch, getState) => {
  if (!me) return

  const url = getState().getIn(['marketplace_listings_lists', 'saves', 'next'], null)

  if (url === null || getState().getIn(['marketplace_listings_lists', 'saves', 'isLoading'])) {
    return
  }

  dispatch(expandMarketplaceListingSavesRequest())

  api(getState).get(url).then(response => {
    const next = getLinks(response).refs.find(link => link.rel === 'next')
    dispatch(importFetchedMarketplaceListings(response.data))
    dispatch(expandMarketplaceListingSavesSuccess(response.data, next ? next.uri : null))
  }).catch(error => {
    dispatch(expandMarketplaceListingSavesFail(error))
  })
}

const expandMarketplaceListingSavesRequest = () => ({
  type: MARKETPLACE_LISTINGS_EXPAND_SAVES_REQUEST,
})

const expandMarketplaceListingSavesSuccess = (marketplaceListings, next) => ({
  type: MARKETPLACE_LISTINGS_EXPAND_SAVES_SUCCESS,
  marketplaceListings,
  next,
})

const expandMarketplaceListingSavesFail = (error) => ({
  type: MARKETPLACE_LISTINGS_EXPAND_SAVES_FAIL,
  showToast: true,
  error,
})

/**
 * @param {String} marketplaceListingId
 */
 export const saveMarketplaceListing = (marketplaceListingId) => (dispatch, getState) => {
  if (!me || !marketplaceListingId) return

  dispatch(saveMarketplaceListingRequest(marketplaceListingId))

  api(getState).post(`/api/v1/marketplace_listings/${marketplaceListingId}/saves`).then((response) => {
    dispatch(saveMarketplaceListingSuccess(marketplaceListingId, response.data.saved))
  }).catch((error) => {
    dispatch(saveMarketplaceListingFail(marketplaceListingId, error))
  })
}

const saveMarketplaceListingRequest = (marketplaceListingId) => ({
  type: MARKETPLACE_LISTING_SAVE_REQUEST,
  marketplaceListingId,
})

const saveMarketplaceListingSuccess = (marketplaceListingId, saved) => ({
  type: MARKETPLACE_LISTING_SAVE_SUCCESS,
  marketplaceListingId,
  saved,
})

const saveMarketplaceListingFail = (marketplaceListingId, error) => ({
  type: MARKETPLACE_LISTING_SAVE_FAIL,
  showToast: true,
  marketplaceListingId,
  error,
})

/**
 * @param {String} marketplaceListingId
 */
export const unsaveMarketplaceListing = (marketplaceListingId) => (dispatch, getState) => {
  if (!me || !marketplaceListingId) return

  dispatch(unsaveMarketplaceListingRequest(marketplaceListingId))

  api(getState).delete(`/api/v1/marketplace_listings/${marketplaceListingId}/saves`).then((response) => {
    dispatch(unsaveMarketplaceListingSuccess(marketplaceListingId, response.data.saved))
  }).catch((error) => {
    dispatch(unsaveMarketplaceListingFail(marketplaceListingId, error))
  })
}

const unsaveMarketplaceListingRequest = (marketplaceListingId) => ({
  type: MARKETPLACE_LISTING_UNSAVE_REQUEST,
  marketplaceListingId,
})

const unsaveMarketplaceListingSuccess = (marketplaceListingId, saved) => ({
  type: MARKETPLACE_LISTING_UNSAVE_SUCCESS,
  marketplaceListingId,
  saved,
})

const unsaveMarketplaceListingFail = (marketplaceListingId, error) => ({
  type: MARKETPLACE_LISTING_UNSAVE_FAIL,
  showToast: true,
  marketplaceListingId,
  error,
})

/**
 * @param {String} marketplaceListingId
 */
 export const isMarketplaceListingSaved = (marketplaceListingId) => (dispatch, getState) => {
  if (!me || !marketplaceListingId) return

  dispatch(isMarketplaceListingSavedRequest(marketplaceListingId))

  api(getState).get(`/api/v1/marketplace_listings/${marketplaceListingId}/saves`).then((response) => {
    dispatch(isMarketplaceListingSavedSuccess(marketplaceListingId, response.data.saved))
  }).catch((error) => {
    dispatch(isMarketplaceListingSavedFail(marketplaceListingId, error))
  })
}

const isMarketplaceListingSavedRequest = (marketplaceListingId) => ({
  type: MARKETPLACE_LISTING_CHECK_SAVED_REQUEST,
  marketplaceListingId,
})

const isMarketplaceListingSavedSuccess = (marketplaceListingId, saved) => ({
  type: MARKETPLACE_LISTING_CHECK_SAVED_SUCCESS,
  marketplaceListingId,
  saved,
})

const isMarketplaceListingSavedFail = (marketplaceListingId, error) => ({
  type: MARKETPLACE_LISTING_CHECK_SAVED_FAIL,
  marketplaceListingId,
  error,
})