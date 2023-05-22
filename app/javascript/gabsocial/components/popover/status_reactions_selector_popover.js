import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { connect } from 'react-redux'
import isObject from 'lodash/isObject'
import get from 'lodash/get'
import { isTouch } from '../../utils/is_mobile'
import { favorite } from '../../actions/interactions';
import {
  setIsHoveringReactionId,
  setReactionPopoverStatus,
} from '../../actions/reactions'
import { CX, BREAKPOINT_EXTRA_SMALL } from '../../constants'
import { me } from '../../initial_state'
import ReactionTypeImage from '../reaction_type_image'
import { supportsPassiveEvents, primaryInput } from 'detect-it'

class StatusReactionsSelectorPopover extends ImmutablePureComponent {

  componentDidMount() {
    this.props.onSetReactionPopoverStatus(this.props.statusId)

    if (isTouch()) {
      const evtOpts = { passive: false }
      document.documentElement.classList.add(_s.selectingReaction)
      if (primaryInput === 'touch') {      
        document.body.addEventListener('touchmove', this.touchmove, evtOpts)
        document.body.addEventListener('touchend', this.touchend, evtOpts)
      }
    }
  }

  componentWillUnmount() {
    this.props.onSetReactionPopoverStatus(null)

    document.documentElement.classList.remove(_s.selectingReaction)
    if (primaryInput === 'touch') {
      document.body.removeEventListener('touchmove', this.touchmove)
      document.body.removeEventListener('touchend', this.touchend)
    }
  }

  handleOnClick = (reactionId) => {
    this.props.onClick(reactionId)
    this.props.onClose()
  }

  getElement = (e) => {
    const hasTouches = e.touches && isObject(get(e, 'touches.0'))
    
    const existingTarget = get(e, 'touches[0].target')
    const hasCorrectExistingTarget = !!existingTarget && existingTarget.hasAttribute('data-reaction')
    if (hasCorrectExistingTarget) {
      return existingTarget.getAttribute('data-reaction')
    }

    const xcoord = hasTouches ? e.touches[0].clientX : e.clientX;
    const ycoord = hasTouches ? e.touches[0].clientY : e.clientX;
    
    if (isNaN(xcoord) || isNaN(ycoord)) return null
    const targets = document.elementsFromPoint(xcoord, ycoord);
    
    let target = null
    
    if (Array.isArray(targets)) {
      for (let i = 0; i < targets.length; i++) {
        const potentialTarget = targets[i];
        if (potentialTarget.hasAttribute('data-reaction')){
          target = potentialTarget
          break;
        }
      }

      const reactionId = !!target ? target.getAttribute('data-reaction') : null
      return reactionId
    } else {
      return null
    }
  }

  touchmove = (e) => {
    e.preventDefault()
    const reactionId = this.getElement(e)
    this.props.onSetIsHoveringReactionId(reactionId)
  }

  touchend = (e) => {
    const { hoveringId } = this.props
  
    if (hoveringId) {
      this.props.onClick(hoveringId)
    }
    this.props.onSetIsHoveringReactionId(null)
    this.props.onClose()
  }

  render() {
    const { hoveringId, reactions, width } = this.props

    if (!me || !reactions || reactions.size < 1) return null

    const isTouchable = isTouch()
    const isXS = width <= BREAKPOINT_EXTRA_SMALL
    const isTiny = width <= 400
    const iconSize = isTiny ? '25px' : isXS ? '30px' : '36px'

    const containerClasses = CX({
      d: 1,
      flexRow: 1,
      bgPrimary: 1,
      aiCenter: 1,
      jcCenter: 1,
      h55PX: 1,
      circle: 1,
      px10: 1,
      noSelect: 1,
      boxShadowPopover: 1,
      border1PX: 1,
      borderColorSecondary: 1,
      z6: 1,
      reactable: 1,
    })

    return (
      <div
        className={containerClasses}
        style={{ maxWidth: '372px' }}
      >
        {
          reactions.map((reaction, i) => {
            const isLast = i === reactions.size - 1
            const classes = CX({
              d: 1,
              cursorPointer: 1,
              noSelect: 1,
              grow_OnHover: !isTouchable,
              grow: isTouchable && hoveringId === reaction.get('id'),
              noUnderline: 1,
              outlineNone: 1,
              bgTransparent: 1,
              reactable: 1,
              px5: !reaction.get('isCustom'),
              aiCenter: !reaction.get('isCustom'),
              jcCenter: !reaction.get('isCustom'),
              z6: isTouchable,
              mr5: !isLast,
              pt100PX: isTouchable,
              pb100PX: isTouchable,
              mtNeg100PX: isTouchable,
              mbNeg100PX: isTouchable,
            })
            return (
              <button
                className={classes}
                data-reaction={reaction.get('id')}
                data-name={reaction.get('name')}
                key={`reaction-${i}-${reaction.get('slug')}`}
                onClick={() => this.handleOnClick(reaction.get('id'))}
              >
                <ReactionTypeImage reactionTypeId={reaction.get('id')} size={iconSize} />
              </button>
            )
          })
        }
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  width: state.getIn(['settings', 'window_dimensions', 'width']),
  reactions: state.getIn(['reactions', 'active_reactable']),
  hoveringId: state.getIn(['reactions', 'hovering_id']),
})

const mapDispatchToProps = (dispatch, { statusId, callback }) => ({
  onClick(reactionId) {
    // if (callback) callback(reaction)
    dispatch(favorite(statusId, reactionId))
  },
  onSetIsHoveringReactionId(reactionId) {
    dispatch(setIsHoveringReactionId(reactionId))
  },
  onSetReactionPopoverStatus(statusId) {
    dispatch(setReactionPopoverStatus(statusId))
  },
})

StatusReactionsSelectorPopover.propTypes = {
  statusId: PropTypes.string,
  callback: PropTypes.func,
  onSetIsHoveringReactionId: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(StatusReactionsSelectorPopover)
