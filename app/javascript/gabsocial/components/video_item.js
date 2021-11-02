import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { CX, DEFAULT_REL } from '../constants'
import Icon from './icon'
import Image from './image'
import Text from './text'
import DotTextSeperator from './dot_text_seperator'
import RelativeTimestamp from './relative_timestamp'

const VideoItem = ({
  id,
  isVertical,
  videoUrl,
  title,
  thumbnail,
  created,
  channelName,
  channelAvatar,
  views,
  width,
  duration,
}) => {
  const [ isHovering, setIsHovering ] = useState(false)

  function handleOnMouseEnter() {
    setIsHovering(true)
  }
  
  function handleOnMouseLeave() {
    setIsHovering(false)
  }

  const maxTitle = 64
  const truncatedTitle = title.length >= maxTitle ? `${title.substring(0, maxTitle).trim()}...` : title

  return (
    <a
      href={videoUrl}
      target="_blank"
      rel={DEFAULT_REL}
      onMouseEnter={handleOnMouseEnter}
      onMouseLeave={handleOnMouseLeave}
      className={[_s.d, _s.w100PC, _s.maxW340PX, _s.px10, _s.py10, _s.noUnderline].join(' ')}
    >
      <div className={[_s.d, _s.w100PC, _s.pt5625PC, _s.overflowHidden, _s.radiusSmall].join(' ')}>
        <div className={[_s.d, _s.posAbs, _s.top0, _s.right0, _s.left0, _s.bottom0].join(' ')}>
          <Image src={thumbnail} className={[_s.d, _s.width100PC, _s.height100PC].join(' ')} />
          {
            isHovering &&
            <div className={[_s.d, _s.posAbs, _s.aiCenter, _s.jcCenter, _s.bgBlackOpaque, _s.top0, _s.left0, _s.bottom0, _s.right0, _s.z1].join(' ')}>
              <div className={[_s.d, _s.h60PX, _s.w60PX, _s.bgBlackOpaquest, _s.circle, _s.borderColorWhite, _s.border2PX, _s.aiCenter, _s.jcCenter].join(' ')}>
                <Icon id='play' className={[_s.cWhite, _s.ml2].join(' ')} size='22px' />
              </div>
            </div>
          }

          <div className={[_s.d, _s.posAbs, _s.radiusSmall, _s.bgBlackOpaque, _s.px5, _s.py5, _s.mr5, _s.mt5, _s.mb5, _s.bottom0, _s.right0, _s.z3].join(' ')}>
            <Text size='extraSmall' color='white'>
              {duration}
            </Text>
          </div>
        </div>
      </div>
      <div className={[_s.d, _s.w100PC, _s.flexRow, _s.aiStart, _s.pt10].join(' ')}>
        <Image src={channelAvatar} width='36px' height='36px' className={[_s.circle].join(' ')} />
        <div className={[_s.d, _s.flex1, _s.pl10].join(' ')}>
          <div className={[_s.d].join('')}>
            <Text weight='bold'>
              {truncatedTitle}
            </Text>
          </div>
          <Text color='secondary' size='small' className={_s.py2}>
            {channelName}
          </Text>
          <div>
            <Text color='secondary' size='small'>
              {views} views
              <DotTextSeperator />&nbsp;
              <RelativeTimestamp timestamp={created} />
            </Text>
          </div>
        </div>
      </div>
    </a>
  )
}

VideoItem.propTypes = {
  id: PropTypes.string,
  videoUrl: PropTypes.string,
  title: PropTypes.string,
  thumbnail: PropTypes.string,
  created: PropTypes.string,
  channelName: PropTypes.string,
  channelAvatar: PropTypes.string,
  views: PropTypes.string,
  duration: PropTypes.number,
}

const mapStateToProps = (state) => ({
  width: state.getIn(['settings', 'window_dimensions', 'width']),
})

export default connect(mapStateToProps)(VideoItem)