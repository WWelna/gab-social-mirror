import React from 'react'
import { GAB_AD_PLACEMENTS } from '../../constants'
import GabAdBase from './gab_ad_base'
import GabAdRoot from './gab_ad_root'
import PanelLayout from '../panel/panel_layout'
import Text from '../text'
import Image from '../image'

const GabAdBanner = () => {
  return (
    <GabAdRoot>
      <PanelLayout
        noPadding
        title='Sponsored'
        headerButtonTitle='?'
        headerButtonTooltip="Don't want to see Gab Ads? Upgrade to GabPRO."
      >
        <GabAdBase placement={GAB_AD_PLACEMENTS.banner}>
          {(ad) => (
            <div className={[_s.d].join(' ')}>
              <div className={[_s.dInline, _s.mb10, _s.px15].join(' ')}>
                <Text weight='medium'>{ad.title}&nbsp;</Text>
                <Text color='secondary'>{ad.subtitle}</Text>
              </div>
              <div className={[_s.d, _s.w100PC, _s.outlineNone, _s.cursorPointer, _s.bgTransparent, _s.h122PX].join(' ')}>
                <Image
                  height='100%'
                  width='100%'
                  src={ad.image}
                  className={[_s.posAbs, _s.top0, _s.right0, _s.left0, _s.bottom0, _s.overflowHidden].join(' ')}
                />
              </div>
            </div>
          )}
        </GabAdBase>
      </PanelLayout>
    </GabAdRoot>
  )
}

export default GabAdBanner

