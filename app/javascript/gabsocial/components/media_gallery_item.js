import React, { useState } from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import isObject from 'lodash/isObject'
import Blurhash from './blurhash'
import Icon from './icon'
import Video from './video'
import GifVideo from './gif_video'
import Gif from './gif'
import Image from './image'
import LoadingIcon from './loading'
import ZoomableImage from './zoomable_image'

function RenderVideo({ attachment, height, width, size, isInModal, autoplay }) {
  if (size > 1) {
    return (
      <div className={[_s.cursorPointer, _s.d, _s.w100PC, _s.h100PC, _s.z1].join(' ')}>
        <img className={[_s.d, _s.h100PC].join(' ')} src={attachment.get('preview_url')} /> 
        <div className={[_s.d, _s.posAbs, _s.top0, _s.bottom0, _s.right0, _s.left0, _s.aiCenter, _s.jcCenter].join(' ')}>
          <div className={[_s.d, _s.cursorPointer, _s.aiCenter, _s.jcCenter, _s.circle, _s.w60PX, _s.h60PX, _s.border2PX, _s.bgBlackOpaquest, _s.borderColorWhite].join(' ')}>
            <Icon id='play' className={[_s.ml2, _s.cWhite].join(' ')} size='22px' />
          </div>
        </div>
      </div>
    )
  }

  return (
    <Video
      inline={isInModal}
      autoplay={!!autoplay ? 'true' : undefined}
      height={height}
      width={width}
      className={[_s.w100PC, _s.h100PC].join(' ')}
      preview={attachment.get('preview_url')}
      blurhash={attachment.get('blurhash')}
      src={attachment.get('url')}
      sourceMp4={attachment.get('source_mp4')}
      alt={attachment.get('description')}
      aspectRatio={attachment.getIn(['meta', 'small', 'aspect'])}
      fileContentType={attachment.get('file_content_type')}
      meta={attachment.get('meta')}
      shouldStopAllOtherPlayers={isInModal}
    />
  )
}

function MediaGalleryItemWrapper(props) {
  return <MediaGalleryItem {...props} />
}

function MediaGalleryItem({
  index,
  photo,
  margin,
  direction,
  top,
  left,
  onClick,
}) {
  const [isLoaded, setIsLoaded] = useState(false)

  const { attachment, styles, size, isInModal, noBlurhash, autoplayVideo, blurhashOnly, onLoad } = photo
  
  let cont = {
    margin,
    height: photo.height,
    width: photo.width,
  }
  if (direction === 'column') {
    cont.position = 'absolute'
    cont.left = left
    cont.top = top
  }
  if (isObject(styles)) {
    cont = {
      ...cont,
      ...styles,
    }
  }

  function handleOnClick(e) {
    onClick(e, { index })
  }

  function handleOnLoad() {
    setIsLoaded(true)
    !!onLoad && onLoad()
  }
  
  const isGifV = attachment.get('type') === 'gifv'
  const isGif = !isGifV && (attachment.get('url') || '').split(/[#?]/)[0].split('.').pop().trim() == 'gif'
  const isVideo = !isGif && !isGifV && attachment.get('type') === 'video'
  const isImage = !isVideo && !isGif && !isGifV

  const ImageWrapper = isInModal ? ZoomableImage : Image

  return (
    <div style={cont} onClick={handleOnClick}>
      {isVideo && !blurhashOnly && <RenderVideo height={photo.height} width={photo.width} isInModal={isInModal} size={size} attachment={attachment} autoplay={autoplayVideo} /> }
      {isGifV && !blurhashOnly && <GifVideo attachment={attachment} autoplay={isInModal} /> }
      {isGif && !blurhashOnly && <Gif attachment={attachment} autoplay={isInModal} fit={isInModal ? 'contain' : 'cover'} /> }
      
      {(isImage || !isLoaded) && !blurhashOnly && (
        <ImageWrapper isLazy alt={attachment.get('description')} src={photo.src} height='100%' onError={onLoad} onLoad={handleOnLoad} fit={isInModal ? 'contain' : 'cover'} />
      )}

      {
        (!isLoaded && !noBlurhash) &&
        <Blurhash hash={attachment.get('blurhash')} className={[_s.d, _s.h100PC, _s.w100PC].join(' ')} />
      }
      {
        (!isLoaded && noBlurhash && !blurhashOnly) &&
        <div className={[_s.d, _s.h100PC, _s.w100PC, _s.aiCenter, _s.jcCenter].join(' ')}>
          <LoadingIcon />
        </div>
      }
    </div>
  )
}

MediaGalleryItemWrapper.propTypes = {
  attachment: ImmutablePropTypes.map,
  index: PropTypes.number,
  onClick: PropTypes.func,
  isVisible: PropTypes.bool,
}

export default MediaGalleryItemWrapper
