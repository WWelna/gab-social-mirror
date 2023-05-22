import React from 'react'
import PropTypes from 'prop-types'
import { Popper } from 'react-popper'
import Text from './text'

class Tooltip extends React.PureComponent {

  render() {
    const { message, targetRef } = this.props

    return (
      <Popper
        placement='left'
        referenceElement={targetRef}
        strategy="fixed"
      >
        {({ ref, style, placement, arrowProps }) => (
          <div ref={ref} style={style} data-placement={placement} className={[_s.z5, _s.mt5, _s.mb5, _s.px5, _s.py5].join(' ')}>
            <div ref={arrowProps.ref} style={arrowProps.style} />
            <div data-popover='true' className={[_s.d, _s.bgBlack, _s.borderColorPrimary, _s.boxShadowPopover, _s.maxW340PX, _s.px15, _s.py15, _s.radiusRounded].join(' ')}>
              <Text color='white' className={_s.minW120PX}>
                {message}
              </Text>
            </div>
          </div>
        )}
      </Popper>
    )
  }

}

Tooltip.propTypes = {
  message: PropTypes.string.isRequired,
  targetRef: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.element,
  ]).isRequired,
}

export default Tooltip
