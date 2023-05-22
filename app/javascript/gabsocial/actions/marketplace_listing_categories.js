import api from '../api'

export const MARKETPLACE_LISTING_CATEGORIES_FETCH_REQUEST = 'MARKETPLACE_LISTING_CATEGORIES_FETCH_REQUEST'
export const MARKETPLACE_LISTING_CATEGORIES_FETCH_SUCCESS = 'MARKETPLACE_LISTING_CATEGORIES_FETCH_SUCCESS'
export const MARKETPLACE_LISTING_CATEGORIES_FETCH_FAIL = 'MARKETPLACE_LISTING_CATEGORIES_FETCH_FAIL'

export const fetchMarketplaceListingCategories = () => (dispatch, getState) => {
  const isLoading = getState().getIn(['marketplace_listing_categories', 'isLoading'])
  const isFetched = getState().getIn(['marketplace_listing_categories', 'isFetched'])
  if (isLoading || isFetched) return

  dispatch(fetchMarketplaceListingCategoriesRequest())

  api(getState).get('/api/v1/marketplace_listing_categories')
    .then(({ data }) => dispatch(fetchMarketplaceListingCategoriesSuccess(data)))
    .catch((err) => dispatch(fetchMarketplaceListingCategoriesFail(err)))
}

const fetchMarketplaceListingCategoriesRequest = () => ({
  type: MARKETPLACE_LISTING_CATEGORIES_FETCH_REQUEST,
})

const fetchMarketplaceListingCategoriesSuccess = (data) => ({
  type: MARKETPLACE_LISTING_CATEGORIES_FETCH_SUCCESS,
  data,
})

const fetchMarketplaceListingCategoriesFail = (error) => ({
  type: MARKETPLACE_LISTING_CATEGORIES_FETCH_FAIL,
  error,
})
