import api from '../api'
import { me } from '../initial_state'
import { fetchStatus } from './statuses'

export const PROMOTIONS_FETCH_REQUEST = 'PROMOTIONS_FETCH_REQUEST'
export const PROMOTIONS_FETCH_SUCCESS = 'PROMOTIONS_FETCH_SUCCESS'
export const PROMOTIONS_FETCH_FAIL = 'PROMOTIONS_FETCH_FAIL'

/**
 *
 */
export const fetchPromotions = () => (dispatch, getState) => {
  if (!me) return

  dispatch(fetchPromotionsRequest())

  api(getState).get('/api/v1/promotions').then(({ data: statuses }) => {
    dispatch(fetchPromotionsSuccess(statuses))
    statuses.forEach(item => dispatch(fetchStatus(item.status_id)))
  }).catch((error) => {
    dispatch(fetchPromotionsFail(error))
  })
}

const fetchPromotionsRequest = () => ({
  type: PROMOTIONS_FETCH_REQUEST,
})

const fetchPromotionsSuccess = (items) => ({
  type: PROMOTIONS_FETCH_SUCCESS,
  items,
})

const fetchPromotionsFail = (error) => ({
  type: PROMOTIONS_FETCH_FAIL,
  error,
})
