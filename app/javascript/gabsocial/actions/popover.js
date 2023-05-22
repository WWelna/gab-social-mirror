export const POPOVER_OPEN = 'POPOVER_OPEN'
export const POPOVER_OPEN_DEFERRED = 'POPOVER_OPEN_DEFERRED'
export const POPOVER_CLOSE = 'POPOVER_CLOSE'
export const POPOVER_CLOSE_DEFERRED = 'POPOVER_CLOSE_DEFERRED'
export const POPOVER_CANCEL = 'POPOVER_CANCEL'

/**
 * Close the popover now.
 * @returns {object}
 */
export const closePopover = () => ({ type: POPOVER_CLOSE })

/**
 * Schedule the popover to close.
 * @returns {object}
 */
export const closePopoverDeferred = () => ({ type: POPOVER_CLOSE_DEFERRED })

/**
 * Open the popover right now.
 * @param {string} type
 * @param {object} props
 * @param {object} props.targetRef element
 * @param {string} [props.position] popper position
 * @returns {object}
 */
export const openPopover = (type, props) => ({
  type: POPOVER_OPEN,
  popoverType: type,
  popoverProps: props,
})

/**
 * Schedule to open the popover. If popoverProps.targetRef isn't set it may not
 * display because popper can't position the element to nil.
 *
 *  It uses the same options as openPopover but adds timeout for deferred open.
 *
 * Arbitrary values can also go onto props argument.
 *
 * @param {string} type
 * @param {object} props
 * @param {number} [props.timeout] delay for opening the popover
 * @returns {object}
 */
export const openPopoverDeferred = (type, props) => ({
  type: POPOVER_OPEN_DEFERRED,
  popoverType: type,
  popoverProps: props,
})

/**
 * Cancel stops the timers fromd deferred popovers.
 * @returns {object}
 */
export const cancelPopover = () => ({ type: POPOVER_CANCEL })
