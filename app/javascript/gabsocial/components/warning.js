import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { clearWarning } from '../actions/warnings'
import RelativeTimestamp from './relative_timestamp'
import Text from './text'
import Button from './button'
import DotTextSeperator from './dot_text_seperator'

class Warning extends ImmutablePureComponent {
  state = {
    isDismissed: false,
  }

  handleSetIsDismissed = () => {
    const { warning } = this.props
    this.setState({ isDismissed: true })
    this.props.handleOnClearWarning(warning.get('id'))
  }

  render() {
    const { isDismissed } = this.state
    const { warning } = this.props

    if (isDismissed || !warning) {
      return null
    }

    return (
      <div className={[_s.d, _s.mb10, _s.w100PC, _s.borderBottom1PX, _s.borderColorSecondary].join(' ')}>
        <div className={[_s.d, _s.pl10, _s.pr15, _s.py10, _s.flexRow, _s.aiCenter].join(' ')}>
          <div className={[_s.d, _s.aiCenter, _s.jcCenter].join(' ')}>
            <Button
              backgroundColor='none'
              className={[_s.bgSubtle_onHover, _s.circle, _s.px10].join(' ')}
              title='Close'
              onClick={this.handleSetIsDismissed}
              color='secondary'
              icon='close'
              iconSize='10px'
            />
          </div>
          <div className={[_s.d, _s.aiCenter, _s.jcCenter, _s.ml10, _s.flexRow].join(' ')}>
            <Text color='secondary'>
              <RelativeTimestamp timestamp={warning.get('created_at')} />
            </Text>
            <DotTextSeperator />
            <Text className={_s.ml5}>
              {warning.get('text')}
            </Text>
            {/* : todo : put statuses */}
          </div>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => ({
  handleOnClearWarning (warningId) {
    dispatch(clearWarning(warningId))
  },
})

Warning.defaultProps = {
  size: 40,
}

Warning.propTypes = {
  warning: ImmutablePropTypes.map,
  id: PropTypes.string.isRequired,
}

export default connect(null, mapDispatchToProps)(Warning)