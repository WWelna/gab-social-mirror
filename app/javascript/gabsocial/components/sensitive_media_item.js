import React from 'react'
import PropTypes from 'prop-types'
import Button from './button'
import Text from './text'

class SensitiveMediaItem extends React.PureComponent {

  render() {
    const {
      message,
      btnTitle,
      onClick,
      noPadding,
    } = this.props

    return (
      <div className={noPadding ? undefined : [_s.d, _s.px15, _s.pt5].join(' ')}>
        <div className={[_s.d, _s.flexRow, _s.flexWrap, _s.radiusSmall, _s.bgTertiary, _s.py5, _s.px15, _s.h100PC, _s.w100PC].join(' ')}>
          <div className={[_s.d, _s.jcCenter, _s.flexNormal, _s.minW80PC, _s.py5].join(' ')}>
            <Text color='secondary'>
              {message}
            </Text>
          </div>
          {
            !!btnTitle &&
            <div className={[_s.d, _s.jcCenter, _s.mlAuto, _s.pl15].join(' ')}>
              <Button
                onClick={onClick}
                color='tertiary'
                backgroundColor='none'
                className={_s.bgSecondaryDark_onHover}
              >
                <Text color='inherit' weight='bold' size='medium'>
                  {btnTitle}
                </Text>
              </Button>
            </div>
          }
        </div>
      </div>
    )
  }

}

SensitiveMediaItem.propTypes = {
  onClick: PropTypes.func.isRequired,
  btnTitle: PropTypes.string,
  message: PropTypes.string.isRequired,
  noPadding: PropTypes.bool,
}

export default SensitiveMediaItem
