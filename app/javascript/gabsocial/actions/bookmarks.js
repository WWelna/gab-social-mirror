import api from '../api'
import { me, meUsername } from '../initial_state'

export const BOOKMARK_COLLECTIONS_FETCH_REQUEST = 'BOOKMARK_COLLECTIONS_FETCH_REQUEST'
export const BOOKMARK_COLLECTIONS_FETCH_SUCCESS = 'BOOKMARK_COLLECTIONS_FETCH_SUCCESS'
export const BOOKMARK_COLLECTIONS_FETCH_FAIL = 'BOOKMARK_COLLECTIONS_FETCH_FAIL'

export const BOOKMARK_COLLECTION_FETCH_REQUEST = 'BOOKMARK_COLLECTION_FETCH_REQUEST'
export const BOOKMARK_COLLECTION_FETCH_SUCCESS = 'BOOKMARK_COLLECTION_FETCH_SUCCESS'
export const BOOKMARK_COLLECTION_FETCH_FAIL = 'BOOKMARK_COLLECTION_FETCH_FAIL'

export const BOOKMARK_COLLECTIONS_CREATE_REQUEST = 'BOOKMARK_COLLECTIONS_CREATE_REQUEST'
export const BOOKMARK_COLLECTIONS_CREATE_SUCCESS = 'BOOKMARK_COLLECTIONS_CREATE_SUCCESS'
export const BOOKMARK_COLLECTIONS_CREATE_FAIL = 'BOOKMARK_COLLECTIONS_CREATE_FAIL'

export const BOOKMARK_COLLECTIONS_REMOVE_REQUEST = 'BOOKMARK_COLLECTIONS_REMOVE_REQUEST'
export const BOOKMARK_COLLECTIONS_REMOVE_SUCCESS = 'BOOKMARK_COLLECTIONS_REMOVE_SUCCESS'
export const BOOKMARK_COLLECTIONS_REMOVE_FAIL = 'BOOKMARK_COLLECTIONS_REMOVE_FAIL'

export const BOOKMARK_COLLECTIONS_UPDATE_FAIL = 'BOOKMARK_COLLECTIONS_UPDATE_FAIL'
export const BOOKMARK_COLLECTIONS_UPDATE_REQUEST = 'BOOKMARK_COLLECTIONS_UPDATE_REQUEST'
export const BOOKMARK_COLLECTIONS_UPDATE_SUCCESS = 'BOOKMARK_COLLECTIONS_UPDATE_SUCCESS'

export const BOOKMARK_COLLECTIONS_UPDATE_STATUS_FAIL = 'BOOKMARK_COLLECTIONS_UPDATE_STATUS_FAIL'
export const BOOKMARK_COLLECTIONS_UPDATE_STATUS_REQUEST = 'BOOKMARK_COLLECTIONS_UPDATE_STATUS_REQUEST'
export const BOOKMARK_COLLECTIONS_UPDATE_STATUS_SUCCESS = 'BOOKMARK_COLLECTIONS_UPDATE_STATUS_SUCCESS'

// PLURAL
export const fetchBookmarkCollections = () => (dispatch, getState) => {
  if (!me) return

  if (getState().getIn(['bookmark_collections', 'isLoading'])) return

  dispatch(fetchBookmarkCollectionsRequest())

  api(getState).get('/api/v1/bookmark_collections').then((response) => {
    dispatch(fetchBookmarkCollectionsSuccess(response.data))
  }).catch((error) => {
    dispatch(fetchBookmarkCollectionsFail(error))
  })
}

const fetchBookmarkCollectionsRequest = () => ({
  type: BOOKMARK_COLLECTIONS_FETCH_REQUEST,
})

const fetchBookmarkCollectionsSuccess = (bookmarkCollections) => ({
  type: BOOKMARK_COLLECTIONS_FETCH_SUCCESS,
  bookmarkCollections,
})

const fetchBookmarkCollectionsFail = (error) => ({
  type: BOOKMARK_COLLECTIONS_FETCH_FAIL,
  showToast: true,
  error,
})

// SINGULAR
export const fetchBookmarkCollection = (bookmarkCollectionId) => (dispatch, getState) => {
  if (!me || !bookmarkCollectionId || bookmarkCollectionId.toLowerCase() === 'saved') return

  if (getState().getIn(['bookmark_collections', 'isLoading'])) return

  dispatch(fetchBookmarkCollectionRequest())

  api(getState).get(`/api/v1/bookmark_collections/${bookmarkCollectionId}`).then((response) => {
    dispatch(fetchBookmarkCollectionSuccess(response.data))
  }).catch((error) => {
    dispatch(fetchBookmarkCollectionFail(error))
  })
}

