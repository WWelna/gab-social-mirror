import { changeSetting } from './settings'

export const TIMELINE_INJECTION_SHOW = 'TIMELINE_INJECTION_SHOW'
export const TIMELINE_INJECTION_HIDE = 'TIMELINE_INJECTION_HIDE'

export const showTimelineInjection = injectionId => dispatch => {
  dispatch({
    type: TIMELINE_INJECTION_SHOW,
    injectionId
  })
}

export const hideTimelineInjection = injectionId => (dispatch, getState) => {
  const existingInjectionWeight = getState().getIn(
    ['settings', 'injections', injectionId],
    null
  )

  if (!existingInjectionWeight) return

  const newInjectionWeight = Math.max(existingInjectionWeight - 0.005, 0.01)

  dispatch(changeSetting(['injections', injectionId], newInjectionWeight))

  dispatch({
    type: TIMELINE_INJECTION_HIDE,
    injectionId
  })
}
