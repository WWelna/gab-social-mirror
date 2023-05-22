import React from 'react'
import PropTypes from 'prop-types'
import ReactSwipeableViews from 'react-swipeable-views'
import { CX } from '../constants'
import Button from './button'
import Pagination from './pagination'

class Carousel extends React.PureComponent {
  
  state = {
    index: 0,
    navigationHidden: false,
  }

  handleSwipe = (index) => {
    const { children, size } = this.props    
    if (!children) return

    this.setState({ index: index % size })
  }

  handleNextClick = () => {
    const { children, size } = this.props
    if (!children) return

    this.setState({ index: (this.getIndex() + 1) % size })
  }

  handlePrevClick = () => {
    const { children, size } = this.props
    if (!children) return

    this.setState({ index: (size + this.getIndex() - 1) % size })
  }

  handleChangeIndex = (i) => {
    const { children, size } = this.props
    if (!children) return

    this.setState({ index: i % size })
  }

  handleKeyDown = (e) => {
    const { children } = this.props
    if (!children) return

    switch (e.key) {
      case 'ArrowLeft':
        this.handlePrevClick()
        e.preventDefault()
        e.stopPropagation()
        break
      case 'ArrowRight':
        this.handleNextClick()
        e.preventDefault()
        e.stopPropagation()
        break
    }
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown, false)
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown)
  }

  getIndex() {
    return this.state.index !== null ? this.state.index : this.props.index
  }

  toggleNavigation = () => {
    this.setState(prevState => ({
      navigationHidden: !prevState.navigationHidden,
    }))
  }

  render() {
    const { children, size } = this.props
    const { navigationHidden } = this.state

    const index = this.getIndex()

    // you can't use 100vh, because the viewport height is taller
    // than the visible part of the document in some mobile
    // browsers when it's address bar is visible.
    // https://developers.google.com/web/updates/2016/12/url-bar-resizing
    const swipeableViewsStyle = {
      height: '100%',
      width: '100%',
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'center',
    }

    const navigationClasses = CX({
      d: 1,
      posAbs: 1,
      top50PC: 1,
      right0: 1,
      left0: 1,
      displayNone: navigationHidden,
    })

    return (
      <div className={[_s.d, _s.w100PC, _s.h100PC, _s.aiCenter, _s.jcCenter].join(' ')}>
        <div
          role='presentation'
          className={[_s.d, _s.w100PC, _s.h100PC].join(' ')}
          onClick={this.toggleNavigation}
        >
          <ReactSwipeableViews
            style={swipeableViewsStyle}
            containerStyle={{
              alignItems: 'center',
              width: '100%',
              height: '100%',
            }}
            slideStyle={{
              height: '100%',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onChangeIndex={this.handleSwipe}
            // onSwitching={this.handleSwitching}
            index={index}
          >
            {children}
          </ReactSwipeableViews>
        </div>

        <div className={navigationClasses}>
          {
            size > 1 &&
            <Button
              tabIndex='0'
              backgroundColor='black'
              className={[_s.py15, _s.posAbs, _s.top50PC, _s.left0, _s.mt10, _s.ml10, _s.z4].join(' ')}
              onClick={this.handlePrevClick}
              aria-label='Previous'
              icon='arrow-left'
              iconSize='18px'
            />
          }

          {
            size > 1 &&
            <Button
              tabIndex='0'
              backgroundColor='black'
              className={[_s.py15, _s.posAbs, _s.top50PC, _s.right0, _s.mt10, _s.mr10, _s.z4].join(' ')}
              onClick={this.handleNextClick}
              aria-label='Next'
              icon='arrow-right'
              iconSize='18px'
            />
          }

        </div>

        {
          size > 1 &&
          <div className={[_s.d, _s.posAbs, _s.bottom0, _s.mb15].join(' ')}>
            <div className={[_s.d, _s.saveAreaInsetMB, _s.bgBlackOpaquer, _s.circle, _s.py10, _s.px15].join(' ')}>
              <Pagination
                count={size}
                activeIndex={index}
                onClick={this.handleChangeIndex}          
              />
            </div>
          </div>
        }
      </div>
    )
  }
}

Carousel.propTypes = {
  // children
  size: PropTypes.number,
}

export default Carousel
