import {
  POPOVER_CLOSE,
  POPOVER_CLOSE_DEFERRED,
  POPOVER_OPEN_DEFERRED,
  POPOVER_CANCEL,
  closePopover,
  openPopover,
} from '../actions/popover'

import get from 'lodash/get'

/**
 * The idea is that a user can hover over multiple elements that open a
 * popover. Rather than rapidly closing and reopening popovers we will have
 * a period of time to allow it to stay open or reposition.
 * @type {number}
 */
const popoverReopenTimeout = 200

let openTimer
let openAction
let closeTimer

function stopCloseTimer() {
  if (typeof closeTimer === 'number') {
    clearTimeout(closeTimer)
    closeTimer = undefined
  }
}

function stopOpenTimer() {
  if (typeof openTimer === 'number') {
    clearTimeout(openTimer)
    openTimer = undefined
  }
}

function stopBothTimers() {
  stopCloseTimer()
  stopOpenTimer()
}

const popoverMiddleware = ({ getState, dispatch }) => next => function(action) {
  if (!action) return

  const { type } = action

  next(action)

  function open() {
    stopBothTimers()
    if (openAction === undefined) {
      // it can be canceled and deleted
      return
    }
    dispatch(openPopover(openAction.popoverType, openAction.popoverProps))
  }

  function close() {
    stopBothTimers()
    dispatch(closePopover())
  }

  if (type === POPOVER_CLOSE) {
    return stopBothTimers()
  }

  const isPopoverOpen = typeof getState().getIn(['popover', 'popoverType']) === 'string'

  if (isPopoverOpen === false && type === POPOVER_CANCEL) {
    openAction = undefined
    return stopBothTimers()
  }

  if (type === POPOVER_OPEN_DEFERRED) {
    
    // if the popover was scheduled to close stop that timer, we will keep it open
    stopCloseTimer()

    // this value is rapidly switching on mouse over and mouse move
    openAction = action

    if (isPopoverOpen) {
      // it's already open so update it
      dispatch(openPopover(openAction.popoverType, openAction.popoverProps))
      return
    }

    // schedule the popover to open soon
    const timeout = get(openAction, 'popoverProps.timeout')
    openTimer = setTimeout(open, timeout)
    return
  }

  if (type === POPOVER_CLOSE_DEFERRED && closeTimer === undefined) {
    // schedule close
    closeTimer = setTimeout(close, popoverReopenTimeout)
  }

}

export default popoverMiddleware
