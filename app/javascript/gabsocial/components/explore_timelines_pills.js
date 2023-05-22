import React,{ memo } from 'react'
import { me } from '../initial_state'
import Pills from './pills'

function ExploreTimelinePills() {
  const exploreItems = [
    {
      title: 'Explore',
      to: !!me ? '/explore' : '/',
    },
    {
      title: 'Videos',
      to: '/timeline/videos',
    },
    {
      title: 'Photos',
      to: '/timeline/photos',
    },
    {
      title: 'Polls',
      to: '/timeline/polls',
    },
    {
      title: 'PRO Feed',
      to: '/timeline/pro',
    },
  ]
  
  return (
    <div className={[_s.d, _s.overflowYHidden, _s.overflowXScroll, _s.noScrollbar, _s.pr5, _s.flexRow].join(' ')}>
      <Pills pills={exploreItems} />
    </div>
  )
}


export default memo(ExploreTimelinePills)