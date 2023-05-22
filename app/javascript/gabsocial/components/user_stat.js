import React from 'react'
import PropTypes from 'prop-types'
import { CX } from '../constants'
import Text from './text'
import Button from './button'
import DotTextSeperator from './dot_text_seperator'

/**
 * Renders a user stat component
 * @param {string} props.title - bottom title
 * @param {string} props.to - location to go to on click
 * * @param {string} props.onClick - action on click
 * @param {string} props.value - top value
 */
class UserStat extends React.PureComponent {

  state = {
    hovering: false,
  }

  handleOnMouseEnter = () => {
    this.setState({ hovering: true })
  }

  handleOnMouseLeave = () => {
    this.setState({ hovering: false })
  }

  render() {
    const {
      to,
      title,
      value,
      numvalue,
      isCentered,
      isInline,
      isLast,
      onClick,
    } = this.props
    const { hovering } = this.state

    const align = isCentered ? 'center' : 'left'
    const titleSize = isInline ? 'normal' : 'extraLarge'
    const titleColor = isInline ? 'primary' : 'brand'
    const titleWeight = isInline ? 'extraBold' : 'bold'

    const subtitleSize = isInline ? 'normal' : 'small'
    
    const containerClasses = CX({
      d: 1,
      cursorPointer: 1,
      noUnderline: 1,
      bgTransparent: 1,
      outlineNone: 1,
      flexNormal: isCentered,
      flexGrow1: !isCentered && !isInline,
      flexRow: isInline,
      aiCenter: isInline,
      pr15: !isCentered && !isInline,
      pr10: !isCentered && isInline,
    })
    const subtitleClasses = CX({
      pr5: isInline,
      pl5: isInline,
    })

    return (
      <Button
        noClasses
        to={to}
        onClick={onClick}
        title={`${Number(numvalue || value).toLocaleString()} ${title}`}
        className={containerClasses}
        onMouseEnter={this.handleOnMouseEnter}
        onMouseLeave={this.handleOnMouseLeave}
      >
        <Text size={titleSize} weight={titleWeight} color={titleColor} align={align}>
          {value}
        </Text>
        <Text size={subtitleSize} weight='medium' color='secondary' hasUnderline={hovering} align={align} className={subtitleClasses}>
          {title}
        </Text>
        { !isLast && isInline && <DotTextSeperator /> }
      </Button>
    )
  }

}

UserStat.propTypes = {
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
  ]).isRequired,
  to: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.object,
  ]).isRequired,
  isCentered: PropTypes.bool,
  isInline: PropTypes.bool,
  isLast: PropTypes.bool,
  onClick: PropTypes.func,
}

export default UserStat
