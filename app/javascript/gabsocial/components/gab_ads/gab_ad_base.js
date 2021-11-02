import React from 'react'
import PropTypes from 'prop-types'
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
} from '../../actions/advertisements'
import Button from '../button'

const REQUIRED_KEYS = [
  'id',
  'title',
  'subtitle',
  'image',
  'url',
]

class GabAdBase extends React.Component {

  state = {
    ad: null,
  }

  componentWillMount() {
    // if not status, return null
    const { placement } = this.props
    let baseurl = 'https://grow.gab.com/get/';
    let finalurl;

    if (placement == GAB_AD_PLACEMENTS.status) {
      finalurl = `${baseurl}status`;
    } else if (placement == GAB_AD_PLACEMENTS.panel) {
      finalurl = `${baseurl}sidebar`;
    }

    axios.get(finalurl).then((response) => {
      if (!!response.data && isObject(response.data)) {
        if (REQUIRED_KEYS.every(key => Object.keys(response.data).includes(key))) {
          this.setState({ ad: response.data })
        }
      }
    }).catch((error) => {
      this.setState({ ad: null })
      // console.log('error loading ad: ', error)
    })

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
})

GabAdBase.propTypes = {
  children: PropTypes.func.isRequired,
  placement: PropTypes.oneOf(Object.keys(GAB_AD_PLACEMENTS)),
  onSaveAdvertisementClickData: PropTypes.func.isRequired,
  onSaveAdvertisementViewData: PropTypes.func.isRequired,
  onIncrementViewCountForAdvertisement: PropTypes.func.isRequired,
}

export default connect(null, mapDispatchToProps)(GabAdBase)
