import React from 'react'
import Text from './text'

function GifBadge() {
  return (
    <div className={[
        _s.d,
        _s.posAbs,
        _s.z3,
        _s.radiusSmall,
        _s.bgBlackOpaque,
        _s.px5,
        _s.py5,
        _s.mr10,
        _s.mb10,
        _s.bottom0,
        _s.right0
      ].join(' ')}
    >
      <Text size="small" color="white" weight="medium" className={[_s.ml2, _s.mr2].join(' ')}>
        GIF
      </Text>
    </div>
  )
}

export default GifBadge