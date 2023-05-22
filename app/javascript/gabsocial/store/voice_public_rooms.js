import get from 'lodash/get'
import api from '../api'

export const VOICE_RQ_PUBLIC_ROOMS = 'VOICE_RQ_PUBLIC_ROOMS'
export const VOICE_RQ_PUBLIC_ROOMS_SUCCESS = `${VOICE_RQ_PUBLIC_ROOMS}:SUCCESS`
export const VOICE_RQ_PUBLIC_ROOMS_FAIL = `${VOICE_RQ_PUBLIC_ROOMS}:FAILURE`

/**
 * Fetch active public Gab Voice rooms
 */
export const fetchPublicRooms = () => dispatch => {
  api()
    .get('/api/v3/voice')
    .then(response =>
      dispatch({ type: VOICE_RQ_PUBLIC_ROOMS_SUCCESS, data: response.data })
    )
    .catch(error => dispatch({ type: VOICE_RQ_PUBLIC_ROOMS_FAIL, error }))
}

/**
 * Currently the API can give a negative number so this is a workaround
 * to format the numbers and prevent errors if it was missing.
 * TODO remove it when fixed
 * @param {object} room
 * @returns {object}
 */
function negativeSpectatorsWorkaround(room) {
  const spectatorCount = get(room, 'membership.current.spectatorCount')
  if (typeof spectatorCount === 'number' && spectatorCount < 0) {
    // prevent negative
    room.membership.current.spectatorCount = Math.abs(spectatorCount)
  }
  return room
}

const initialState = { rooms: [], isFetched: false, fqd: '' }

export function voiceReducer(state = initialState, action) {
  if (action.type === VOICE_RQ_PUBLIC_ROOMS_SUCCESS) {
    state.rooms = action.data.rooms.map(negativeSpectatorsWorkaround)
    state.fqd = action.data.fqd
    state.isFetched = true
  }
  return state
}
