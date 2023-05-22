import React from 'react'
import PropTypes from 'prop-types'

function Counter({ count, max }) {
  if (isNaN(count) || count <= 0) return null

  let title = count
  if (max !== undefined && count >= max) {
    title = `${max}+`
  }

  return (
    <div className={[_s.d, _s.flexRow].join(' ')}>
      <span
        className={[
          _s.text,
          _s.bgRed,
          _s.cWhite,
          _s.circle,
          _s.py2,
          _s.px5,
          _s.minW14PX,
          _s.textAlignCenter,
        ].join(' ')}
        style={{ fontSize: '12px' }}
      >
        {title}
      </span>
    </div>
  )
}

Counter.propTypes = {
  count: PropTypes.number,
  max: PropTypes.number,
}

export default Counter
