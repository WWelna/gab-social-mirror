import api, { getLinks } from '../api'
import { importFetchedMarketplaceListings } from './importer'
import { me } from '../initial_state'
import {
  fromJS,
  Map as ImmutableMap,
  List as ImmutableList,
} from 'immutable'

export const MARKETPLACE_LISTINGS_EXPAND_DASHBOARD_REQUEST = 'MARKETPLACE_LISTINGS_EXPAND_DASHBOARD_REQUEST'
export const MARKETPLACE_LISTINGS_EXPAND_DASHBOARD_SUCCESS = 'MARKETPLACE_LISTINGS_EXPAND_DASHBOARD_SUCCESS'
export const MARKETPLACE_LISTINGS_EXPAND_DASHBOARD_FAIL = 'MARKETPLACE_LISTINGS_EXPAND_DASHBOARD_FAIL'

export const MARKETPLACE_LISTINGS_DASHBOARD_CLEAR = 'MARKETPLACE_LISTINGS_DASHBOARD_CLEAR'

export const MARKETPLACE_LISTING_DASHBOARD_CHANGE_QUERY = 'MARKETPLACE_LISTING_DASHBOARD_CHANGE_QUERY'
export const MARKETPLACE_LISTING_DASHBOARD_CHANGE_STATUS = 'MARKETPLACE_LISTING_DASHBOARD_CHANGE_STATUS'

/**
 * Get MY items 
 */
export const expandMarketplaceListingDashboard = (params = {}) => (dispatch, getState) => {
  // must have id
  if (!me) return

  // get existing user list items state
  const block = getState().getIn(['marketplace_listings_lists', 'dashboard'])

  // check if has block and if it isnt already loading and no error
  if (!!block && (block.get('isLoading') || block.get('isError'))) {
    return
  }

  // check if initial load already occured and if we need to load more
  const isLoadingMore = !!params.maxId

  // if no maxId present, we need to load from the start or "since" 
  if (!params.maxId && !!block && block.get('items', ImmutableList()).size > 0) {
    params.sinceId = block.getIn(['items', 0])
  }

  const isLoadingRecent = !!params.sinceId

  dispatch(expandMarketplaceListingDashboardRequest(isLoadingMore))

  let statuses = getState().getIn(['marketplace_listing_dashboard', 'active_search_statuses']).toJS()
  // if (Array.isArray(statuses)) statuses = statuses.join(',')

  api(getState).get(`/api/v1/accounts/${me}/marketplace_listings`, {
    params: {
      status: statuses,
      query: getState().getIn(['marketplace_listing_dashboard', 'search']),
      max_id: params.maxId,
      since_id: params.sinceId,
    }
  }).then((response) => {
    const next = getLinks(response).refs.find(link => link.rel === 'next')
    dispatch(importFetchedMarketplaceListings(response.data))
    dispatch(expandMarketplaceListingDashboardSuccess(next ? next.uri : null, response.data, response.code === 206, isLoadingRecent, isLoadingMore))
  }).catch((error) => {
    dispatch(expandMarketplaceListingDashboardFail(error))
  })
}

const expandMarketplaceListingDashboardRequest = (isLoadingMore) => ({
  type: MARKETPLACE_LISTINGS_EXPAND_DASHBOARD_REQUEST,
  isLoadingMore,
})

const expandMarketplaceListingDashboardSuccess = (next, marketplaceListings, partial, isLoadingRecent, isLoadingMore) => ({
  type: MARKETPLACE_LISTINGS_EXPAND_DASHBOARD_SUCCESS,
  next,
  marketplaceListings,
  partial,
  isLoadingRecent,
  isLoadingMore,
})

const expandMarketplaceListingDashboardFail = (error) => ({
  type: MARKETPLACE_LISTINGS_EXPAND_DASHBOARD_FAIL,
  error,
})

/**
 * 
 */
 export const clearMarketplaceListingDashboard = (value) => ({
  type: MARKETPLACE_LISTINGS_DASHBOARD_CLEAR,
  value,
})

/**
 * 
 */
export const changeMarketplaceListingDashboardQuery = (value) => ({
  type: MARKETPLACE_LISTING_DASHBOARD_CHANGE_QUERY,
  value,
})

export const changeMarketplaceListingDashboardStatus = (status, addOrRemove) => ({
  type: MARKETPLACE_LISTING_DASHBOARD_CHANGE_STATUS,
  status,
  addOrRemove,
})
 