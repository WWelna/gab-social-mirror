import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'
import isObject from 'lodash.isobject'
import axios from 'axios'
import {
  GAB_AD_PLACEMENTS
} from '../../constants'
import { pagePosition, removePagePosition } from '../../actions/advertisements'
import Button from '../button'

const REQUIRED_KEYS = [
  'id',
  'title',
  'subtitle',
  'image',
  'url',
]

// TODO configurable URL for gab grow such as dotenv and url-join
const growBaseUrl = 'https://grow.gab.com/get/'

// half of element is visible
const observerOpts = { threshold: 0.1 }

// Time after switch an ad will reload (2min)
const freshenAfterMs = 120000

class GabAdBase extends React.Component {

  state = { ad: null }

  /**
   * Getter which is true if pageKey and position props were provided.
   * @returns {boolean}
   */
  get hasPagePosition() {
    const { pageKey, position } = this.props
    return typeof pageKey === 'string' && typeof position === 'number'
  }

  /**
   * Getter creating a string key for caching.
   * @returns {string}
   */
  get pagePositionKey() {
    const { pageKey, position } = this.props
    return `${pageKey}-${position}`
  }

  get hasObserver () { return this.observer !== undefined }

  get isAdBlank() {
    const { ad } = this.state
    return ad === undefined ||
      ad === null ||
      (typeof ad === 'object' && Object.keys(ad).length === 0) ||
      REQUIRED_KEYS.every(key => Object.keys(ad).includes(key)) === false
  }

  /**
   * Return a cached at at the page position, if any.
   * @returns {object}
   */
  cachedAd() {
    if (this.hasPagePosition === false) {
      return
    }
    const ad = this.props.pagePositionAdsCache.get(this.pagePositionKey)
    if (ad !== undefined) {
      // it was cached
      return ad.toJS()
    }
  }

  /**
   * If we fetched a new ad then save it at the current position.
   * @param {object} ad
   */
  savePosition(ad) {
    if (this.hasPagePosition === false) {
      return
    }
    const { pageKey, position } = this.props
    this.props.onPagePosition({ pageKey, position, ad })
  }

  /**
   * Fetch a new ad and save it at the page position.
   */
  loadFreshAd() {
    const { placement } = this.props
    let adUrl

    if (placement === GAB_AD_PLACEMENTS.status) {
      adUrl = `${growBaseUrl}status`
    } else if (placement === GAB_AD_PLACEMENTS.panel) {
      adUrl = `${growBaseUrl}sidebar`
    }

    axios.get(adUrl).then(({ data: ad }) => {
      this.savePosition(ad)
      this.setState({ ad })
    }).catch(err => {
      const { message, stack } = err
      console.error('error requesting from grow', message, stack)
      // on error save a blank spot to prevent jumping scroll Y
      const ad = {}
      this.savePosition(ad)
      this.setState({ ad })
    })
  }

  /**
   * The ad has been visible some amount of time and needs to be replaced.
   */
  freshen = () => {
    this.props.onRemovePosition(this.pagePositionKey)
    this.loadFreshAd()
  }

  /**
   * Ad is intersecting the visible area
   */
  intersecting = () => {
    if (this.isAdBlank) {
      return
    }
    const { ad } = this.state
    const { firstViewedAt } = ad

    if (firstViewedAt === undefined) {
      // first time viewed
      ad.firstViewedAt = Date.now()
      this.setState({ ad })
      return
    }

    const now = Date.now()
    const diff = now - firstViewedAt
    if (diff >= freshenAfterMs) {
      // the ad has been visible long enough, switch it out
      this.freshen()
    }
  }

  /**
   * Callback for when ad is going on or off screen
   */
  observing = entries => {
    if (entries.some(item => item.isIntersecting)) {
      this.intersecting()
    }
  }

  bindObserver = () => {
    if (
      this.hasObserver ||
      typeof window.IntersectionObserver !== 'function'
    ) {
      return
    }
    const observer = new IntersectionObserver(this.observing, observerOpts)
    observer.observe(this.node)
    this.observer = observer
  }

  unbindObserver = () => {
    if (!this.hasObserver) {
      return
    }
    this.observer.disconnect()
    this.observer = undefined
  }

  componentDidMount() {
    const ad = this.cachedAd()
    if (ad !== undefined) {
      // cached
      return this.setState({ ad })
    }
    this.loadFreshAd()
  }

  componentWillUnmount() {
    this.unbindObserver()
  }

  setRef = el => {
    this.node = el
    this.bindObserver()
  }

  render() {
    const { ad } = this.state
    const { children } = this.props

    if (this.isAdBlank) {
      return null
    }

    // dont allow clicking on whole ad if is video ad
    const noClick = !!ad.video
    if (noClick) {
      return (
        <div
          className={[_s.d, _s.bgTransparent, _s.w100PC, _s.hAuto].join(' ')}
        >
          {children(ad)}
        </div>
      )
    }

    return (
      <Button
        noClasses
        className={[_s.d, _s.bgTransparent, _s.cursorPointer, _s.outlineNone, _s.w100PC, _s.hAuto, _s.noUnderline].join(' ')}
        href={ad.url}
        target='_blank'
        rel='noopener'
        buttonRef={this.setRef}
      >
        {children(ad)}
      </Button>
    )
  }

}

function mapStateToProps(state) {
  const pagePositionAdsCache = state.getIn(['advertisements', 'pagePositionAdsCache'])
  return { pagePositionAdsCache }
}

const mapDispatchToProps = (dispatch) => ({
  onPagePosition({ pageKey, position, ad }) {
    dispatch(pagePosition({ pageKey, position, ad }))
  },
  onRemovePosition(pagePositionKey) {
    dispatch(removePagePosition(pagePositionKey))
  }
})

GabAdBase.propTypes = {
  children: PropTypes.func.isRequired,
  placement: PropTypes.oneOf(Object.keys(GAB_AD_PLACEMENTS)),
  onPagePosition: PropTypes.func.isRequired,
  onRemovePosition: PropTypes.func.isRequired,
  pageKey: PropTypes.string,
  position: PropTypes.number,
  pagePositionAdsCache: ImmutablePropTypes.map,
}

export default connect(mapStateToProps, mapDispatchToProps)(GabAdBase)
