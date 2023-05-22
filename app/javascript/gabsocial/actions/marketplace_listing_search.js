import api, { getLinks } from '../api'
import isObject from 'lodash/isObject'
import isNil from 'lodash/isNil'
import { importFetchedMarketplaceListings } from './importer'

export const MARKETPLACE_LISTINGS_FETCH_BY_SEARCH_REQUEST = 'MARKETPLACE_LISTINGS_FETCH_BY_SEARCH_REQUEST'
export const MARKETPLACE_LISTINGS_FETCH_BY_SEARCH_SUCCESS = 'MARKETPLACE_LISTINGS_FETCH_BY_SEARCH_SUCCESS'
export const MARKETPLACE_LISTINGS_FETCH_BY_SEARCH_FAIL = 'MARKETPLACE_LISTINGS_FETCH_BY_SEARCH_FAIL'

export const MARKETPLACE_LISTINGS_EXPAND_BY_SEARCH_REQUEST = 'MARKETPLACE_LISTINGS_EXPAND_BY_SEARCH_REQUEST'
export const MARKETPLACE_LISTINGS_EXPAND_BY_SEARCH_SUCCESS = 'MARKETPLACE_LISTINGS_EXPAND_BY_SEARCH_SUCCESS'
export const MARKETPLACE_LISTINGS_EXPAND_BY_SEARCH_FAIL = 'MARKETPLACE_LISTINGS_EXPAND_BY_SEARCH_FAIL'

export const MARKETPLACE_LISTING_SEARCH_QUERY_CHANGE = 'MARKETPLACE_LISTING_SEARCH_QUERY_CHANGE'
export const MARKETPLACE_LISTING_SEARCH_QUERY_CLEAR = 'MARKETPLACE_LISTING_SEARCH_QUERY_CLEAR'

export const MARKETPLACE_LISTING_SEARCH_TAGS_CHANGE = 'MARKETPLACE_LISTING_SEARCH_TAGS_CHANGE'
export const MARKETPLACE_LISTING_SEARCH_LOCATION_CHANGE = 'MARKETPLACE_LISTING_SEARCH_LOCATION_CHANGE'
export const MARKETPLACE_LISTING_SEARCH_PRICE_MIN_CHANGE = 'MARKETPLACE_LISTING_SEARCH_PRICE_MIN_CHANGE'
export const MARKETPLACE_LISTING_SEARCH_PRICE_MAX_CHANGE = 'MARKETPLACE_LISTING_SEARCH_PRICE_MAX_CHANGE'
export const MARKETPLACE_LISTING_SEARCH_SORT_BY_CHANGE = 'MARKETPLACE_LISTING_SEARCH_SORT_BY_CHANGE'
export const MARKETPLACE_LISTING_SEARCH_CONDITION_CHANGE = 'MARKETPLACE_LISTING_SEARCH_CONDITION_CHANGE'
export const MARKETPLACE_LISTING_SEARCH_SHIPPING_REQUIRED_CHANGE = 'MARKETPLACE_LISTING_SEARCH_SHIPPING_REQUIRED_CHANGE'
export const MARKETPLACE_LISTING_SEARCH_HAS_IMAGES_CHANGE = 'MARKETPLACE_LISTING_SEARCH_HAS_IMAGES_CHANGE'
export const MARKETPLACE_LISTING_SEARCH_CATEGORY_ID_CHANGE = 'MARKETPLACE_LISTING_SEARCH_CATEGORY_ID_CHANGE'

export const MARKETPLACE_LISTING_SEARCH_FILTER_CHANGED = 'MARKETPLACE_LISTING_SEARCH_FILTER_CHANGED'

export const MARKETPLACE_LISTING_SEARCH_SET_PARAMS = 'MARKETPLACE_LISTING_SEARCH_SET_PARAMS'

export const MARKETPLACE_LISTING_SEARCH_RESET = 'MARKETPLACE_LISTING_SEARCH_RESET'

