import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import StatusCard from './status_card'
import { MediaGallery } from '../features/ui/util/async_components'
import Poll from './poll'

// We use the component (and not the container) since we do not want
// to use the progress bar to show download progress
import Bundle from '../features/ui/util/bundle'

class StatusMedia extends ImmutablePureComponent {

  // Avoid checking props that are functions (and whose equality will always
  // evaluate to false. See react-immutable-pure-component for usage.
  updateOnProps = [
    'status',
    'isChild',
    'isComment',
    'defaultWidth',
    'visible',
    'width',
    'isComposeModalOpen',
  ]

  renderLoadingMedia() {
    return <div className={_s.backgroundColorPanel} style={{ height: '110px' }} />
  }

  render() {
    const {
      status,
      isChild,
      isComment,
      onOpenMedia,
      onOpenVideo,
      width,
      onToggleVisibility,
      visible,
      defaultWidth,
      isComposeModalOpen,
      isStatusCard,
    } = this.props

    if (!status) return null

    let media = []
    const statusId = status.get('id')

    if (status.get('media_attachments').size > 0) {
      media.push(
        <Bundle
          key={`status-${statusId}-gallery`}
          fetchComponent={MediaGallery}
          loading={this.renderLoadingMedia}
        >
          {Component => (
            <Component
              isComment={isComment}
              reduced={isChild}
              media={status.get('media_attachments')}
              sensitive={status.get('sensitive')}
              onOpenMedia={onOpenMedia}
              defaultWidth={defaultWidth}
              visible={visible}
              onToggleVisibility={onToggleVisibility}
            />
          )}
        </Bundle>
      )
    } else {
      if (status.get('spoiler_text').length === 0 && status.get('card')) {
        media.push(
          <div key={`status-${statusId}-card`} className={[_s.d, _s.px10].join(' ')}>
            <StatusCard
              card={status.get('card')}
              onOpenMedia={onOpenMedia}
              defaultWidth={defaultWidth}
              isVertical={isComment || isChild}
              isReduced={isStatusCard || isComposeModalOpen}
            />
          </div>
        )
      }
    }
    
    if (status.get('poll')) {
      media.push(<Poll  key={`status-${statusId}-poll`} pollId={status.get('poll')} />)
    }

    if (!media.length) return null

    if (media.length > 1) {
      // if you have multiple elements space them out
      media = media.map((item, index) =>
        <div
          key={`status-${statusId}-spacer-${index}`}
          className={_s.mt5}
        >{item}</div>
      )
    }

    return <div className={_s.mt5}>{media}</div>
  }

}

StatusMedia.propTypes = {
  status: ImmutablePropTypes.map,
  isChild: PropTypes.bool,
  isComment: PropTypes.bool,
  onOpenMedia: PropTypes.func,
  onOpenVideo: PropTypes.func,
  width: PropTypes.number,
  onToggleVisibility: PropTypes.func,
  visible: PropTypes.bool,
  defaultWidth: PropTypes.number,
  isComposeModalOpen: PropTypes.bool,
  isStatusCard: PropTypes.bool,
}

export default StatusMedia
