import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import debounce from 'lodash.debounce'
import {
  BREAKPOINT_EXTRA_SMALL,
  POPOVER_STATUS_REACTIONS_SELECTOR,
} from '../constants'
import { me } from '../initial_state'
import {
  openPopover,
  cancelPopover,
} from '../actions/popover'

class ReactionsPopoverInitiator extends React.PureComponent {

  touchStartTime = null
  mouseOverTimeout = null

  handleMouseEnter = (e) => {
    this.touchStartTime = (new Date()).getTime()
    
    // if (!document.body.classList.contains(_s.selectingReaction) && this.props.isXS) {
      // setTimeout(() => {
      //   document.body.classList.add(_s.selectingReaction)
      // }, 100)
    // }
    this.mouseOverTimeout = setTimeout(() => {
      this.props.onOpenReactions(this.container, this.props.statusId)
    }, 850)
    return e.preventDefault()
  }

  handleOnClick = () => {
    this.props.onClick()
    // : todo : fix mobile touch up outside
    if (this.props.isLike) {
      this.attemptToHidePopover()
    }
  }

  handleMouseLeave = debounce(() => {
    const offset = (new Date()).getTime() - this.touchStartTime
    if (this.props.isXS && offset <= 350) {
      this.props.onClick()
    }
    this.attemptToHidePopover()
  }, 250)

  attemptToHidePopover = () => {
    clearTimeout(this.mouseOverTimeout)
    this.touchStartTime = null
  }

  setRef = (c) => {
    this.container = c
  }

  render() {
    const {
      isDisabled,
      children,
      isXS,
    } = this.props

    if (isDisabled || !me) return children

    return (
      <div 
        ref={this.setRef}
        className={_s.noSelect}
        // : todo : test
        onClick={!isXS ? this.handleOnClick : undefined}
        onTouchStart={isXS ? this.handleMouseEnter : undefined}
        onTouchEnd={isXS ? this.handleMouseLeave : undefined}
        onMouseEnter={!isXS ? this.handleMouseEnter : undefined}
        onMouseLeave={!isXS ? this.handleMouseLeave : undefined}
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

const mapStateToProps = (state, props) => ({
  isReacting: state.getIn(['popover', 'popoverType']) === POPOVER_STATUS_REACTIONS_SELECTOR,
  hoveringReactionId: state.getIn(['reactions', 'hovering_id']),
  reactionPopoverOpenForStatusId: state.getIn(['reactions', 'reactionPopoverOpenForStatusId']),
  isXS: state.getIn(['settings', 'window_dimensions', 'width']) <= BREAKPOINT_EXTRA_SMALL,
})

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

export default connect(mapStateToProps, mapDispatchToProps)(ReactionsPopoverInitiator);