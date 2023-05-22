import api from '../api'
import { me, filters } from '../initial_state'

export const FILTERS_FETCH_SUCCESS = 'FILTERS_FETCH_SUCCESS'

/**
 * 
 */
export const fetchFilters = () => (dispatch, getState) => {
  if (!me) return

  dispatch(fetchFiltersSuccess(filters))
}

const fetchFiltersSuccess = (filters) => ({
  type: FILTERS_FETCH_SUCCESS,
  filters,
})
