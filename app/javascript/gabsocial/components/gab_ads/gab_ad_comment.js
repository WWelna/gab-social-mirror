import React from 'react'
import PropTypes from 'prop-types'
import { GAB_AD_PLACEMENTS } from '../../constants'
import GabAdRoot from './gab_ad_root'
import GabAdBase from './gab_ad_base'
import Button from '../button'
import Text from '../text'
import Image from '../image'
import DotTextSeperator from '../dot_text_seperator'

const GabAdComment = () => {

  return (
    <GabAdRoot>
      <GabAdBase placement={GAB_AD_PLACEMENTS.status}>
        {(ad) => (
          <div className={[_s.d, _s.px15, _s.pt5].join(' ')} data-comment='gab-ad-comment'>
            <div className={[_s.d, _s.mb5].join(' ')}>

              <div className={[_s.d, _s.flexRow].join(' ')}>
                <div className={[_s.d, _s.mr10, _s.pt5].join(' ')}>
                  <Image
                    src={ad.user_image}
                    className={_s.circle}
                    height='30px'
                    width='30px'
                  />
                </div>

                <div className={[_s.d, _s.flexShrink1, _s.maxW380PX].join(' ')}>
                  <div className={[_s.d, _s.px10, _s.pt5, _s.pb10, _s.radiusSmall, _s.bgSubtle].join(' ')}>
                    {/* GAB AD HEADER START */}
                    <div className={[_s.d, _s.aiStart, _s.py2, _s.maxW100PC, _s.flexGrow1].join(' ')}>
                      <div className={[_s.d, _s.flexRow, _s.flexWrap, _s.overflowHidden, _s.w100PC, _s.maxW100PC, _s.aiCenter].join(' ')}>
                        <div className={[_s.d, _s.flexRow, _s.aiStart, _s.noUnderline].join(' ')}>
                          <Text color='primary' weight='bold'>{ad.user_name}</Text>
                        </div>

                        <DotTextSeperator />
                        <Button
                          isText
                          underlineOnHover
                          backgroundColor='none'
                          color='tertiary'
                          className={_s.ml5}
                        >
                          <Text size='extraSmall' color='inherit'>
                            Sponsored
                          </Text>
                        </Button>

                        <Button
                          isText
                          backgroundColor='none'
                          color='secondary'
                          iconSize='20px'
                          tooltip="Don't want to see Gab Ads? Upgrade to GabPRO."
                          className={[_s.mlAuto].join(' ')}
                        >
                          <Text color='inherit'>?</Text>
                        </Button>

                      </div>
                    </div>
                    {/* GAB AD HEADER END */}

                    {/* GAB AD COMMENT CONTENT START */}
                    <div className={_s.d}>
                      <div
                        tabIndex='0'
                        className={[_s.statusContent, _s.outlineNone, _s.mt5, _s.mb5, _s.textAlignLeft].join(' ')}
                        style={{ direction: 'ltr' }}
                        dangerouslySetInnerHTML={{ '__html': ad.subtitle }}
                        lang='en'
                      />
                    </div>
                    {/* GAB AD COMMENT CONTENT END */}

                    <div className={[_s.d, _s.mt5].join(' ')}>
                      {/* GAB AD COMMENT MEDIA START */}
                      <div className={[_s.d].join(' ')}>
                        <div className={[_s.d, _s.w100PC, _s.outlineNone, _s.cursorPointer, _s.bgSubtle, _s.radiusSmall, _s.overflowHidden, _s.borderColorSecondary, _s.border1PX].join(' ')}>
                          <Image
                            width='100%'
                            src={ad.image}
                          />
                          <div className={[_s.d, _s.px15, _s.py10].join(' ')}>
                            <Text size='large' color='secondary' className={_s.py5}>
                              {ad.base_url}
                            </Text>
                            <div className={[_s.d, _s.flexRow, _s.w100PC, _s.mb10].join(' ')}>
                              <div className={[_s.d, _s.flexNormal].join(' ')}>
                                <Text size='large' color='primary' weight='bold' className={[_s.py5].join(' ')}>
                                  {ad.title}
                                </Text>
                              </div>
                              <div className={[_s.d, _s.mlAuto, _s.pl15].join(' ')}>
                                <Button
                                  radiusSmall
                                  color='primary'
                                  backgroundColor='tertiary'
                                >
                                  <Text color='inherit' weight='medium'>
                                    {`${ad.action_title || 'Learn more'}`}
                                  </Text>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* GAB AD COMMENT MEDIA END */}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}
      </GabAdBase>
    </GabAdRoot>
  )
}

export default GabAdComment