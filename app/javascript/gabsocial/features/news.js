import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import throttle from 'lodash/throttle'
import { fetchPopularLinks } from '../actions/links'
import {
  BREAKPOINT_EXTRA_SMALL,
} from '../constants'
import Button from '../components/button'
import Text from '../components/text'
import TrendsItem from '../components/trends_item'
import PreviewCardItem from '../components/preview_card_item'
import WrappedBundle from './ui/util/wrapped_bundle'
import {
  GabNewsPanel,
  LatestFromGabPanel,
  PopularLinksPanel,
  TrendsBreakingPanel,
  TrendsFeedsPanel,
  TrendsHeadlinesPanel,
  TrendsRSSPanel,
  GabAdStatus,
} from './ui/util/async_components'

class News extends React.PureComponent {

  render() {
    const { children, isSmall, width } = this.props

    const isXS = width <= BREAKPOINT_EXTRA_SMALL

    if (isXS || isSmall) {
      return (
        <div className={[_s.d, _s.w100PC].join(' ')}>
          <div className={[_s.d, _s.pt15].join(' ')}>
            <div className={[_s.d, _s.w100PC].join(' ')}>
              <WrappedBundle component={TrendsHeadlinesPanel} />
              <WrappedBundle component={GabAdStatus} />
              <WrappedBundle component={TrendsBreakingPanel} componentParams={{ hideReadMore: true }} />
              <WrappedBundle component={PopularLinksPanel} />
              <WrappedBundle component={LatestFromGabPanel} />
              <WrappedBundle component={GabNewsPanel} />
              <WrappedBundle component={TrendsFeedsPanel} />
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className={[_s.d, _s.w100PC].join(' ')}>
        <div className={[_s.d, _s.flexRow, _s.w100PC, _s.overflowHidden].join(' ')}>
          <div className={[_s.d, _s.pr15, _s.w50PC].join(' ')}>
            <WrappedBundle component={TrendsHeadlinesPanel} />
            <WrappedBundle component={TrendsBreakingPanel} componentParams={{ hideReadMore: true }} />
            <WrappedBundle component={LatestFromGabPanel} />
          </div>
          <div className={[_s.d, _s.w50PC].join(' ')}>
            <WrappedBundle component={GabAdStatus} />
            <WrappedBundle component={PopularLinksPanel} />
            <WrappedBundle component={TrendsFeedsPanel} />
            <WrappedBundle component={GabNewsPanel} />
          </div>
        </div>
      </div>
    )
  }

}

const mapStateToProps = (state) => ({
  width: state.getIn(['settings', 'window_dimensions', 'width']),
})

News.propTypes = {
  isSmall: PropTypes.bool,
}

export default connect(mapStateToProps)(News)
