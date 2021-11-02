import React from 'react'
import { GAB_AD_PLACEMENTS } from '../../constants'
import GabAdBase from './gab_ad_base'
import Image from '../image'
import Text from '../text'

const GabAdPanelListItem = () => {
  return (
    <GabAdBase placement={GAB_AD_PLACEMENTS.panel}>
      {(ad) => (
        <div className={[_s.d, _s.px5, _s.pb5].join(' ')}>
          <div className={[_s.d, _s.flexRow, _s.bgSubtle_onHover, _s.radiusSmall, _s.px10, _s.py10].join(' ')}>
            <div className={[_s.d, _s.outlineNone, _s.cursorPointer, _s.bgTransparent, _s.h84PX, _s.w84PX].join(' ')}>
              <Image
                height='100%'
                width='100%'
                src={ad.image}
                className={[_s.posAbs, _s.top0, _s.right0, _s.left0, _s.bottom0, _s.radiusSmall, _s.overflowHidden].join(' ')}
              />
            </div>
            <div className={[_s.d, _s.ml10, _s.pr10, _s.flexNormal].join(' ')}>
              <Text
                size='large'
                color='primary'
                weight='medium'
                className={_s.pb2}
              >
                {ad.title}
              </Text>
              <Text color='secondary'>{ad.subtitle}</Text>
            </div>
          </div>
        </div>
      )}
    </GabAdBase>
  )
}

export default GabAdPanelListItem