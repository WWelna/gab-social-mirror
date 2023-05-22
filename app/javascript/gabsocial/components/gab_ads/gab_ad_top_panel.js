import React from 'react'
import { GAB_AD_PLACEMENTS } from '../../constants'
import GabAdPanelTopListItem from './gab_ad_panel_top_list_item'
import GabAdRoot from './gab_ad_root'
import GabAdBase from './gab_ad_base'
import PanelLayout from '../panel/panel_layout'

const GabAdTopPanel = () => {
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
              headerButtonHref="https://grow.gab.com"
              headerButtonTarget="_blank"
              headerTitleSize="h5"
            >
              <div className={[_s.d].join(' ')}>
                <GabAdPanelTopListItem ad={ad} />
              </div>
            </PanelLayout>
          )
        }}
      </GabAdBase>
    </GabAdRoot>
  )
}

export default GabAdTopPanel
