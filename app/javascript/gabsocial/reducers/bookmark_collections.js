import {
  BOOKMARK_COLLECTIONS_FETCH_REQUEST,
  BOOKMARK_COLLECTIONS_FETCH_SUCCESS,
  BOOKMARK_COLLECTIONS_FETCH_FAIL,
  BOOKMARK_COLLECTION_FETCH_SUCCESS,
  BOOKMARK_COLLECTIONS_CREATE_SUCCESS,
  BOOKMARK_COLLECTIONS_UPDATE_SUCCESS,
  BOOKMARK_COLLECTIONS_REMOVE_REQUEST,
} from '../actions/bookmarks'
import { Map as ImmutableMap, fromJS } from 'immutable'

const initialState = ImmutableMap({
  items: ImmutableMap(),
  isLoading: false,
  isFetched: false,
  isError: false,
})

export default function bookmark_collections(state = initialState, action) {
  switch(action.type) {
    case BOOKMARK_COLLECTIONS_FETCH_REQUEST:
      return state.withMutations((map) => {
        map.set('isLoading', true)
        map.set('isFetched', false)
        map.set('isError', false)
      })
    case BOOKMARK_COLLECTIONS_FETCH_SUCCESS:
      return state.withMutations((map) => {
        if (Array.isArray(action.bookmarkCollections)) {
          action.bookmarkCollections.forEach((bc) => map.setIn(['items', `${bc.id}`], fromJS(bc)))
        }
        map.set('isLoading', false)
        map.set('isFetched', true)
        map.set('isError', false)
      })
    case BOOKMARK_COLLECTIONS_FETCH_FAIL:
      return state.withMutations((map) => {
        map.set('isLoading', false)
        map.set('isFetched', true)
        map.set('isError', true)
      })
    case BOOKMARK_COLLECTIONS_CREATE_SUCCESS:
      return state.withMutations((mutable) => {
        mutable.setIn(['items', `${action.bookmarkCollection.id}`], fromJS(action.bookmarkCollection))
      })
    case BOOKMARK_COLLECTIONS_REMOVE_REQUEST:
      return state.deleteIn(['items', action.bookmarkCollectionId])
    case BOOKMARK_COLLECTIONS_UPDATE_SUCCESS:
      return state.withMutations((mutable) => {
        mutable.setIn(['items', `${action.bookmarkCollection.id}`], fromJS(action.bookmarkCollection))
      })
    case BOOKMARK_COLLECTION_FETCH_SUCCESS:
      return state.withMutations((mutable) => {
        mutable.setIn(['items', `${action.bookmarkCollection.id}`], fromJS(action.bookmarkCollection))
      })
    default:
      return state
  }
}