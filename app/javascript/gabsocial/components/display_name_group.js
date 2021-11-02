import React from 'react'
import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'
import DisplayName from './display_name'

const DisplayNameGroup = ({
  accounts,
  maxVisible,
}) => {
  if (!accounts) return null

  const newMaxVisible = maxVisible || accounts.size

  return (
    <div className={[_s.d, _s.w100PC, _s.displayInlineBlock, _s.overflowHidden, _s.textOverflowEllipsis2, _s.whiteSpaceNoWrap].join(' ')}>
      {accounts.slice(0, newMaxVisible).map((account, i) => {
        const isLast = i === newMaxVisible - 1
        return (
          <NavLink
            key={`display-name-group-${i}`}
            className={[_s.displayInlineBlock, _s.noUnderline].join(' ')}
            to={`/${account.get('acct')}`}
            title={account.get('acct')}
          >
            <span className={[_s.text, _s.fw600, _s.cPrimary, _s.fs15PX, _s.mr2].join(' ')}>
              <DisplayName
                account={account}
                noDisplayName
                isInline
                isMultiline
                isGrouped
              />
              {`${ !isLast ? ',' : '' }`}
            </span>
          </NavLink>
        )
      })}
    </div>
  )
}

DisplayNameGroup.propTypes = {
  accounts: PropTypes.array,
  maxVisible: PropTypes.number,
}

export default DisplayNameGroup