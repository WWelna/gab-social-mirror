import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { supportsPassiveEvents, primaryInput } from 'detect-it'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { Popper } from 'react-popper'
import { withRouter } from 'react-router-dom'
import get from 'lodash/get'
import debounce from 'lodash/debounce'
import {
  CX,
  POPOVER_SHARE,
  POPOVER_STATUS_REACTIONS_SELECTOR,
} from '../../constants'
import { cancelPopover } from '../../actions/popover'

const listenerOptions = supportsPassiveEvents ? { passive: true } : false

/**
 * How far away from the popover can mouse go before we close it?
 * @type {number}
 */
const moveAwayMargin = 40

/**
 * Does parentElement contain checkElement? It will traverse up the tree from
 * where checkElement is at up to a maximum of 10 elements. Node.contains
 * is supposed to do that but it does not perform reliably.
 *
 * Why? A hunch is that elements inside the popper can switch out fast, like a
 * dynamic menu. So technically this element is no longer contained. But really
 * it is sort of, or it was.
 *
 * A good place to test is containsElement vs. Node.contains is on:
 * ./compose_destination_header.js
 *
 * @param {object} parentElement
 * @param {object} checkElement
 * @param {number} [level]
 * @returns {boolean}
 */
function containsElement(parentElement, checkElement, level = 0) {
  if (parentElement === undefined || parentElement === null) {
    // nil doesn't contain things
    return false
  }
  if (parentElement.contains(checkElement)) {
    // checkElement is inside (decendant) of parentElement
    return true
  }
  level += 1
  if (level > 7) {
    // too many checks, it's not local enough, stop
    return false
  }
  const checkParent = checkElement.parentNode
  if (checkParent === null) {
    /*

    We lost the parent reference so lets assume maybe it was inside
    the parent at some time in the past. 🤷

    */
    return true
  }
  return containsElement(parentElement, checkParent, level)
}

class PopoverBase extends ImmutablePureComponent {
  componentDidUpdate(prevProps) {
    if (this.isOpen) {
      // if we don't use a timeout it will bind and trigger some of the events
      // simultaneously
      setTimeout(() => this.bindEvents(), 20)
    } else {
      this.unbindEvents()
    }

     // if page location changes, immediately close popover
    if (prevProps.location !== this.props.location) {
      this.handleClose()
    }
  }

  componentWillUnmount() {
    this.unbindEvents()
  }

  get isOpen() {
    return typeof this.props.popoverType === 'string'
  }

  bindEvents() {
    if (this.bound) {
      return // it's already bound
    }
    if (primaryInput === 'touch') {
      document.addEventListener('touchend', this.handleDocumentClick, listenerOptions)
    } else {
      document.addEventListener('click', this.handleDocumentClick, false)
    }
    document.addEventListener('keydown', this.handleKeyDown, false)
    window.addEventListener('popstate', this.handleClose, false)
    window.addEventListener('mousemove', this.mouseMove, listenerOptions)
    this.bound = true
  }

  unbindEvents() {
    if (!this.bound) {
      return // it wasn't bound, skip
    }
    if (primaryInput === 'touch') {
      document.removeEventListener('touchend', this.handleDocumentClick, listenerOptions)
    } else {
      document.removeEventListener('click', this.handleDocumentClick, false)
    }
    document.removeEventListener('keydown', this.handleKeyDown, false)
    window.removeEventListener('hashchange', this.handleClose)
    window.removeEventListener('mousemove', this.mouseMove)
    this.bound = false
  }

  /**
   * This event checks if the mouse is still on or around the popover elements.
   * If the mouse goes too far away then it closes.
   * @param {MouseEvent} evt
   * @param {number} evt.clientX from DOM mouse event
   * @param {number} evt.clientY
   */
  mouseMove = debounce(({ clientX: mouseX, clientY: mouseY }) => {
    const { outerRef } = this
    const { useProximity } = this.props

    if (!outerRef || !useProximity) {
      return
    }

    const { left, top, right, bottom } = outerRef.getBoundingClientRect()
    const tooFarLeft = (left - moveAwayMargin)
    const tooFarRight = (right + moveAwayMargin)
    const tooFarAbove = (top - moveAwayMargin)
    const tooFarBelow = (bottom + moveAwayMargin)

    if (
      mouseX < tooFarLeft ||
      mouseX > tooFarRight ||
      mouseY < tooFarAbove ||
      mouseY > tooFarBelow
    ) {
      this.handleClose()
    }
  }, 200, { trailing: true })

