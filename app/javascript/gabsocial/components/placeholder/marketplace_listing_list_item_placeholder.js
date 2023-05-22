import React from 'react'
import { CX } from '../../constants'
import PlaceholderLayout from './placeholder_layout'

export default class MarketplaceListingListItemPlaceholder extends React.PureComponent {
  
  render() {
    const { withButtons } = this.props

    const classes = CX({
      d: 1,
      py10: 1,
      w100PC: 1,
      px10: 1,
      borderColorSecondary: 1,
      borderBottom1PX: 1,
      mb10: 1,
    })

    return (
      <div className={classes}>
        <PlaceholderLayout viewBox='0 0 550 100'>
          {
            !withButtons &&
            <React.Fragment>
              <rect x='115' y='4' rx='0' ry='0' width='140' height='12' /> 
              <rect x='115' y='54' rx='0' ry='0' width='265' height='8' /> 
              <rect x='0' y='0' rx='3' ry='3' width='100' height='100' /> 
              <rect x='115' y='24' rx='0' ry='0' width='32' height='20' /> 
              <rect x='115' y='72' rx='0' ry='0' width='90' height='8' />
            </React.Fragment>
          }
          {
            withButtons &&
            <React.Fragment>
              <rect x='115' y='4' rx='0' ry='0' width='125' height='12' /> 
              <rect x='115' y='48' rx='0' ry='0' width='265' height='8' /> 
              <rect x='0' y='0' rx='3' ry='3' width='100' height='100' /> 
              <rect x='115' y='23' rx='0' ry='0' width='32' height='18' /> 
              <rect x='115' y='76' rx='3' ry='3' width='88' height='24' /> 
              <rect x='210' y='76' rx='3' ry='3' width='88' height='24' /> 
              <rect x='304' y='76' rx='3' ry='3' width='24' height='24' />
            </React.Fragment>
          }
        </PlaceholderLayout>
      </div>
    )
  }

}