import React from 'react'
import { GAB_AD_PLACEMENTS } from '../../constants'
import GabAdPanelListItem from './gab_ad_panel_list_item'
import GabAdRoot from './gab_ad_root'
import PanelLayout from '../panel/panel_layout'

const GabAdPanel = () => {
  return (
    <GabAdRoot placement={GAB_AD_PLACEMENTS.panel}>
      <PanelLayout
        noPadding
        title='Sponsored'
        headerButtonTitle='?'
        headerButtonTooltip="Don't want to see Gab Ads? Upgrade to GabPRO."
      >
        <div className={[_s.d].join(' ')}>
          <GabAdPanelListItem />
        </div>
      </PanelLayout>
    </GabAdRoot>
  )
}

export default GabAdPanel