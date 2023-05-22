import React from 'react'
import PropTypes from 'prop-types'
import { CX } from '../constants'

const badgeDefaultClasses = CX({
  displayInlineBlock: 1,
  text: 1,
  textAlignCenter: 1,
  lineHeight125: 1,
  px5: 1,
  py2: 1,
  ml2: 1,
  mr2: 1,
  radiusSmall: 1
})

const Badge = ({ children, text, mergeClasses }) =>
  <span
    className={CX(
      badgeDefaultClasses,
      mergeClasses || { bgSecondary: 1, cSecondary: 1 }
    )}
  >
    {children || text}
  </span>

Badge.propTypes = {
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  mergeClasses: PropTypes.oneOfType([PropTypes.object, PropTypes.array])
}

export default Badge
