import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { CX } from '../constants'
import Button from './button'
import Text from './text'
import Image from './image'
import Icon from './icon'

class PillItem extends React.PureComponent {
  render() {
    const {
      prependIcon,
      appendIcon,
      prependImage,
      title,
      to,
      onClick,
      location,
      isActive,
      isHidden,
      disabled
    } = this.props

    if (isHidden) return null

    // Combine state, props, location to make absolutely
    // sure of active status.
    const active = typeof isActive === 'boolean' ? isActive : (to === location.pathname && !location.search)

    const containerClasses = CX({
      d: 1,
      noUnderline: 1,
      text: 1,
      aiCenter: 1,
      jcCenter: 1,
      py7: 1,
      outlineNone: 1,
      cursorPointer: 1,
      circle: 1,
      bgSecondary: !active,
      bgSecondaryDark_onHover: !active,
      bgBrand: active,
      mr5: 1,
      mb5: 1,
    })

    const textParentClasses = CX({
      d: 1,
      h100PC: 1,
      aiCenter: 1,
      jcCenter: 1,
      py2: 1,
      px5: 1,
      flexRow: 1,
    })

    const textOptions = {
      size: 'normal',
      color: active ? 'white' : 'secondary',
      weight: active ? 'bold' : 'medium',
      className: _s.px10,
      align: 'center',
      fullWeight: 'bold',
    }

    return (
      <Button
        onClick={onClick}
        className={containerClasses}
        to={to || undefined}
        noClasses
        isDisabled={disabled}
      >
        <span className={textParentClasses}>
          { !!prependImage && <Image src={prependImage} width='26px' height='26px' className={[_s.circle, _s.ml10].join(' ')} /> }
          { !!prependIcon && <Icon id={prependIcon} size='10px' /> }
          <Text {...textOptions}>
            {title}
          </Text>
          { !!appendIcon && <Icon id={appendIcon} size='10px' className={[_s.circle, _s.pt2, _s.ml5, _s.mr10, _s.cSecondary].join(' ')} /> }
        </span>
      </Button>
    )
  }
}

PillItem.propTypes = {
  appendIcon: PropTypes.string,
  prependIcon: PropTypes.string,
  prependImage: PropTypes.string,
  isActive: PropTypes.bool,
  onClick: PropTypes.func,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  to: PropTypes.string,
  isHidden: PropTypes.bool,
  disabled: PropTypes.bool,
}

export default withRouter(PillItem)
