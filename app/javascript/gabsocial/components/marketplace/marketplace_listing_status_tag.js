import React from 'react'
import {
  MARKETPLACE_LISTING_STATUS_PENDING_REVIEW,
  MARKETPLACE_LISTING_STATUS_PENDING_CHANGES,
  MARKETPLACE_LISTING_STATUS_REJECTED,
  MARKETPLACE_LISTING_STATUS_APPROVED,
  MARKETPLACE_LISTING_STATUS_RUNNING,
  MARKETPLACE_LISTING_STATUS_EXPIRED,
  MARKETPLACE_LISTING_STATUS_SOLD,
  MARKETPLACE_LISTING_STATUS_ARCHIVED,
} from '../../constants'

const MarketplaceListingStatusTag =  ({ statusI, statusS }) => {
  let backgroundColor, color

  switch (statusI) {
    case MARKETPLACE_LISTING_STATUS_PENDING_REVIEW:
      backgroundColor = "#333"
      color = '#fff'
      break
    case MARKETPLACE_LISTING_STATUS_PENDING_CHANGES:
      backgroundColor = "#ffc04d"
      color = '#000'
      break
    case MARKETPLACE_LISTING_STATUS_REJECTED:
      backgroundColor = "#ff9280"
      color = '#000'
      break
    case MARKETPLACE_LISTING_STATUS_APPROVED:
      backgroundColor = "#4de6ff"
      color = '#000'
      break
    case MARKETPLACE_LISTING_STATUS_RUNNING:
      backgroundColor = "#337cff"
      color = '#fff'
      break
    case MARKETPLACE_LISTING_STATUS_EXPIRED:
      backgroundColor = "#ff005b"
      color = '#fff'
      break
    case MARKETPLACE_LISTING_STATUS_SOLD:
      backgroundColor = "#666"
      color = '#fff'
      break
    case MARKETPLACE_LISTING_STATUS_ARCHIVED:
      backgroundColor = "#000"
      color = '#fff'
      break
    default:
      return null
  }

  return (
    <span
      className={[_s.d, _s.fw600, _s.textAlignCenter, _s.px10, _s.py2, _s.circle, _s.lineHeight15, _s.text, _s.fs12PX].join(' ')}
      style={{
        color,
        backgroundColor,
      }}
    >
      {statusS}
    </span>
  )
}

export default MarketplaceListingStatusTag