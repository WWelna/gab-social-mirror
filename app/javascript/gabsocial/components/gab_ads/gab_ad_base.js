import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'
import isObject from 'lodash/isObject'
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
    const { placement, groupCategory } = this.props
    let adUrl

    if (placement === GAB_AD_PLACEMENTS.status) {
      adUrl = `${growBaseUrl}status`
    } else if (placement === GAB_AD_PLACEMENTS.panel) {
      adUrl = `${growBaseUrl}sidebar`
    } else if (placement === GAB_AD_PLACEMENTS.buyout) {
      adUrl = `${growBaseUrl}buyout`
    }

    if (groupCategory && groupCategory != '') {
      adUrl += `?category=${groupCategory}`
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

  componentDidMount() {
    const ad = this.cachedAd()
    if (ad !== undefined) {
      // cached
      return this.setState({ ad })
    }
    this.loadFreshAd()
  }

  render() {
    const { ad } = this.state
    const { children, bottomPanelUrl } = this.props

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
        href={ bottomPanelUrl ? (ad.url + bottomPanelUrl) : ad.url }
        target='_blank'
        rel='noopener'
      >
        {children(ad)}
      </Button>
    )
  }

}

function mapStateToProps(state) {
  const pagePositionAdsCache = state.getIn(['advertisements', 'pagePositionAdsCache']);
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
  bottomPanelUrl: PropTypes.string,
  onPagePosition: PropTypes.func.isRequired,
  onRemovePosition: PropTypes.func.isRequired,
  pageKey: PropTypes.string,
  position: PropTypes.number,
  groupCategory: PropTypes.string,
  pagePositionAdsCache: ImmutablePropTypes.map,
}

export default connect(mapStateToProps, mapDispatchToProps)(GabAdBase)
