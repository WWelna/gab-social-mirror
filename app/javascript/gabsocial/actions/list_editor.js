import api from '../api'
import { me } from '../initial_state'
import { importFetchedAccounts } from './importer'
import {
  createList,
  updateList,
  addToList,
  removeFromList,
} from './lists'

export const LIST_EDITOR_VISIBILITY_CHANGE = 'LIST_EDITOR_VISIBILITY_CHANGE'
export const LIST_EDITOR_TITLE_CHANGE = 'LIST_EDITOR_TITLE_CHANGE'
export const LIST_EDITOR_SLUG_CHANGE  = 'LIST_EDITOR_SLUG_CHANGE'
export const LIST_EDITOR_RESET        = 'LIST_EDITOR_RESET'
export const LIST_EDITOR_SETUP        = 'LIST_EDITOR_SETUP'

export const LIST_EDITOR_SUGGESTIONS_CHANGE = 'LIST_EDITOR_SUGGESTIONS_CHANGE'
export const LIST_EDITOR_SUGGESTIONS_READY  = 'LIST_EDITOR_SUGGESTIONS_READY'
export const LIST_EDITOR_SUGGESTIONS_CLEAR  = 'LIST_EDITOR_SUGGESTIONS_CLEAR'

/**
 * Helper function to either create or update a list
 */
 export const submitListEditor = (shouldReset, routerHistory) => (dispatch, getState) => {
  const listId = getState().getIn(['list_editor', 'listId'])
  const title  = getState().getIn(['list_editor', 'title'])
  const visibility  = getState().getIn(['list_editor', 'visibility'])
  const slug  = getState().getIn(['list_editor', 'slug'])

  if (listId === null) {
    dispatch(createList(title, visibility, shouldReset, routerHistory))
  } else {
    dispatch(updateList(listId, title, slug, visibility, shouldReset))
  }
}

/**
 *
 */
 export const setupListEditor = (listId) => (dispatch, getState) => {
  dispatch({
    type: LIST_EDITOR_SETUP,
    list: getState().getIn(['lists', 'items', listId]),
  })
}

/**
 *
 */
export const changeListEditorTitle = (value) => ({
  type: LIST_EDITOR_TITLE_CHANGE,
  value,
})

export const changeListEditorSlug = (value) => ({
  type: LIST_EDITOR_SLUG_CHANGE,
  value,
})

 export const changeListEditorVisibility = (value) => ({
  type: LIST_EDITOR_VISIBILITY_CHANGE,
  value,
})


export const resetListEditor = () => ({
  type: LIST_EDITOR_RESET,
})

/**
 *
 */
export const fetchListSuggestions = (q) => (dispatch, getState) => {
  if (!me || !q || !q.trim()) {
    dispatch(importFetchedAccounts([]))
    dispatch(fetchListSuggestionsReady(q, []))
    return
  }

  const params = {
    q,
    resolve: false,
    limit: 25,
  }

  api(getState).get('/api/v1/accounts/search', { params }).then(({ data }) => {
    dispatch(importFetchedAccounts(data))
    dispatch(fetchListSuggestionsReady(q, data))
  })
  // }).catch(error => dispatch(showAlertForError(error)))
}

/**
 *
 */
const fetchListSuggestionsReady = (query, accounts) => ({
  type: LIST_EDITOR_SUGGESTIONS_READY,
  query,
  accounts,
})

/**
 *
 */
export const clearListSuggestions = () => ({
  type: LIST_EDITOR_SUGGESTIONS_CLEAR,
})

/**
 *
 */
export const changeListSuggestions = (value) => ({
  type: LIST_EDITOR_SUGGESTIONS_CHANGE,
  value,
})

/**
 *
 */
 export const addToListEditor = accountId => (dispatch, getState) => {
  dispatch(addToList(getState().getIn(['list_editor', 'listId']), accountId))
}

/**
 *
 */
 export const removeFromListEditor = accountId => (dispatch, getState) => {
  dispatch(removeFromList(getState().getIn(['list_editor', 'listId']), accountId))
}
