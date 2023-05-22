import React from 'react'
import { CX } from '../../constants'
import PlaceholderLayout from './placeholder_layout'

export default class MarketplaceListingCardPlaceholder extends React.PureComponent {

  render() {
    const classes = CX({
      d: 1,
      radiusSmall: 1,
      overflowHidden: 1,
      border1PX: 1,
      borderColorSecondary: 1,
      cSecondary: 1,
    })

    return (
      <div className={classes}>
        <PlaceholderLayout viewBox='0 0 140 180' className={_s.w100PC}>
          <rect x='0' y='0' rx='0' ry='0' width='140' height='140' />
          <rect x='6' y='146' rx='0' ry='0' width='50' height='10' />
          <rect x='6' y='160' rx='0' ry='0' width='120' height='10' />
        </PlaceholderLayout>
      </div>
    )
  }

}