export const MARKETPLACE_LISTING_VIEW_CHANGE = 'MARKETPLACE_LISTING_VIEW_CHANGE'

/**
 * 
 * @returns 
 */
 export const fetchMarketplaceListingsBySearch = () => (dispatch, getState) => {
  // get existing category list items state
  const block = getState().getIn(['marketplace_listing_search'])
  
  // check if has block and if it isnt already loading and no error
  if (!!block && (block.get('isLoading') || block.get('isError'))) {
    return
  }

  const next = block.get('next')
  
  const condition = block.getIn(['filters', 'condition'])
  const shipping = block.getIn(['filters', 'shipping_required'])
  const category = block.getIn(['filters', 'category_id'])
  const hasImages = block.getIn(['filters', 'has_images'])

  dispatch(fetchMarketplaceListingsBySearchRequest())

  api(getState).get(`/api/v1/marketplace_listing_search`, {
    params: {
      query: block.getIn(['filters', 'query']),
      tags: block.getIn(['filters', 'tags']),
      location: block.getIn(['filters', 'location']),
      price_min: block.getIn(['filters', 'price_min']),
      price_max: block.getIn(['filters', 'price_max']),
      sort_by: block.getIn(['filters', 'sort_by']),
      condition: condition === 'All' ? undefined : condition,
      category_id: category === 'All' ? undefined : category,
      shipping_required: shipping === 'All' ? undefined : shipping,
      hasImages: hasImages === 'All' ? undefined : hasImages,
      page: 1
    },
  }).then((response) => {
    const next = getLinks(response).refs.find(link => link.rel === 'next')
    dispatch(importFetchedMarketplaceListings(response.data))
    dispatch(fetchMarketplaceListingsBySearchSuccess(next ? next.uri : null, response.data, response.code === 206))
  }).catch((error) => {
    dispatch(fetchMarketplaceListingsBySearchFail(error))
  })
}

const fetchMarketplaceListingsBySearchRequest = () => ({
  type: MARKETPLACE_LISTINGS_FETCH_BY_SEARCH_REQUEST,
})

const fetchMarketplaceListingsBySearchSuccess = (next, data, partial) => ({
  type: MARKETPLACE_LISTINGS_FETCH_BY_SEARCH_SUCCESS,
  next,
  data,
  partial,
})

const fetchMarketplaceListingsBySearchFail = (error) => ({
  type: MARKETPLACE_LISTINGS_FETCH_BY_SEARCH_FAIL,
  error,
})

/**
 * 
 * @returns 
 */
 export const expandMarketplaceListingsBySearch = () => (dispatch, getState) => {
  // get existing category list items state
  const block = getState().getIn(['marketplace_listing_search'])
  
  // check if has block and if it isnt already loading and no error
  if (!!block && (block.get('isLoading') || block.get('isError') || !block.get('next'))) {
    return
  }

  const next = block.get('next')
  
  dispatch(expandMarketplaceListingsBySearchRequest())

  api(getState).get(next).then((response) => {
    const next = getLinks(response).refs.find(link => link.rel === 'next')
    dispatch(importFetchedMarketplaceListings(response.data))
    dispatch(expandMarketplaceListingsBySearchSuccess(next ? next.uri : null, response.data, response.code === 206))
  }).catch((error) => {
    dispatch(expandMarketplaceListingsBySearchFail(error))
  })
}

const expandMarketplaceListingsBySearchRequest = () => ({
  type: MARKETPLACE_LISTINGS_EXPAND_BY_SEARCH_REQUEST,
})

const expandMarketplaceListingsBySearchSuccess = (next, data, partial) => ({
  type: MARKETPLACE_LISTINGS_EXPAND_BY_SEARCH_SUCCESS,
  next,
  data,
  partial,
})

const expandMarketplaceListingsBySearchFail = (error) => ({
  type: MARKETPLACE_LISTINGS_EXPAND_BY_SEARCH_FAIL,
  error,
})

