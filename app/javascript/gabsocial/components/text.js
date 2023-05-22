import React from 'react'
import PropTypes from 'prop-types'
import { CX } from '../constants'

// Define colors for enumeration for Text component `color` prop
const COLORS = {
  alt: 'alt',
  primary: 'primary',
  secondary: 'secondary',
  tertiary: 'tertiary',
  brand: 'brand',
  error: 'error',
  white: 'white',
  inherit: 'inherit',
}

// Define sizes for enumeration for Text component `size` prop
const SIZES = {
  extraSmall: 'extraSmall',
  small: 'small',
  normal: 'normal',
  medium: 'medium',
  large: 'large',
  extraLarge: 'extraLarge',
  extraExtraLarge: 'extraExtraLarge',
}

// Define weights for enumeration for Text component `weight` prop
const WEIGHTS = {
  normal: 'normal',
  medium: 'medium',
  bold: 'bold',
  extraBold: 'extraBold',
}

// Define alignments for enumeration for Text component `align` prop
const ALIGNMENTS = {
  center: 'center',
  left: 'left',
  right: 'right',
}

/**
 * Renders a text component
 * @param {string} [props.align='left] - the alignment of the text
 * @param {bool} [props.isBadge] - to style the text as a badge
 * @param {string} [props.className] - add custom className
 * @param {string} [props.color='primary'] color of the text
 * @param {bool} [props.hasUnderline] - if the text is underlined
 * @param {string} [props.htmlFor] - define the `for` attribute on the tag
 * @param {string} [props.size='normal'] size of the text
 * @param {string} [props.tagName='span'] tagName of the text element
 * @param {string} [props.weight='normal'] weight of the text
 * @param {string} [props.fullWeight='bold'] when toggling between two weights, supply the bigger weight to prevent the width of the element from changing slightly
 */
class Text extends React.PureComponent {

  render() {
    const {
      tagName,
      className,
      children,
      color,
      size,
      weight,
      align,
      htmlFor,
      isBadge,
      hasUnderline,
      title,
      fullWeight,
    } = this.props

    // Style the component according to props
    const classes = CX(className, {
      d: 1,
      text: 1,

      radiusSmall: isBadge,
      lineHeight15: isBadge,
      px5: isBadge,

      cAlt: color === COLORS.alt,
      cPrimary: color === COLORS.primary,
      cSecondary: color === COLORS.secondary,
      cTertiary: color === COLORS.tertiary,
      cBrand: color === COLORS.brand,
      cWhite: color === COLORS.white,
      cError: color === COLORS.error,
      inherit: color === COLORS.inherit,

      fs24PX: size === SIZES.extraExtraLarge,
      fs19PX: size === SIZES.extraLarge,
      fs16PX: size === SIZES.large,
      fs15PX: size === SIZES.medium,
      fs14PX: size === SIZES.normal,
      fs13PX: size === SIZES.small,
      fs12PX: size === SIZES.extraSmall,

      fw400: weight === WEIGHTS.normal,
      fw500: weight === WEIGHTS.medium,
      fw600: weight === WEIGHTS.bold,
      fw800: weight === WEIGHTS.extraBold,

      fullW400: fullWeight === WEIGHTS.normal,
      fullW500: fullWeight === WEIGHTS.medium,
      fullW600: fullWeight === WEIGHTS.bold,
      fullW800: fullWeight === WEIGHTS.extraBold,

      textAlignLeft: align === ALIGNMENTS.left,
      textAlignRight: align === ALIGNMENTS.right,
      textAlignCenter: align === ALIGNMENTS.center,

      underline: hasUnderline,
    })

    return React.createElement(
      tagName,
      {
        title,
        htmlFor,
        className: classes,
        'data-text': (typeof children === 'string' ? children : undefined),
      },
      children,
    )
  }

}

Text.propTypes = {
  align: PropTypes.oneOf(Object.keys(ALIGNMENTS)),
  isBadge: PropTypes.bool,
  children: PropTypes.any,
  className: PropTypes.string,
  color: PropTypes.oneOf(Object.keys(COLORS)),
  hasUnderline: PropTypes.bool,
  htmlFor: PropTypes.string,
  size: PropTypes.oneOf(Object.keys(SIZES)),
  tagName: PropTypes.string,
  title: PropTypes.string,
  weight: PropTypes.oneOf(Object.keys(WEIGHTS)),
  fullWeight: PropTypes.oneOf(Object.keys(WEIGHTS)),
}

Text.defaultProps = {
  tagName: 'span',
  align: ALIGNMENTS.left,
  color: COLORS.primary,
  size: SIZES.normal,
  weight: WEIGHTS.normal,
}

export default Text