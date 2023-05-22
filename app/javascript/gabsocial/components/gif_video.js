import React, { useState } from 'react'
import { autoPlayGif } from '../initial_state'
import GifBadge from './gif_badge'

function GifVideo({
  attachment,
  autoplay: forceAutoplay,
}) {
  const isAnimated = autoPlayGif || forceAutoplay

  function handleMouseEnter({ target }) {
    if (!isAnimated && target) target.play()
  }

  function handleMouseLeave({ target }) {
    if (!isAnimated && target) target.pause()
  }

  return (
    <div className={[_s.d, _s.w100PC, _s.h100PC, _s.z1].join(' ')}>
      <video
        className={[_s.d, _s.cursorPointer, _s.objectFitContain, _s.w100PC, _s.h100PC, _s.z1].join(' ')}
        aria-label={attachment.get('description')}
        title={attachment.get('description')}
        role='application'
        src={attachment.get('url')}
        onMouseEnter={!isAnimated ? handleMouseEnter : undefined}
        onMouseLeave={!isAnimated ? handleMouseLeave : undefined}
        autoPlay={isAnimated}
        type='video/mp4'
        loop
        muted
        playsInline
      />
      <GifBadge />
    </div>
  )
}

export default GifVideo