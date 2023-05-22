import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'
import isObject from 'lodash.isobject'
import axios from 'axios'
import {
  DEFAULT_REL,
  GAB_AD_PLACEMENTS,
} from '../../constants'
import { getRandomInt } from '../../utils/numbers'
import {
  saveAdvertisementClickData,
  saveAdvertisementViewData,
  incrementViewCountForAdvertisement,
  pagePosition,
} from '../../actions/advertisements'
import Button from '../button'

const REQUIRED_KEYS = [
  'id',
  'title',
  'subtitle',
  'image',
  'url',
]

// TODO configurable URL for gab grow such as dotenv and url-join
const growBaseUrl = 'https://grow.gab.com/get/';

class GabAdBase extends React.Component {

  state = {
    ad: null,
  }

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
   * @returns {sring}
   */
  get pagePositionKey() {
    const { pageKey, position } = this.props
    return `${pageKey}-${position}`
  }

  /**
   * Return a cached at at the page position, if any.
   * @returns {object}
   */
  cachedAd() {
    if (this.hasPagePosition === false) {
      return
    }
    const { pageKey, position, pagePositionAdsCache } = this.props
    const ad = pagePositionAdsCache.get(this.pagePositionKey)
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
    this.props.savePagePosition({ pageKey, position, ad })
  }

  /**
   * Fetch a new ad and save it at the page position.
   */
  loadFreshAd() {
    const { placement } = this.props
    let adUrl;

    if (placement == GAB_AD_PLACEMENTS.status) {
      adUrl = `${growBaseUrl}status`;
    } else if (placement == GAB_AD_PLACEMENTS.panel) {
      adUrl = `${growBaseUrl}sidebar`;
    }

    axios.get(adUrl).then(({ data: ad }) => {
      if (REQUIRED_KEYS.every(key => Object.keys(ad).includes(key))) {
        this.savePosition(ad)
        this.setState({ ad })
      }
    }).catch(() => this.setState({ ad: null }))
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
    const { ad } = this.state
    if (!isObject(ad)) return

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    this.props.onSaveAdvertisementViewData(ad.id)
  }

  handleOnClick = () => {
    const { ad } = this.state
    const { placement } = this.props
    if (!isObject(ad)) return null

    this.props.onSaveAdvertisementClickData(ad.id, placement)
  }

  handleOnView = () => {
    const { ad } = this.state
    if (!isObject(ad)) return null

    this.props.onIncrementViewCountForAdvertisement(ad.id)
  }

  setRef = (node) => {
    this.node = node

    // set up io
    if (!!window.IntersectionObserver) {
      this.observer = new IntersectionObserver((entries) => { 
        entries.forEach((entry) => {
          if (entry.isIntersecting){
            this.handleOnView()
          }
        });
      }, { threshold: 0.5 });

      this.observer.observe(this.node)
    }
  }

  render() {
    const { ad } = this.state
    const { children } = this.props

    // wait til load
    if (!ad) return null

    return (
      <Button
        noClasses
        buttonRef={this.setRef}
        className={[_s.d, _s.bgTransparent, _s.cursorPointer, _s.outlineNone, _s.w100PC, _s.hAuto, _s.noUnderline].join(' ')}
        href={ad.url}
        onClick={this.handleOnClick}
        target='_blank'
        rel={DEFAULT_REL}
      >
        {children(ad)}
      </Button>
    )
  }

}

function mapStateToProps(state, props) {
  const pagePositionAdsCache = state.getIn(['advertisements', 'pagePositionAdsCache'])
  return { pagePositionAdsCache }
}

const mapDispatchToProps = (dispatch) => ({
  onSaveAdvertisementClickData(adId, placement) {
    dispatch(saveAdvertisementClickData(adId, placement))
  },
  onSaveAdvertisementViewData(adId) {
    dispatch(saveAdvertisementViewData(adId))
  },
  onIncrementViewCountForAdvertisement(adId) {
    dispatch(incrementViewCountForAdvertisement(adId))
  },
  savePagePosition({ pageKey, position, ad }) {
    dispatch(pagePosition({ pageKey, position, ad }))
  }
})

GabAdBase.propTypes = {
  children: PropTypes.func.isRequired,
  placement: PropTypes.oneOf(Object.keys(GAB_AD_PLACEMENTS)),
  onSaveAdvertisementClickData: PropTypes.func.isRequired,
  onSaveAdvertisementViewData: PropTypes.func.isRequired,
  onIncrementViewCountForAdvertisement: PropTypes.func.isRequired,
  pageKey: PropTypes.string,
  position: PropTypes.number,
  pagePositionAdsCache: ImmutablePropTypes.map
}

export default connect(mapStateToProps, mapDispatchToProps)(GabAdBase)