  /**
   * The user clicks somewhere in the document and we'll figure out if we
   * need to close thte popover.
   * @param {object} evt
   */
  handleDocumentClick = (evt) => {
    // document click screws this one up
    if (this.props.popoverType === POPOVER_SHARE) {
      return
    }

    const { popperNode, outerRef, arrowRef, innerRef } = this

    // for a reason that is currenly unknown all these can be nil
    if (!popperNode && !outerRef && !arrowRef && !innerRef) {
      return this.handleClose()
    }

    const { visible, targetRef } = this.props
    const parents = [popperNode, outerRef, arrowRef, innerRef, targetRef]
    const parentsContainTarget = parents
      .filter(item => item !== undefined && item !== null)
      .some(parent => containsElement(parent, evt.target))
    
    if (parentsContainTarget) {
      // some element we know about contains the target, so leave it open
      return
    }

    // close, the user clicked out of our area of interest
    this.handleClose()
  }

  handleKeyDown = (e) => {
    const { outerRef } = this

    const items = Array.from(outerRef.getElementsByTagName('a'))
    const index = items.indexOf(document.activeElement)
    let element

    switch (e.key) {
    case 'ArrowDown':
      element = items[index + 1]
      if (element) element.focus()
      break
    case 'ArrowUp':
      element = items[index - 1]
      if (element) element.focus()
      break
    case 'Home':
      element = items[0]
      if (element) element.focus()
      break
    case 'End':
      element = items[items.length - 1]
      if (element) element.focus()
      break
    case 'Escape':
      this.handleClose()
      break
    }
  }

  handleItemClick = (e) => {
    const i = Number(e.currentTarget.getAttribute('data-index'))
    const { action, to } = this.props.items[i]

    this.handleClose()

    if (typeof action === 'function') {
      e.preventDefault()
      action()
    } else if (to) {
      e.preventDefault()
      this.props.history.push(to)
    }
  }

  handleClose = () => {
    this.unbindEvents()
    this.props.onClose()
  }

  setOuterRef = el => this.outerRef = el
  setInnerRef = el => this.innerRef = el
  setArrowRef = el => this.arrowRef = el

  render() {
    const { outerRef, arrowRef } = this
    const {
      children,
      visible,
      position,
      targetRef,
      popoverType,
    } = this.props

    const containerClasses = CX({
      d: 1,
      z5: 1,
      boxShadowPopover: popoverType !== POPOVER_STATUS_REACTIONS_SELECTOR && visible,
      displayNone: !visible,
      circle: popoverType === POPOVER_STATUS_REACTIONS_SELECTOR,
    })

    return (
      <Popper
        innerRef={(node) => this.popperNode = node}
        placement={position}
        referenceElement={targetRef}
        strategy='fixed'
      >
        {({ ref, style, placement, arrowProps, isReferenceHidden }) => {
          if (isReferenceHidden) return null

          // this is awkward and confusing but we need the ref and popper needs the ref
          const setPopperOuterRef = el => el !== null && (this.setOuterRef(el) | ref(el))
          const setPopperArrowRef = el => el !== null && (this.setArrowRef(el) | arrowProps.ref(el))

          return (
            <div ref={setPopperOuterRef}
              className={[_s.z5, _s.px5, _s.py5].join(' ')}
              style={style}
              data-placement={placement}>
              <div ref={setPopperArrowRef} style={arrowProps.style} data-popper-arrow />
              <div ref={this.setInnerRef}
                className={containerClasses}
                data-popover='true'
                onKeyDown={this.handleKeyDown}>
                {children}
              </div>
            </div>
          )
        }}
      </Popper>
    )
  }

}

const mapStateToProps = (state) => ({
  isModalOpen: !!state.getIn(['modal', 'modalType']),
  popoverPlacement: state.getIn(['popover', 'placement']),
  popoverType: state.getIn(['popover', 'popoverType'])
})

PopoverBase.propTypes = {
  title: PropTypes.string,
  disabled: PropTypes.bool,
  status: ImmutablePropTypes.map,
  isUserTouching: PropTypes.func,
  isModalOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  position: PropTypes.string,
  visible: PropTypes.bool,
  targetRef: PropTypes.any,
  useProximity: PropTypes.bool,
}

PopoverBase.defaultProps = {
  title: 'Menu',
  position: 'bottom',
  useProximity: true,
}

export default withRouter(connect(mapStateToProps)(PopoverBase))
