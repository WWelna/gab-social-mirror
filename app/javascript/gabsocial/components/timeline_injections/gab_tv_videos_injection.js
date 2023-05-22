import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { List as ImmutableList } from 'immutable'
import TimelineInjectionLayout from './timeline_injection_layout'
import VideoItem from '../video_item'

class GabTVVideosInjection extends ImmutablePureComponent {
  render() {
    const { items, isFetched, isXS, injectionId } = this.props

    const count = !!items ? items.count() : 0
    if (count === 0 && isFetched) return <div />

    return (
      <TimelineInjectionLayout
        id={injectionId}
        title="Gab TV"
        buttonHref="https://tv.gab.com"
        buttonTitle="See more"
        isXS={isXS}
      >
        {items.slice(0, 8).map((video, i) => (
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
        ))}
      </TimelineInjectionLayout>
    )
  }
}

const mapStateToProps = state => ({
  items: state.getIn(['news', 'gab_tv_explore', 'items'], ImmutableList()),
  isFetched: state.getIn(['news', 'gab_tv_explore', 'isFetched']),
  isLoading: state.getIn(['news', 'gab_tv_explore', 'isLoading'])
})

GabTVVideosInjection.propTypes = {
  items: PropTypes.array,
  isFetched: PropTypes.bool,
  isLoading: PropTypes.bool,
  onFetchGroupsByTab: PropTypes.func,
  injectionId: PropTypes.string
}

export default connect(mapStateToProps)(GabTVVideosInjection)
