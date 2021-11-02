import React from 'react'
import PropTypes from 'prop-types'
import Avatar from './avatar'
import Text from './text'
import { CX } from '../constants'

/**
 * Renders a inline group of avatars
 * @version 1.0.0
 */
const AvatarGroup = ({ accounts, avatarCount, size, maxVisible, showText }) => {
  if (!accounts) {
    return null
  }

  const count = avatarCount || accounts.size
  const textSize =
    size < 50 ? 'small' : size >= 50 && size < 80 ? 'normal' : 'large'

  return (
    // eslint-disable-next-line array-element-newline
    <div className={[_s.d, _s.flexRow, _s.aiCenter].join(' ')}>
      {accounts.slice(0, maxVisible).map((account, i) => {
        const containerClasses = CX({
          d: 1,
          mlNeg25PX: i !== 0 && size >= 40,
          mlNeg15PX: i !== 0 && size < 40,
          circle: 1,
          border2PX: 1,
          borderColorSecondary: 1,
        })
        return (
          <div
            key={`grouped-avatar-${i}`}
            className={containerClasses}
          >
            <Avatar
              account={account}
              size={size}
            />
          </div>
        )
      })}
      {count > maxVisible && showText && (
        <Text
          text={`+ ${count - maxVisible}`}
          className={[_s.ml10].join(' ')}
          color='secondary'
          size={textSize}
        />
      )}
    </div>
  )
}

AvatarGroup.defaultProps = {
  maxVisible: 3,
  size: 40,
}

AvatarGroup.propTypes = {
  accounts: PropTypes.array,
  avatarCount: PropTypes.number,
  maxVisible: PropTypes.number,
  size: PropTypes.number,
  showText: PropTypes.bool,
}

export default AvatarGroup
