import React from 'react'
import { GAB_AD_PLACEMENTS } from '../../constants'
import GabAdPanelListItem from './gab_ad_panel_list_item'
import GabAdRoot from './gab_ad_root'
import GabAdBase from './gab_ad_base'
import PanelLayout from '../panel/panel_layout'

const GabAdPanel = () => {
  return (
    <GabAdRoot key='gab-ad-panel' placement={GAB_AD_PLACEMENTS.buyout}>
      <GabAdBase placement={GAB_AD_PLACEMENTS.buyout}>
        {(ad) => {
          if (!ad) return null
          return (
            <PanelLayout
              noPadding
              title='Sponsored'
              headerButtonTitle='Want to Advertise?'
              headerButtonTooltip="Visit grow.gab.com to create an ads account and start growing today!"
            >
              <div className={[_s.d].join(' ')}>
                <GabAdPanelListItem ad={ad} />
              </div>
            </PanelLayout>
          )
        }}
      </GabAdBase>
    </GabAdRoot>
  )
}

export default GabAdPanel
