import React from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import get from 'lodash/get'
import throttle from 'lodash/throttle'
import { supportsPassiveEvents, primaryInput } from 'detect-it'
import { CX } from '../constants'
import ColumnIndicator from './column_indicator'
import Icon from './icon'

const pullDownFrom = -45
const pullDownTo = 100
const diameter = 30
const evtOpts = supportsPassiveEvents ? { passive: true } : false
const topStickyDistance = 50

const iconWrapperClasses = CX({
  circle: 1,
  bgSubtle: 1,
  py5: 1,
  px5: 1,
})

const Puller = ({ top, refreshing, pulled }) =>
  (<div style={{
    position: 'absolute',
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'opacity 200ms',
    opacity: top > pullDownFrom ? 1 : 0,
    top,
  }}>
    <div
      className={iconWrapperClasses}
      style={{
        width: `${diameter}px`,
        height: `${diameter}px`,
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 0 2px var(--solid_color_block)',
        color: 'var(--color_brand)',
      }}
    >
      {
        top === pullDownTo || refreshing || pulled ?
          (<ColumnIndicator type='loading' />) :
          (<div style={{ transform: `rotate(${top}deg)` }}>
            <Icon id='repost' size='29px' />
          </div>)
      }
    </div>
  </div>)

Puller.propTypes = {
  top: PropTypes.number,
  refreshing: PropTypes.bool,
  pulled: PropTypes.bool,
}

const getPageY = evt => get(evt, 'touches.0.pageY', 0)

class PullToRefresh extends React.Component {

  state = {
    top: pullDownFrom,
    refreshing: false,
    pulled: false,
  }

  startY = 0
  scrollableParent = document.body
  touchable = false

  // is it allowed to do anything?
  get pullable() {
    const { isDisabled, isModalOpen, isPopoverOpen } = this.props
    const isTouch = primaryInput === 'touch'
    const isCompose = window.location.pathname.startsWith('/compose')
    const composerListening = window.composerHasText
    const hasSelection = window.getSelection().toString().length > 0

    if (
      isDisabled ||
      composerListening ||
      !isTouch ||
      isModalOpen ||
      isPopoverOpen ||
      isCompose ||
      hasSelection
    ) {
      return false
    }
    return true
  }

  // it's already doing something or out of view
  get busy() {
    const { refreshing, pulled } = this.state
    return refreshing || pulled || window.scrollY > 100
  }

  get padder() {
    return document.body
  }

  get scrollY() {
    return window.scrollY
  }

  componentDidMount() {
    if (!this.pullable) {
      return
    }
    const el = window
    this.padder.style.transition = 'padding-top 200ms'
    el.addEventListener('scroll', this.scroll, evtOpts)
    this.scroll()
  }

  componentWillUnmount() {
    if (!this.pullable || !this.scrollableParent) {
      return
    }
    const el = window
    el.removeEventListener('scroll', this.scroll)
    if (this.touchable)  {
      this.unbindTouchEvents()
    }
  }

  scroll = throttle(() => {
    const { touchable, scrollY } = this
    const nextTouchable = scrollY < 100
    if (touchable && !nextTouchable) {
      this.unbindTouchEvents()
    } else if (!touchable && nextTouchable) {
      this.bindTouchEvents()
    }
    this.touchable = nextTouchable
  }, 1000)

  bindTouchEvents = () => {
    const { scrollableParent } = this
    scrollableParent.addEventListener('touchstart', this.touchstart, evtOpts)
    scrollableParent.addEventListener('touchmove', this.touchmove, evtOpts)
    scrollableParent.addEventListener('touchend', this.touchend, evtOpts)
  }

  unbindTouchEvents = () => {
    const { scrollableParent } = this
    scrollableParent.removeEventListener('touchstart', this.touchstart)
    scrollableParent.removeEventListener('touchmove', this.touchmove)
    scrollableParent.removeEventListener('touchend', this.touchend)
  }

  touchstart = evt => {
    if (this.busy || !this.pullable) {
      return
    }
    this.startY = getPageY(evt)
  }

  refresh = () => {
    if (this.busy || !this.pullable) {
      return
    }
    this.setState({ refreshing: true, pulled: true })
    location.reload();
  }

  touchmove = evt => {
    if (this.busy || !this.pullable) {
      return
    }
    const y = getPageY(evt)
    const { startY } = this
    const pulledDistance = (y - startY)
    if (pulledDistance < topStickyDistance) {
      return
    }
    let top = pulledDistance + pullDownFrom
    const isPulled = top >= pullDownTo
    top = isPulled ? pullDownTo : top // clamp
    this.setState({ top })
    this.padder.style.paddingTop = Math.floor((top - pullDownFrom) / 2) + 'px'
    if (isPulled) {
      this.refresh()
    }
  }

  touchend = () => {
    this.padder.style.paddingTop = '0px'
    const change = { pulled: false }
    if (!this.state.pulled && !this.state.refreshing) {
      change.top = pullDownFrom
    }
    this.setState(change)
  }

  render() {
    const { top, refreshing, pulled } = this.state
    return this.pullable ? ReactDOM.createPortal(
      <Puller top={top} refreshing={refreshing} pulled={pulled} />,
      document.body
    ) : null
  }

}

const mapStateToProps = state => ({
  width: state.getIn(['settings', 'window_dimensions', 'width']),
  isModalOpen: !!state.getIn(['modal', 'modalType']),
  isPopoverOpen: !!state.getIn(['popover', 'popoverType']),
})

PullToRefresh.propTypes = {
  isDisabled: PropTypes.bool,
  width: PropTypes.number,
}

export default connect(mapStateToProps)(PullToRefresh)
