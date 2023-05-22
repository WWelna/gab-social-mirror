import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { togglePaused } from '../actions/swipe'

class Slider extends React.PureComponent {

  handleOnInput = (e) => {
    this.props.onInput(e.target.value)
  }
  
  handleOnChange = (e) => {
    this.props.onChange(e.target.value)
  }

  render() {
    const {
      className,
      min,
      max,
      value,
      pauseSwipe,
      unpauseSwipe
    } = this.props

    return (
      <input
        type='range'
        min={min}
        value={value}
        max={max}
        onInput={this.handleOnInput}
        onChange={this.handleOnChange}
        onTouchStart={pauseSwipe}
        onTouchEnd={unpauseSwipe}
        onMouseDown={pauseSwipe}
        onMouseUp={unpauseSwipe}
        className={className}
      />
    )
  }

}

Slider.propTypes = {
  className: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
  onChange: PropTypes.func,
  onInput: PropTypes.func,
  value: PropTypes.number,
  pauseSwipe: PropTypes.func,
  unpauseSwipe: PropTypes.func
}

const mapDispatchToProps = dispatch => ({
  pauseSwipe: () => dispatch(togglePaused(true)),
  unpauseSwipe: () => dispatch(togglePaused(false))
})

export default connect(null, mapDispatchToProps)(Slider)
