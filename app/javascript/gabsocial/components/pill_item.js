import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { CX } from '../constants'
import Button from './button'
import Text from './text'
import Image from './image'
import Icon from './icon'

class PillItem extends React.PureComponent {

  state = {
    isCurrent: false,
  }

  componentDidMount() {
    this.checkIfCurrent()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location !== this.props.location) {
      this.checkIfCurrent()
    }
  }

  checkIfCurrent() {
    // If user navigates to different page, ensure tab bar item
    // with this.props.to that is on location is set to active.
    const isCurrent = this.props.to === this.props.location.pathname && !this.props.location.search

    if (this.state.isCurrent !== isCurrent) {
      this.setState({ isCurrent })
    }
  }

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
    } = this.props
    const { isCurrent } = this.state

    // Combine state, props, location to make absolutely
    // sure of active status.
    const active = isActive || (to === location.pathname && !location.search) || isCurrent

    const containerClasses = CX({
      d: 1,
      noUnderline: 1,
      text: 1,
      aiCenter: 1,
      jcCenter: 1,
      py5: 1,
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
      size: 'small',
      color: active ? 'white' : 'secondary',
      weight: active ? 'bold' : 'medium',
      className: _s.px10,
    }

    return (
      <Button
        onClick={onClick}
        className={containerClasses}
        to={to || undefined}
        noClasses
      >
        <span className={textParentClasses}>
          { !!prependImage && <Image src={prependImage} width='24px' height='24px' className={_s.circle} /> }
          { !!prependIcon && <Icon id={prependIcon} size='10px' /> }
          <Text {...textOptions}>
            {title}
          </Text>
          { !!appendIcon && <Icon id={appendIcon} size='10px' className={[_s.circle, _s.mr5].join(' ')} /> }
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
  title: PropTypes.string,
  to: PropTypes.string,
}

export default withRouter(PillItem)