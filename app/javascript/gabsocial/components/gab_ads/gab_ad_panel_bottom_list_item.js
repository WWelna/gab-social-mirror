import React from 'react'
import Image from '../image'
import Text from '../text'

const GabAdPanelBottomListItem = ({ad}) => {
  if (!ad || !ad.image) return null
  return (
    <div className={[_s.d].join(' ')}>
      <div className={[_s.d, _s.flexRow, _s.bgSubtle_onHover, _s.minH680PX].join(' ')}>
        <div className={[_s.d, _s.outlineNone, _s.cursorPointer, _s.bgTransparent, _s.w100PC].join(' ')}>
          <Image
            height='100%'
            width='100%'
            src={ad.image}
            className={[_s.posAbs, _s.top0, _s.right0, _s.left0, _s.bottom0].join(' ')}
          />
        </div>
      </div>
    </div>
  )
}

export default GabAdPanelBottomListItem
