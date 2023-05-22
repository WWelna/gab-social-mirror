import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { injectIntl, defineMessages } from 'react-intl'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { List as ImmutableList } from 'immutable'
import { fetchGabTVExplore } from '../../actions/news'
import PanelLayout from './panel_layout'
import VideoItem from '../video_item'

class GabTVVideosPanel extends ImmutablePureComponent {
  render() {
    const { intl, items } = this.props
    const count = !!items && items.slice ? items.count() : 0
    if (count === 0) return null

    return (
      <PanelLayout
        key='gab-tv-videos-panel'
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
  items: state.getIn(['news', 'gab_tv_explore', 'items'], ImmutableList()),
})

GabTVVideosPanel.propTypes = {
  intl: PropTypes.object.isRequired,
  items: ImmutablePropTypes.list,
}

export default injectIntl(connect(mapStateToProps)(GabTVVideosPanel))
