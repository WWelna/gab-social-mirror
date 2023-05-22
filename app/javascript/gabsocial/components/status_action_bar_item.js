import React from 'react'
import PropTypes from 'prop-types'
import {
  CX,
  BREAKPOINT_SMALL,
} from '../constants'
import { me } from '../initial_state'
import Responsive from '../features/ui/util/responsive_component'
import Button from './button'
import Text from './text'
import ReactionTypeImage from './reaction_type_image'
import ReactionsPopoverInitiator from './reactions_popover_initiator'

class StatusActionBarItem extends React.PureComponent {

  render() {
    const {
      title,
      icon,
      active,
      disabled,
      buttonRef,
      altTitle,
      isCompact,
      isLike,
      labelNumber,
      reactionTypeId,
      onClick,
      statusId,
      to,
    } = this.props

    const keepIcon = !reactionTypeId || `${reactionTypeId}` === '1'
    const color = active ? 'brand' : 'secondary'
    const weight = active ? 'bold' : 'medium'

    const btnClasses = CX({
      jcCenter: 1, 
      aiCenter: 1,
      noSelect: 1,
      capitalize: 1,
      px10: !isCompact,
      bgSubtle_onHover: !disabled,
      flexRow: !keepIcon && !!reactionTypeId,
      aiCenter: !keepIcon && !!reactionTypeId,
    })

    const theButton = (
      <Button
        isBlock
        radiusSmall
        backgroundColor='none'
        title={altTitle || title}
        color={color}
        buttonRef={buttonRef}
        className={btnClasses}
        onClick={!isLike ? onClick : undefined}
        isDisabled={disabled}
        icon={keepIcon ? icon : undefined}
        to={!isLike ? to : undefined}
        iconSize='16px'
        iconClassName={[_s.d, _s.inheritFill].join(' ')}
      >

        {
          (!keepIcon && !!reactionTypeId) && 
          <ReactionTypeImage reactionTypeId={`${reactionTypeId}`} size='15px' />
        }

        {
          !!title && !isCompact && !labelNumber &&
          <Responsive min={BREAKPOINT_SMALL}>
            <Text color='inherit' size='small' weight={weight} className={[_s.ml10, _s.capitalize].join(' ')}>
              {altTitle || title}
            </Text>
          </Responsive>            
        }
        {
          !!labelNumber &&
          <Text color='inherit' size='small' weight={weight} className={_s.ml10}>
            {labelNumber}
          </Text>
        }
      </Button>
    )

    if (isLike) {
      return (
        <div className={[_s.d, _s.px5, _s.flexNormal, _s.noSelect].join(' ')}>
          <ReactionsPopoverInitiator
            statusId={statusId}
            onClick={onClick}
            isDisabled={disabled}
          >
            {theButton}
          </ReactionsPopoverInitiator>
        </div>
      )
    }

    return (
      <div className={[_s.d, _s.px5, _s.flexNormal, _s.noSelect].join(' ')}>
        <Button
          isBlock
          radiusSmall
          backgroundColor='none'
          title={altTitle || title}
          color={color}
          buttonRef={buttonRef}
          className={btnClasses}
          onClick={(!isLike || !me) ? onClick : undefined}
          isDisabled={disabled}
          icon={keepIcon ? icon : undefined}
          to={!isLike ? to : undefined}
          iconSize='16px'
          iconClassName={[_s.d, _s.inheritFill].join(' ')}
        >

          {
            (!keepIcon && !!reactionTypeId) && 
            <ReactionTypeImage reactionTypeId={reactionTypeId} size='15px' />
          }

          {
            !!title && !isCompact && !labelNumber &&
            <Responsive min={BREAKPOINT_SMALL}>
              <Text color='inherit' size='small' weight={weight} className={_s.ml10}>
                {labelNumber ? labelNumber : title}
              </Text>
            </Responsive>            
          }
          {
            !!labelNumber &&
            <Text color='inherit' size='small' weight={weight} className={_s.ml10}>
              {labelNumber}
            </Text>
          }
        </Button>
      </div>
    )
  }

}

StatusActionBarItem.propTypes = {
  title: PropTypes.string.isRequired,
  altTitle: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  onOpenReactions: PropTypes.func,
  onCancelReactions: PropTypes.func,
  icon: PropTypes.string.isRequired,
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  isCompact: PropTypes.bool,
  isLike: PropTypes.bool,
  labelNumber: PropTypes.string,
  reactionTypeId: PropTypes.string,
  to: PropTypes.string,
  statusId: PropTypes.string,
  buttonRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.node,
  ]),
}

export default StatusActionBarItem