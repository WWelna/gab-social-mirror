import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { fetchGabTVExplore } from '../../actions/news'
import TimelineInjectionLayout from './timeline_injection_layout'
import VideoItem from '../video_item'

class GabTVVideosInjection extends ImmutablePureComponent {

  componentDidMount() {
    if (!this.props.isFetched) {
      this.props.onFetchGabTVExplore()
    }
  }
  
  render() {
    const {
      items,
      isLoading,
      isFetched,
      isXS,
      injectionId,
		} = this.props

    const count = !!items ? items.count() : 0
    if (count === 0 && isFetched) return <div/>
    
    return (
      <TimelineInjectionLayout
        id={injectionId}
        title='Gab TV'
        buttonHref='https://tv.gab.com'
        buttonTitle='See more'
        isXS={isXS}
        >
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
        </TimelineInjectionLayout>
    )
  }

}

const mapStateToProps = (state) => ({
	items: state.getIn(['news', 'gab_tv_explore', 'items']),
	isFetched: state.getIn(['news', 'gab_tv_explore', 'isFetched']),
	isLoading: state.getIn(['news', 'gab_tv_explore', 'isLoading']),
})

const mapDispatchToProps = (dispatch) => ({
	onFetchGabTVExplore: () => dispatch(fetchGabTVExplore()),
})

GabTVVideosInjection.propTypes = {
	items: PropTypes.array,
	isFetched: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onFetchGroupsByTab: PropTypes.func.isRequired,
  injectionId: PropTypes.string.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(GabTVVideosInjection)