export const setParamsForMarketplaceListingSearch = (qs) => (dispatch) => {
  if (!isObject(qs)) return

  if (isNil(qs.query)) {
    qs.query = ''
  }

  for (const key in qs) {
    if (Object.hasOwnProperty.call(qs, key)) {
      const value = qs[key]
      
      if (key === 'tags') {
        dispatch(changeMarketplaceListingSearchTags(value))
      } else if (key === 'query') {
        dispatch(changeMarketplaceListingSearchQuery(value))
      } else if (key === 'location') {
        dispatch(changeMarketplaceListingSearchLocation(value))
      } else if (key === 'price_min') {
        dispatch(changeMarketplaceListingSearchPriceMin(value))
      } else if (key === 'price_max') {
        dispatch(changeMarketplaceListingSearchPriceMax(value))
      } else if (key === 'condition') {
        dispatch(changeMarketplaceListingSearchCondition(value))
      } else if (key === 'sort_by') {
        dispatch(changeMarketplaceListingSearchSortBy(value))
      } else if (key === 'category_id') {
        dispatch(changeMarketplaceListingSearchCategoryId(value))
      } else if (key === 'shipping_required') {
        dispatch(changeMarketplaceListingSearchShippingRequired(value))
      }
    }
  }

  // dispatch(changeMarketplaceListingSearchQuery(value))
  // type: MARKETPLACE_LISTING_SEARCH_SET_PARAMS,
}

/**
 * 
 * @param {*} value 
 * @returns 
 */
export const changeMarketplaceListingSearchQuery = (value) => ({
  type: MARKETPLACE_LISTING_SEARCH_QUERY_CHANGE,
  value,
})

export const clearMarketplaceListingSearchQuery = () => ({
  type: MARKETPLACE_LISTING_SEARCH_QUERY_CLEAR,
})

export const changeMarketplaceListingSearchTags = (value) => ({
  type: MARKETPLACE_LISTING_SEARCH_TAGS_CHANGE,
  value,
})

export const changeMarketplaceListingSearchLocation = (value) => ({
  type: MARKETPLACE_LISTING_SEARCH_LOCATION_CHANGE,
  value,
})

export const changeMarketplaceListingSearchPriceMin = (value) => ({
  type: MARKETPLACE_LISTING_SEARCH_PRICE_MIN_CHANGE,
  value,
})

export const changeMarketplaceListingSearchPriceMax = (value) => ({
  type: MARKETPLACE_LISTING_SEARCH_PRICE_MAX_CHANGE,
  value,
})

export const changeMarketplaceListingSearchSortBy = (value) => ({
  type: MARKETPLACE_LISTING_SEARCH_SORT_BY_CHANGE,
  value,
})

export const changeMarketplaceListingSearchCondition = (value) => ({
  type: MARKETPLACE_LISTING_SEARCH_CONDITION_CHANGE,
  value,
})

export const changeMarketplaceListingSearchCategoryId = (value) => ({
  type: MARKETPLACE_LISTING_SEARCH_CATEGORY_ID_CHANGE,
  value,
})

export const changeMarketplaceListingSearchShippingRequired = (value) => ({
  type: MARKETPLACE_LISTING_SEARCH_SHIPPING_REQUIRED_CHANGE,
  value,
})

export const changeMarketplaceListingHasImages = (value) => ({
  type: MARKETPLACE_LISTING_SEARCH_HAS_IMAGES_CHANGE,
  value,
})

/**
 * 
 */
 export const changeMarketplaceListingSearchFilterChanged = () => ({
  type: MARKETPLACE_LISTING_SEARCH_FILTER_CHANGED,
})

/**
 * 
 */
export const changeMarketplaceListingItemView = (tab) => ({
  type: MARKETPLACE_LISTING_VIEW_CHANGE,
  tab,
})

export const marketplaceSearchReset = () =>
  ({ type: MARKETPLACE_LISTING_SEARCH_RESET })
