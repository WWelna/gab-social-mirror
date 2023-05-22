import React from 'react'
import PropTypes from 'prop-types'
import { CX } from '../constants'
import Button from './button'
import Icon from './icon'
import Image from './image'
import Text from './text'
import Counter from './counter'

class ListItem extends React.PureComponent {

  handleOnClick = (e) => {
    if (!!this.props.onClick) {
      this.props.onClick(e)
    }
  }

  render() {
    const {
      title,
      isLast,
      to,
      href,
      onClick,
      actionIcon,
      size,
      icon,
      image,
      hideArrow,
      isHidden,
      subtitle,
      isActive,
      openInNewTab,
      count,
    } = this.props

    if (!title) {
      return (
        <div className={[_s.d, _s.bgSecondary, _s.w100PC, _s.h4PX].join(' ')} />
      )
    }

    if (isHidden) {
      return (
        <React.Fragment>
          {title}
        </React.Fragment>
      )
    }

    const small = size === 'small'
    const large = size === 'large'

    const textSize = small ? 'normal' : large ? 'large' : 'normal'
    const iconSize = large ? '14px' : '10px'
    const imageSize = large ? '22px' : '18px'
    const showActive = isActive !== undefined
    const hasCount = !isNaN(count) && count > 0

    const containerClasses = CX({
      d: 1,
      cursorPointer: 1,
      noUnderline: 1,
      px15: !small,
      py15: !small,
      px10: small,
      py10: small,
      flexRow: 1,
      aiCenter: 1,
      w100PC: 1,
      outlineNone: 1,
      bgTransparent: 1,
      bgSubtle_onHover: 1,
      borderColorSecondary: !isLast,
      borderBottom1PX: !isLast,
    })

    const iconClasses = CX({
      mr10: !large,
      mr15: large,
      cPrimary: !!icon,
      circle: !icon && !!image,
    })

    const textContainerClasses = CX({
      d: 1,
      pr5: 1,
      w100PC: hideArrow,
      maxW100PC42PX: !hideArrow || showActive,
    })

    const arrowClasses = CX({
      mlAuto: !showActive && !hasCount,
      ml10: showActive,
      cSecondary: 1,
      flexShrink1: 1,
    })

    const countContainerClasses = CX({
      mlAuto: 1,
      ml10: 1,
      mr10: 1,
      cSecondary: 1,
      flexShrink1: 1,
    })

    const click = !!onClick ? this.handleOnClick : undefined

    return (
      <Button
        to={to}
        href={href}
        onClick={click}
        className={containerClasses}
        target={openInNewTab ? '_blank' : undefined}
        noClasses
      >

        {
          !!image &&
          <Image
            src={image}
            height={imageSize}
            width={imageSize}
            className={iconClasses}
          />
        }

        {
          !!icon &&
          <Icon
            id={icon}
            size={iconSize}
            className={iconClasses}
          />
        }

        <div className={textContainerClasses}>
          <Text color='primary' weight={!!subtitle ? 'bold' : 'normal'} size={textSize} className={[_s.overflowHidden, _s.flexNormal, _s.textOverflowEllipsis].join(' ')}>
            {title}
          </Text>

          {
            !!subtitle &&
            <Text color='primary' size='small' className={[_s.overflowHidden, _s.flexNormal, _s.mt5].join(' ')}>
              {subtitle}
            </Text>
          }
        </div>

        {
          !!showActive &&
          <input
            type='radio'
            checked={isActive}
            className={[_s.mlAuto, _s.flexShrink1, _s.mt0].join(' ')}
            onChange={click}
          />
        }

        {
          hasCount && (
            <div className={countContainerClasses}>
              <Counter count={count} max={99}/>
            </div>
          )
        }

        {
          !hideArrow &&
          <Icon
            id={!!actionIcon ? actionIcon : 'angle-right'}
            size='10px'
            className={arrowClasses}
          />
        }
      </Button>
    )
  }

}

ListItem.propTypes = {
  icon: PropTypes.string,
  image: PropTypes.string,
  isLast: PropTypes.bool,
  isHidden: PropTypes.bool,
  to: PropTypes.string,
  href: PropTypes.string,
  title: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  subtitle: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  isActive: PropTypes.bool,
  actionIcon: PropTypes.bool,
  onClick: PropTypes.func,
  count: PropTypes.number,
  size: PropTypes.oneOf([
    'small',
    'normal',
    'large',
  ]),
  hideArrow: PropTypes.bool,
  openInNewTab: PropTypes.bool,
}

export default ListItem
