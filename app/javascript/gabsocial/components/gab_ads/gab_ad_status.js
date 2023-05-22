import React from 'react'
import PropTypes from 'prop-types'
import {
  CX,
  GAB_AD_PLACEMENTS,
} from '../../constants'
import GabAdRoot from './gab_ad_root'
import GabAdBase from './gab_ad_base'
import ResponsiveClassesComponent from '../../features/ui/util/responsive_classes_component'
import Image from '../image'
import Button from '../button'
import Text from '../text'
import Icon from '../icon'
import Video from '../video'
import DotTextSeperator from '../dot_text_seperator'

const LowerWrapper = ({
  ad,
  className,
  children,
}) => {

  if (!ad.video) {
    return (
      <div className={className}>
        {children}
      </div>
    )
  }

  const classes = CX(className, {
    bgTransparent: 1,
    cursorPointer: 1,
    outlineNone: 1,
    noUnderline: 1,
  })
  return (
    <Button
      noClasses
      className={classes}
      href={ad.url}
      target='_blank'
      rel='noopener'
    >
      {children}
    </Button>
  )
}

const GabAdStatus = ({ pageKey, position, groupCategory }) => {

  return (
    <GabAdRoot>
      <GabAdBase placement={GAB_AD_PLACEMENTS.status} pageKey={pageKey} position={position} groupCategory={groupCategory}>
        {(ad) => (
          <div className={_s.pb15}>
            <ResponsiveClassesComponent
              classNames={[_s.d, _s.radiusSmall, _s.bgPrimary, _s.boxShadowBlock].join(' ')}
              classNamesXS={[_s.d, _s.bgPrimary, _s.boxShadowBlock, _s.borderTop1PX, _s.borderColorSecondary].join(' ')}
            >
              <div
                className={[_s.d, _s.outlineNone].join(' ')}
                tabIndex={0}
                data-featured='true'
                aria-label={`Sponsored: ${ad.title} - ${ad.subtitle}`}
                role='button'
              >
                <div className={[_s.d, _s.overflowHidden].join(' ')}>

                  <div>
                    {/* status header start */}
                    <div className={[_s.d, _s.px15, _s.py10].join(' ')}>
                      <div className={[_s.d, _s.flexRow, _s.mt5].join(' ')}>

                        <Image
                          src={ad.user_image}
                          className={[_s.mr10, _s.circle].join(' ')}
                          height={'46px'}
                          width={'46px'}
                        />

                        <div className={[_s.d, _s.aiStart, _s.flex1, _s.overflowHidden, _s.mt5].join(' ')}>

                          <div className={[_s.d, _s.flexRow, _s.w100PC, _s.aiStart, _s.overflowHidden].join(' ')}>
                            <div className={[_s.d, _s.flexRow, _s.aiStart, _s.noUnderline, _s.flex1, _s.maxW100PC30PX].join(' ')}>
                              <div className={[_s.d, _s.w100PC, _s.overflowHidden, _s.underline_onHover].join(' ')}>
                                <Text size='medium' color='primary' weight='medium'>{ad.user_name}</Text>
                              </div>
                            </div>

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

                          <div className={[_s.d, _s.flexRow, _s.aiCenter, _s.lineHeight15].join(' ')}>
                            <Text size='small' color='secondary'>
                              Sponsored
                            </Text>

                            <DotTextSeperator />

                            <span className={[_s.d, _s.displayInline, _s.ml5].join(' ')}>
                              <Icon id='globe' size='12px' className={[_s.d, _s.cSecondary].join(' ')} />
                            </span>

                          </div>
                        </div>
                      </div>
                    </div>
                    {/* status header end */}

                    <div className={_s.d}>
                      <div
                        tabIndex='0'
                        className={[_s.statusContent, _s.outlineNone, _s.px15, _s.mb15, _s.textAlignLeft].join(' ')}
                        style={{ direction: 'ltr' }}
                        dangerouslySetInnerHTML={{ '__html': ad.subtitle }}
                        lang='en'
                      />
                    </div>

                    {/* status media start */}
                    <div className={[_s.d, _s.px15, _s.mb10].join(' ')}>
                      <div className={[_s.d, _s.w100PC, _s.outlineNone, _s.cursorPointer, _s.bgSubtle, _s.radiusSmall, _s.overflowHidden, _s.borderColorSecondary, _s.border1PX].join(' ')}>
                        {
                          !ad.video &&
                          <Image width='100%' src={ad.image} />
                        }
                        {
                          !!ad.video &&
                          <div className={[_s.d, _s.w100PC, _s.pt5625PC].join(' ')}>
                            <div className={[_s.d, _s.objectFitCover, _s.posAbs, _s.w100PC, _s.h100PC, _s.top0, _s.right0, _s.bottom0, _s.left0].join(' ')}>
                              <Video
                                preview={ad.image}
                                src={ad.video}
                                sourceMp4={ad.video}
                                fileContentType={ad.video_type || "video/mp4"}
                                width='100%'
                                height='100%'
                                className={[_s.w100PC, _s.h100PC, _s.mt0].join(' ')}
                                autoplay='true'
                                muted='true'
                              />
                            </div>
                          </div>
                        }
                        <LowerWrapper
                          ad={ad}
                          className={[_s.d, _s.px15, _s.py10].join(' ')}
                        >
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
                        </LowerWrapper>
                      </div>
                    </div>
                    {/* status media end */}

                  </div>
                </div>
              </div>
            </ResponsiveClassesComponent>
          </div>
        )}
      </GabAdBase>
    </GabAdRoot>
  )
}

GabAdStatus.propTypes = {
  pageKey: PropTypes.string,
  position: PropTypes.number,
  groupCategory: PropTypes.string
}

export default GabAdStatus
