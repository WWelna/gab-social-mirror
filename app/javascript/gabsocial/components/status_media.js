import React from 'react'
import PropTypes from 'prop-types'
import { injectIntl } from 'react-intl'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import StatusCard from './status_card'
import { MediaGallery, Video } from '../features/ui/util/async_components'
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
    'cacheWidth',
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
      cacheWidth,
      isComposeModalOpen,
      isStatusCard,
    } = this.props

    if (!status) return null

    let media = []

    if (status.get('media_attachments').size > 0) {
      if (status.getIn(['media_attachments', 0, 'type']) === 'video') {
        const video = status.getIn(['media_attachments', 0])

        media.push(
          <Bundle fetchComponent={Video} loading={this.renderLoadingMedia}>
            {Component => (
              <Component
                inline
                isComment={isComment}
                preview={video.get('preview_url')}
                blurhash={video.get('blurhash')}
                src={video.get('url')}
                sourceMp4={video.get('source_mp4')}
                alt={video.get('description')}
                aspectRatio={video.getIn(['meta', 'small', 'aspect'])}
                fileContentType={video.get('file_content_type')}
                sensitive={status.get('sensitive')}
                height={110}
                width={width}
                onOpenVideo={onOpenVideo}
                cacheWidth={cacheWidth}
                visible={visible}
                onToggleVisibility={onToggleVisibility}
                meta={video.get('meta')}
              />
            )}
          </Bundle>
        )
      } else {
        media.push(
          <Bundle fetchComponent={MediaGallery} loading={this.renderLoadingMedia}>
            {Component => (
              <Component
                isComment={isComment}
                reduced={isChild}
                media={status.get('media_attachments')}
                sensitive={status.get('sensitive')}
                onOpenMedia={onOpenMedia}
                cacheWidth={cacheWidth}
                defaultWidth={defaultWidth}
                visible={visible}
                onToggleVisibility={onToggleVisibility}
              />
            )}
          </Bundle>
        )
      }
    } else {
      if (status.get('spoiler_text').length === 0 && status.get('card')) {
        media.push(
          <StatusCard
            card={status.get('card')}
            onOpenMedia={onOpenMedia}
            cacheWidth={cacheWidth}
            defaultWidth={defaultWidth}
            isVertical={isComment || isChild}
            isReduced={isStatusCard || isComposeModalOpen}
          />
        )
      }
    }
    
    if (status.get('poll')) {
      media.push(<Poll pollId={status.get('poll')} />)
    }

    return media
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
  cacheWidth: PropTypes.func,
  isComposeModalOpen: PropTypes.bool,
  isStatusCard: PropTypes.bool,
}

export default StatusMedia
