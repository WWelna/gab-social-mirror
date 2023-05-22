export const SWIPE_TOGGLE_PAUSED = 'SWIPE_TOGGLE_PAUSED'

/**
 * If paused the <ReactSwipeableViews> will stop processing mouse and touch
 * events to allow a sub-component to utilize those.
 * @param {boolean} [paused]
 * @returns {object}
 */
export const togglePaused = paused => ({
  type: SWIPE_TOGGLE_PAUSED,
  paused
})
