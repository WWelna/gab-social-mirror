import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import debounce from 'lodash/debounce'
import { isTouch } from '../utils/is_mobile'
import {
  REACTIONS_INITIATOR_DELAY,
  POPOVER_STATUS_REACTIONS_SELECTOR,
} from '../constants'
import { me } from '../initial_state'
import {
  openPopover,
  cancelPopover,
} from '../actions/popover'

class ReactionsPopoverInitiator extends React.PureComponent {

  mouseOverTimeout = null

  componentWillUnmount() {
    if (this.mouseOverTimeout) {
      clearTimeout(this.mouseOverTimeout)
      this.mouseOverTimeout = null
    }

    if (this.container) {
      this.container.removeEventListener('long-press', this.handleOnLongPress)
      this.container.removeEventListener('click', this.handleOnClick)
      this.container.removeEventListener('mouseenter', this.handleOnMouseEnter)
      this.container.removeEventListener('mouseleave', this.handleOnMouseLeave)
    }
  }

  handleOnClick = () => {
    this.props.onClick()
    this.attemptToHidePopover()
  }

  handleOnMouseEnter = (e) => {
    this.mouseOverTimeout = setTimeout(() => {
      this.props.onOpenReactions(this.container, this.props.statusId)
    }, REACTIONS_INITIATOR_DELAY)
    return e.preventDefault()
  }

  handleOnMouseLeave = debounce(() => {
    this.attemptToHidePopover()
  }, 250)

  handleOnLongPress = (e) => {
    this.props.onOpenReactions(this.container, this.props.statusId)
  }

  attemptToHidePopover = () => {
    clearTimeout(this.mouseOverTimeout)
  }

  setRef = (c) => {
    if (!c) return

    this.container = c

    // all have click
    this.container.addEventListener('click', this.handleOnClick, false)

    if (isTouch()) {
      // only touch has long press
      this.container.addEventListener('long-press', this.handleOnLongPress, false)
    } else {
      // else, desktop, has custom hover
      this.container.addEventListener('mouseenter', this.handleOnMouseEnter, false)
      this.container.addEventListener('mouseleave', this.handleOnMouseLeave, false)
    }
  }

  render() {
    const { children, isDisabled } = this.props

    if (isDisabled || !me) return children

    return (
      <div
        ref={this.setRef}
        className={_s.noSelect}
        data-long-press-delay={REACTIONS_INITIATOR_DELAY}
      >
        {children}
      </div>
    )
  }

}

ReactionsPopoverInitiator.propTypes = {
  statusId: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  onOpenReactions: PropTypes.func,
  onCancelReactions: PropTypes.func,
}

const mapDispatchToProps = (dispatch) => ({
  onOpenReactions(targetRef, statusId, callback) {
    dispatch(openPopover(POPOVER_STATUS_REACTIONS_SELECTOR, {
      targetRef,
      statusId,
      callback,
      position: 'top',
    }))
  },
  onCancelReactions() {
    dispatch(cancelPopover())
  },
})

export default connect(null, mapDispatchToProps)(ReactionsPopoverInitiator);
