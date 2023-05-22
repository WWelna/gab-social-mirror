import React, { useState } from 'react'
import { autoPlayGif } from '../initial_state'
import GifBadge from './gif_badge'
import Image from './image'

function Gif({
  attachment,
  autoplay: forceAutoplay,
  fit,
}) {
  const defaultAutoplayGif = autoPlayGif || forceAutoplay
  const [isAnimated, setIsAnimated] = useState(defaultAutoplayGif)

  function handleMouseEnter() {
    setIsAnimated(true)
  }

  function handleMouseLeave() {
    setIsAnimated(false)
  }

  const src = attachment.get(isAnimated ? 'url' : 'preview_url')

  return (
    <div className={[_s.d, _s.w100PC, _s.h100PC, _s.z1].join(' ')}>
      <Image
        isLazy
        src={src}
        height='100%'
        fit={fit}
        onMouseEnter={!defaultAutoplayGif ? handleMouseEnter : undefined}
        onMouseLeave={!defaultAutoplayGif ? handleMouseLeave : undefined}
        alt={attachment.get('description')}
      />
      <GifBadge />
    </div>
  )
}

export default Gif