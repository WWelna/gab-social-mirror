import React from 'react'
import Image from '../image'
import Text from '../text'

const GabAdPanelTopListItem = ({ad}) => {
  if (!ad || !ad.top_image) return null
  return (
    <div className={[_s.d].join(' ')}>
      <div className={[_s.d, _s.flexRow, _s.bgSubtle_onHover, _s.minH340PX].join(' ')}>
        <div className={[_s.d, _s.outlineNone, _s.cursorPointer, _s.bgTransparent, _s.w100PC].join(' ')}>
          <Image
            height='100%'
            width='100%'
            src={ad.top_image}
            className={[_s.posAbs, _s.top0, _s.right0, _s.left0, _s.bottom0].join(' ')}
          />
        </div>
      </div>
    </div>
  )
}

export default GabAdPanelTopListItem
