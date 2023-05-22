import api, { getLinks } from '../api'
import {
  importFetchedStatuses,
  importMediaAttachments,
  importFetchedMarketplaceListings,
} from './importer'
import { List as ImmutableList } from 'immutable'

export const MEDIA_ATTACHMENTS_EXPAND_BY_ACCOUNT_ID_REQUEST = 'MEDIA_ATTACHMENTS_EXPAND_BY_ACCOUNT_ID_REQUEST'
export const MEDIA_ATTACHMENTS_EXPAND_BY_ACCOUNT_ID_SUCCESS = 'MEDIA_ATTACHMENTS_EXPAND_BY_ACCOUNT_ID_SUCCESS'
export const MEDIA_ATTACHMENTS_EXPAND_BY_ACCOUNT_ID_FAIL = 'MEDIA_ATTACHMENTS_EXPAND_BY_ACCOUNT_ID_FAIL'


export const expandMediaAttachmentsByAccountId = (accountId) => (dispatch, getState) => {
  // must have id
  if (!accountId) return

  // get existing user list items state
  const block = getState().getIn(['media_attachments', 'by_account', accountId], null)

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
  const url = next || `/api/v1/accounts/${accountId}/media_attachments`
  
  dispatch(expandMediaAttachmentsByAccountIdRequest(accountId, isLoadingMore))

  api(getState).get(url, params).then((response) => {
    const next = getLinks(response).refs.find(link => link.rel === 'next')
    const marketplaceListings = response.marketplace_listings
    const mediaAttachments = response.media_attachments

    const statuses = response.statuses.map((status) => {
      
    })

    dispatch(importFetchedStatuses(statuses))

    dispatch(importFetchedMarketplaceListings(marketplaceListings))
    dispatch(expandMediaAttachmentsByAccountIdSuccess(accountId, next ? next.uri : null, mediaAttachments, response.code === 206, isLoadingRecent, isLoadingMore))
  }).catch((error) => {
    dispatch(expandMediaAttachmentsByAccountIdFail(error, accountId))
  })
}

const expandMediaAttachmentsByAccountIdRequest = (accountId, isLoadingMore) => ({
  type: MEDIA_ATTACHMENTS_EXPAND_BY_ACCOUNT_ID_REQUEST,
  accountId,
  isLoadingMore,
})

const expandMediaAttachmentsByAccountIdSuccess = (accountId, next, mediaAttachments, partial, isLoadingRecent, isLoadingMore) => ({
  type: MEDIA_ATTACHMENTS_EXPAND_BY_ACCOUNT_ID_SUCCESS,
  next,
  mediaAttachments,
  accountId,
  partial,
  isLoadingRecent,
  isLoadingMore,
})

const expandMediaAttachmentsByAccountIdFail = (error, accountId) => ({
  type: MEDIA_ATTACHMENTS_EXPAND_BY_ACCOUNT_ID_FAIL,
  error,
  accountId,
})
