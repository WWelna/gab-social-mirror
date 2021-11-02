import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { injectIntl, defineMessages } from 'react-intl'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { fetchGabTVExplore } from '../../actions/news'
import PanelLayout from './panel_layout'
import VideoItem from '../video_item'

class GabTVVideosPanel extends ImmutablePureComponent {

  state = {
    fetched: false,
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.shouldLoad && !prevState.fetched) {
      return { fetched: true }
    }

    return null
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.fetched && this.state.fetched && this.props.isLazy) {
      this.props.dispatch(fetchGabTVExplore())
    }
  }

  componentDidMount() {
    if (!this.props.isLazy) {
      this.props.dispatch(fetchGabTVExplore())
      this.setState({ fetched: true })
    }
  }

  render() {
    const {
      intl,
      isLoading,
      items,
    } = this.props
    const { fetched } = this.state

    const count = !!items ? items.count() : 0
    if (count === 0 && fetched) return null

    return (
      <PanelLayout
        noPadding
        title={intl.formatMessage(messages.title)}
        headerButtonTitle={intl.formatMessage(messages.viewMore)}
        headerButtonHref='https://tv.gab.com'
        footerButtonTitle={intl.formatMessage(messages.viewMore)}
        footerButtonHref='https://tv.gab.com'
      >
        <div className={[_s.d, _s.borderTop1PX, _s.borderBottom1PX, _s.borderColorSecondary, _s.pt10, _s.w100PC].join(' ')}>
          {
            count > 0 &&
            items.slice(0, 8).map((video, i) => (
              <VideoItem
                id={video.get('id')}
                videoUrl={video.get('videoUrl')}
                title={video.get('title')}
                thumbnail={video.get('thumbnail')}
                created={video.get('created')}
                channelName={video.get('channelName')}
                channelAvatar={video.get('channelAvatar')}
                views={video.get('views')}
                duration={video.get('duration')}
                key={`gab-tv-panel-item-${i}`}
              />
            ))
          }
        </div>
      </PanelLayout>
    )
  }
}

const messages = defineMessages({
  title: { id: 'gab_tv_explore.title', defaultMessage: 'Gab TV' },
  viewMore: { id: 'view_more', defaultMessage: 'View more' },
})

const mapStateToProps = (state) => ({
  isLoading: state.getIn(['news', 'gab_tv_explore', 'isLoading']),
  isFetched: state.getIn(['news', 'gab_tv_explore', 'isFetched']),
  items: state.getIn(['news', 'gab_tv_explore', 'items']),
})

GabTVVideosPanel.propTypes = {
  intl: PropTypes.object.isRequired,
  isLazy: PropTypes.bool,
  isLoading: PropTypes.bool,
  isFetched: PropTypes.bool,
  items: ImmutablePropTypes.list.isRequired,
}

export default injectIntl(connect(mapStateToProps)(GabTVVideosPanel))