const fetchBookmarkCollectionRequest = () => ({
  type: BOOKMARK_COLLECTION_FETCH_REQUEST,
})

const fetchBookmarkCollectionSuccess = (bookmarkCollection) => ({
  type: BOOKMARK_COLLECTION_FETCH_SUCCESS,
  bookmarkCollection,
})

const fetchBookmarkCollectionFail = (error) => ({
  type: BOOKMARK_COLLECTION_FETCH_FAIL,
  showToast: true,
  error,
})

export const createBookmarkCollection = (title) => (dispatch, getState) => {
  if (!me || !title) return

  dispatch(createBookmarkCollectionRequest())

  api(getState).post('/api/v1/bookmark_collections', { title }).then((response) => {
    dispatch(createBookmarkCollectionSuccess(response.data))
  }).catch((error) => {
    dispatch(createBookmarkCollectionFail(error))
  })
}

const createBookmarkCollectionRequest = () => ({
  type: BOOKMARK_COLLECTIONS_CREATE_REQUEST,
})

const createBookmarkCollectionSuccess = (bookmarkCollection) => ({
  type: BOOKMARK_COLLECTIONS_CREATE_SUCCESS,
  bookmarkCollection,
})

const createBookmarkCollectionFail = (error) => ({
  type: BOOKMARK_COLLECTIONS_CREATE_FAIL,
  showToast: true,
  error,
})

export const removeBookmarkCollection = (bookmarkCollectionId, routerHistory) => (dispatch, getState) => {
  if (!me || !bookmarkCollectionId) return

  dispatch(removeBookmarkCollectionRequest(bookmarkCollectionId))

  api(getState).delete(`/api/v1/bookmark_collections/${bookmarkCollectionId}`).then((response) => {
    dispatch(removeBookmarkCollectionSuccess(response.data))
    routerHistory.push(`/${meUsername}/bookmarks`)
  }).catch((error) => {
    dispatch(removeBookmarkCollectionFail(error))
  })
}

const removeBookmarkCollectionRequest = (bookmarkCollectionId) => ({
  type: BOOKMARK_COLLECTIONS_REMOVE_REQUEST,
  bookmarkCollectionId,
})

const removeBookmarkCollectionSuccess = () => ({
  type: BOOKMARK_COLLECTIONS_REMOVE_SUCCESS,
  showToast: true,
})

const removeBookmarkCollectionFail = (error) => ({
  type: BOOKMARK_COLLECTIONS_REMOVE_FAIL,
  showToast: true,
  error,
})

export const updateBookmarkCollection = (bookmarkCollectionId, title) => (dispatch, getState) => {
  if (!me || !bookmarkCollectionId || !title) return

  dispatch(updateBookmarkCollectionRequest())

  api(getState).put(`/api/v1/bookmark_collections/${bookmarkCollectionId}`, { title }).then((response) => {
    dispatch(updateBookmarkCollectionSuccess(response.data))
  }).catch((error) => {
    dispatch(updateBookmarkCollectionFail(error))
  })
}

const updateBookmarkCollectionRequest = () => ({
  type: BOOKMARK_COLLECTIONS_UPDATE_REQUEST,
})

const updateBookmarkCollectionSuccess = (bookmarkCollection) => ({
  type: BOOKMARK_COLLECTIONS_UPDATE_SUCCESS,
  bookmarkCollection,
})

const updateBookmarkCollectionFail = (error) => ({
  type: BOOKMARK_COLLECTIONS_UPDATE_FAIL,
  showToast: true,
  error,
})

export const updateBookmarkCollectionStatus = (statusId, bookmarkCollectionId) => (dispatch, getState) => {
  if (!me || !statusId) return

  dispatch(updateBookmarkCollectionStatusRequest())

  api(getState).post(`/api/v1/bookmark_collections/${bookmarkCollectionId}/bookmarks`, { statusId }).then((response) => {
    dispatch(updateBookmarkCollectionStatusSuccess(statusId, bookmarkCollectionId))
  }).catch((error) => {
    dispatch(updateBookmarkCollectionStatusFail(error))
  })
}

const updateBookmarkCollectionStatusRequest = () => ({
  type: BOOKMARK_COLLECTIONS_UPDATE_STATUS_REQUEST,
})

const updateBookmarkCollectionStatusSuccess = (statusId, bookmarkCollectionId) => ({
  type: BOOKMARK_COLLECTIONS_UPDATE_STATUS_SUCCESS,
  statusId,
  bookmarkCollectionId,
})

const updateBookmarkCollectionStatusFail = (error) => ({
  type: BOOKMARK_COLLECTIONS_UPDATE_STATUS_FAIL,
  showToast: true,
  error,
})
