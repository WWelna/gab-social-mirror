import React from 'react'
import { GAB_AD_PLACEMENTS, DEFAULT_REL } from '../../constants'
import GabAdPanelBottomListItem from './gab_ad_panel_bottom_list_item'
import GabAdRoot from './gab_ad_root'
import GabAdBase from './gab_ad_base'
import PanelLayout from '../panel/panel_layout'
import { FormattedMessage } from 'react-intl'
import Text from '../text'

const GabAdBottomPanel = () => {
  return (
    <GabAdRoot key='gab-ad-bottom-panel' placement={GAB_AD_PLACEMENTS.buyout}>
      <GabAdBase placement={GAB_AD_PLACEMENTS.buyout} bottomPanelUrl="?b=1">
        {(ad) => {
          if (!ad) return null
          return (
            <PanelLayout noPadding>
              <div className={[_s.d].join(' ')}>
                <GabAdPanelBottomListItem ad={ad} />
              </div>
            </PanelLayout>
          )
        }}
      </GabAdBase>
      <div key='link-ad-footer' className={[_s.d, _s.stickymb680].join(' ')}>
        <Text size='small' color='tertiary' tagName='p' className={_s.mt10}>
          <FormattedMessage
              id='adfooter'
              defaultMessage="Want to advertise on Gab? {grow}"
              values={{
                grow: (
                  <a href='https://grow.gab.com' className={[_s.displayInlineBlock, _s.inherit].join(' ')} rel={DEFAULT_REL} target='_blank'>
                    grow.gab
                  </a>
                )
              }}
          />
        </Text>
      </div>
    </GabAdRoot>
  )
}

export default GabAdBottomPanel
