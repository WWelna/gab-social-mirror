import React from 'react'
import PropTypes from 'prop-types'
import isNil from 'lodash/isNil'
import throttle from 'lodash/throttle'
import { supportsPassiveEvents } from 'detect-it'
import isArray from 'lodash/isArray'
import Block from './block'
import ColumnIndicator from './column_indicator'
import LoadMore from './load_more'
import { getScrollableParent } from '../utils/scrolling'
import { loggedIn } from '../initial_state'

const isFunction = val => typeof val === 'function'

const evtOpts = supportsPassiveEvents ? { passive: true } : false

class ScrollableList extends React.Component {

  state = {
    nearBottom: false,
    clickedLoadMore: false,
  }

  scrollableParent = null
  eventsBound = false
  eventsTimer = null

  componentDidMount() {
    // defer binding events
    this.startEventsTimer()
  }

  componentDidUpdate() {
    /*
    Component update can fire many times as redux keeps changing. This is
    deferring and debouncing binding of events until after the component
    settles down. Prevent loading more until later.
    */
    this.startEventsTimer()
  }

  componentWillUnmount() {
    this.unbindEvents()
    this.cancelEventsTimer()
  }

  get useWindow() {
    return this.scrollableParent.isSameNode(document.documentElement)
  }

  startEventsTimer = () => {
    this.cancelEventsTimer()
    this.eventsTimer = setTimeout(() => this.bindEvents(), 1000)
  }

  cancelEventsTimer = () => {
    if (isNil(this.eventsTimer) === false) {
      clearTimeout(this.eventsTimer)
    }
  }

  handleScroll = throttle(() => {
    if (this.props.disableInfiniteScroll || (this.props.disableInfiniteScrollUntilClicked && !this.state.clickedLoadMore)) {
      return
    }

    const {
      onLoadMore,
      hasMore,
      isLoading,
      onScrollToTop,
      onScroll,
    } = this.props

    const { scrollableParent } = this

    if (!scrollableParent) {
      return
    }

    let nearBottom = false
    const { scrollTop } = scrollableParent

    if (this.useWindow) {
      // Normal timelines case, scrolling body/html element down
      const threshold = 2000 // px from the bottom
      nearBottom = (document.body.offsetHeight - window.scrollY) < threshold
    } else {
      // scrolling inside a scrollable element, not main body/html, Deck column
      const { scrollHeight, offsetHeight } = scrollableParent
      const offset = scrollHeight - scrollTop - offsetHeight
      const threshold = 1000
      nearBottom = offset < threshold
    }

    if (this.state.nearBottom !== nearBottom) {
      this.setState({ nearBottom })
    }

    if (
      nearBottom &&
      isFunction(onLoadMore) &&
      hasMore &&
      !isLoading &&
      loggedIn
    ) {
      onLoadMore()
    }

    if (scrollTop < 100 && isFunction(onScrollToTop)) {
      onScrollToTop()
    } else if (isFunction(onScroll)) {
      onScroll()
    }
  }, 500)

  handleLoadMore = (e) => {
    e.preventDefault()
    if (this.props.disableInfiniteScrollUntilClicked && !this.state.clickedLoadMore) {
      this.setState({ clickedLoadMore: true })
    }
    this.props.onLoadMore()
  }

  bindEvents = () => {
    const { scrollableParent } = this
    if (isNil(scrollableParent) || this.eventsBound) {
      return
    }
    const el = this.useWindow ? window : scrollableParent
    el.addEventListener('scroll', this.handleScroll, evtOpts)
    el.addEventListener('wheel', this.handleScroll, evtOpts)
    el.addEventListener('touchmove', this.handleScroll, evtOpts)
    this.eventsBound = true
  }

  unbindEvents = () => {
    const { scrollableParent } = this
    if (isNil(scrollableParent) || this.eventsBound === false) {
      return // it could have unmounted before binding
    }
    const el = this.useWindow ? window : scrollableParent
    el.removeEventListener('scroll', this.handleScroll)
    el.removeEventListener('wheel', this.handleScroll)
    el.removeEventListener('touchmove', this.handleScroll)
  }

  outer = null
  setRef = el => {
    if (isNil(this.outer)) {
      this.outer = el
      this.scrollableParent = getScrollableParent(el)
      if (typeof this.props.scrollRef === 'function') {
        this.props.scrollRef(el)
      }
    }
    return this.outer
  }

  render() {
    const {
      children,
      scrollKey,
      showLoading,
      isLoading,
      hasMore,
      emptyMessage,
      onLoadMore,
      placeholderComponent: Placeholder,
      placeholderCount = 1,
    } = this.props

    const { nearBottom } = this.state


    if (showLoading) {
      if (Placeholder) {
        return (
          <>
            {
              Array.apply(null, {
                length: placeholderCount,
              }).map((_, i) => (
                <Placeholder
                  key={`${scrollKey}-placeholder-${i}`}
                  isLast={i === placeholderCount - 1}
                />
              ))
            }
          </>
        )
      }

      return <ColumnIndicator type='loading' />
    }

    // [] or false shows as children count 1 so we use a few other checks here
    const childrenCount = !isArray(children) && children !== false ? React.Children.count(children) : 0
    const hasItems = isArray(children) && children.length > 0

    if (isLoading || childrenCount > 0 || hasItems || hasMore || !emptyMessage) {
      return (
        <div ref={this.setRef}>
          {children}
          {(hasMore && onLoadMore && !isLoading && loggedIn) && <LoadMore onClick={this.handleLoadMore} />}
          {isLoading && nearBottom && <ColumnIndicator type='loading' />}
        </div>
      )
    }

    return (
      <Block>
        <ColumnIndicator type='error' message={emptyMessage} />
      </Block>
    )
  }

}

ScrollableList.propTypes = {
  scrollKey: PropTypes.string.isRequired,
  onLoadMore: PropTypes.func,
  scrollRef: PropTypes.func,
  isLoading: PropTypes.bool,
  showLoading: PropTypes.bool,
  hasMore: PropTypes.bool,
  emptyMessage: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),
  children: PropTypes.node,
  onScrollToTop: PropTypes.func,
  onScroll: PropTypes.func,
  placeholderComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  placeholderCount: PropTypes.number,
  disableInfiniteScroll: PropTypes.bool,
}

export default ScrollableList
