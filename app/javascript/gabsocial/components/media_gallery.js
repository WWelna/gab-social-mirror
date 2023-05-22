import React from 'react'
import PropTypes from 'prop-types'
import Gallery from 'react-photo-gallery'
import { connect } from 'react-redux'
import { parse, format } from 'url'
import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { is } from 'immutable';
import { displayMedia } from '../initial_state'
import { BREAKPOINT_EXTRA_SMALL, CX } from '../constants'
import Button from './button'
import SensitiveMediaItem from './sensitive_media_item'
import MediaGalleryItem from './media_gallery_item'
import { isPanoramic, isPortrait, maximumAspectRatio, minimumAspectRatio } from '../utils/media_aspect_ratio'

class MediaGallery extends ImmutablePureComponent {

  state = {
    visible: this.props.visible !== undefined ? this.props.visible : (displayMedia !== 'hide_all' && !this.props.sensitive || displayMedia === 'show_all'),
    loaded: false,
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!is(nextProps.media, this.props.media) && nextProps.visible === undefined) {
      this.setState({
        visible: displayMedia !== 'hide_all' && !nextProps.sensitive || displayMedia === 'show_all',
      })
    } else if (!is(nextProps.visible, this.props.visible) && nextProps.visible !== undefined) {
      this.setState({ visible: nextProps.visible });
    }
  }

  handleOpen = () => {
    if (this.props.onToggleVisibility) {
      this.props.onToggleVisibility();
    } else {
      this.setState({ visible: !this.state.visible });
    }
  }

  handleClick = (e, { index }) => {
    this.props.onOpenMedia(this.props.media, index);
  }

  handleOnLoad = () => {
    this.setState({ loaded: true })
  }

  render() {
    const { media, sensitive, isXS, isComment, blurhashOnly } = this.props
    const { visible, loaded } = this.state

    const size = media.size

    let limitNodeSearch = size
    let targetRowHeight = 320 //default

    if (size === 8) {
      limitNodeSearch = 3
      targetRowHeight = 180
    } else if (size === 7) {
      limitNodeSearch = 3
      targetRowHeight = 200
    } else if (size === 6) {
      limitNodeSearch = 3
      targetRowHeight = 220
    } else if (size === 5) {
      limitNodeSearch = 4
      targetRowHeight = 240
    } else if (size === 4) {
      targetRowHeight = 260
    } else if (size === 3) {
      targetRowHeight = 280
    }

    if (isXS) {
      limitNodeSearch = size
      targetRowHeight = targetRowHeight - 40
    }
    if (isComment) {
      targetRowHeight = targetRowHeight - 40
    }
    
    let minHeight = targetRowHeight * limitNodeSearch

    const children = media.map((attachment) => {
      let src = attachment.get('preview_url')
      if (attachment.get('type') === 'image') {
        const originalUrl = attachment.get('url');
        if (!!originalUrl && (process.env.NODE_ENV === 'production' || [true, "true", 1, "1"].includes(process.env.CF_RESIZE))) {
          const parts = parse(originalUrl)
          const previewWidth = (isXS ? 420 : 700) * window.devicePixelRatio
          const resizePart = `/cdn-cgi/image/width=${previewWidth},quality=100,fit=scale-down`
          parts.pathname = `${resizePart}${parts.pathname}`
          src = format(parts)
        }
      }
      
      let height
      const width = attachment.getIn(['meta', 'small', 'width'])
      
      if (size === 1) {
        const aspectRatio = attachment.getIn(['meta', 'small', 'aspect']);
        if (isPanoramic(aspectRatio)) {
          height = Math.floor(width / maximumAspectRatio)
        } else if (isPortrait(aspectRatio)) {
          height = Math.floor(width / minimumAspectRatio)
        } else {
          height = Math.floor(width / aspectRatio)
        }
        minHeight = height
      } else {
        height = Math.min(attachment.getIn(['meta', 'small', 'height']), 600)
      }

      return {
        attachment,
        size,
        src,
        blurhashOnly,
        height,
        width,
        onLoad: this.handleOnLoad,
      }
    }).toJS()
  
    const containerClasses = CX({
      d: 1,
      displayBlock: 1,
      overflowHidden: 1,
      borderColorSecondary: size === 1 && visible,
      borderTop1PX: size === 1 && visible,
      borderBottom1PX: size === 1 && visible,
    })

    return (
      <div className={containerClasses}>
        {
          !visible && sensitive &&
          <SensitiveMediaItem
            onClick={this.handleOpen}
            message='The author of this gab has added a warning to this media.'
            btnTitle='View'
          />
        }
        
        {
          visible &&
          <div
            className={[_s.d, _s.displayBlock, _s.w100PC, _s.h100PC, _s.overflowHidden].join(' ')}
            style={!loaded ? {minHeight: `${minHeight}px`} : undefined}
          >
            <Gallery
              margin={1}
              limitNodeSearch={limitNodeSearch}
              targetRowHeight={targetRowHeight}
              photos={children}
              renderImage={MediaGalleryItem}
              onClick={this.handleClick}
            />
          </div>
        }

        {
          visible && sensitive &&
          <div className={[_s.posAbs, _s.z2, _s.top0, _s.right0, _s.mt10, _s.mr10].join(' ')}>
            <Button
              title='Hide media'
              icon='hidden'
              backgroundColor='black'
              className={[_s.px10, _s.bgBlackOpaque_onHover].join(' ')}
              onClick={this.handleOpen}
            />
          </div>
        }
      </div>
    )
  }

}

const mapStateToProps = (state) => ({
  isXS: state.getIn(['settings', 'window_dimensions', 'width']) <= BREAKPOINT_EXTRA_SMALL,
})

MediaGallery.propTypes = {
  sensitive: PropTypes.bool,
  media: ImmutablePropTypes.list.isRequired,
  size: PropTypes.object,
  onOpenMedia: PropTypes.func,
  visible: PropTypes.bool,
  onToggleVisibility: PropTypes.func,
  reduced: PropTypes.bool,
  isComment: PropTypes.bool,
  blurhashOnly: PropTypes.bool,
}

export default connect(mapStateToProps)(MediaGallery)