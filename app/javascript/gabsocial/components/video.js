import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { defineMessages, injectIntl } from 'react-intl'
import { is } from 'immutable'
import videojs from 'video.js'
import { isPanoramic, isPortrait, minimumAspectRatio, maximumAspectRatio } from '../utils/media_aspect_ratio'
import { displayMedia } from '../initial_state'
import { CX } from '../constants'
import Button from './button'
import SensitiveMediaItem from './sensitive_media_item'

import '!style-loader!css-loader!video.js/dist/video-js.min.css'

const getVideoJSOptions = ({
  autoplay = undefined,
  muted = undefined,
  sources = [{}],
}) => ({
  autoplay,
  muted,
  sources,
  playbackRates: [0.5, 1, 1.5, 2],
  controls: true,
})

class Video extends ImmutablePureComponent {

  state = {
    containerWidth: this.props.width,
    revealed: this.props.visible !== undefined ? this.props.visible : (displayMedia !== 'hide_all' && !this.props.sensitive || displayMedia === 'show_all'),
  }

  componentWillUnmount() {
    if (this.videoPlayer) {
      this.videoPlayer.dispose()
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!is(nextProps.visible, this.props.visible) && nextProps.visible !== undefined) {
      this.setState({ revealed: nextProps.visible })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.revealed && !this.state.revealed && this.video) {
      this.video.pause()
    }
  }

  handleClickIfMuted() {
    if (this.videoPlayer && typeof this.props.muted !== 'undefined' && this.props.muted) {
      if(this.videoPlayer.muted()) {
        this.videoPlayer.muted(false); 
      }
    }
  }

  setPlayerRef = (n) => {
    this.player = n
    if (n) this.setState({ containerWidth: n.offsetWidth })
  }

  setVideoRef = (n) => {
    this.video = n
    this.setupVideo()
  }

  setupVideo = () => {
    if (!this.video) return null
    const {
      autoplay,
      fileContentType,
      muted,
      sourceMp4,
      src,
      shouldStopAllOtherPlayers,
    } = this.props
    
    this.videoPlayer = videojs(this.video, getVideoJSOptions({
      autoplay: typeof autoplay !== 'undefined' ? true : undefined,
      muted: typeof muted !== 'undefined' ? true : undefined,
      sources: [
        {
          src: sourceMp4,
          type: 'video/mp4',
        },
        {
          src,
          type: fileContentType || 'video/mp4',
        },
      ],
    }))

    if (shouldStopAllOtherPlayers) {
      this.videoPlayer.on('play', () => {
        this.stopAllOtherPlayers()
      })
    }
  }

  handleClickRoot = (e) => {
    e.stopPropagation() 
  }

  toggleReveal = () => {
    if (this.props.onToggleVisibility) {
      this.props.onToggleVisibility()
    } else {
      this.setState({ revealed: !this.state.revealed })
    }
  }

  stopAllOtherPlayers = () => {
    if (!this.props.shouldStopAllOtherPlayers) return

    const thisPlayerId = this.videoPlayer.id()
    const allPlayers = document.querySelectorAll('.video-js')

    allPlayers.forEach((playerEl) => {
      const playerElId = playerEl.getAttribute('id')
      if (playerElId !== thisPlayerId) {
        const otherVideo = playerEl.querySelector('video')
        if (otherVideo) otherVideo.pause()
      }
    })
  }

  render() {
    const {
      preview,
      src,
      inline,
      startTime,
      intl,
      alt,
      detailed,
      sensitive,
      aspectRatio,
      className,
    } = this.props

    const {
      containerWidth,
      revealed,
    } = this.state

    const playerStyle = {}

    let { width, height } = this.props

    if (inline && containerWidth) {
      width = containerWidth
      const minSize = containerWidth / (16 / 9)

      if (isPanoramic(aspectRatio)) {
        height = Math.max(Math.floor(containerWidth / maximumAspectRatio), minSize)
      } else if (isPortrait(aspectRatio)) {
        height = Math.max(Math.floor(containerWidth / minimumAspectRatio), minSize)
      } else {
        height = Math.floor(containerWidth / aspectRatio)
      }

      playerStyle.height = height
    }

    let preload

    if (startTime) {
      preload = 'auto'
    } else if (detailed) {
      preload = 'metadata'
    } else {
      preload = 'none'
    }

    if (!revealed && sensitive) {
      return (
        <SensitiveMediaItem
          onClick={this.toggleReveal}
          message='The author of this gab has added a warning to this video.'
          btnTitle='View'
        />
      )
    }

    const containerStyles = CX(className, {
      d: 1,
      // mt10: 1,
      w100PC: 1,
      h100PC: 1,
      outlineNone: 1,
    })

    return (
      <div
        className={containerStyles}
        style={playerStyle}
        ref={this.setPlayerRef}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        onClick={this.handleClickRoot}
        tabIndex={0}
      >
        <div data-vjs-player>
          <video
            className={[_s.d, _s.h100PC, _s.w100PC, _s.outlineNone, 'video-js'].join(' ')}
            ref={this.setVideoRef}
            playsInline
            poster={preview}
            preload={preload}
            role='button'
            tabIndex='0'
            aria-label={alt}
            title={alt}
            width={width}
            height={height}
            onClick={this.handleClickIfMuted.bind(this)}
          />
        </div>

        {
          revealed && sensitive &&
          <div className={[_s.posAbs, _s.z2, _s.top0, _s.right0, _s.mt10, _s.mr10].join(' ')}>
            <Button
              title={intl.formatMessage(messages.toggle_visible)}
              icon='hidden'
              backgroundColor='black'
              className={[_s.px10, _s.bgBlackOpaque_onHover].join(' ')}
              onClick={this.toggleReveal}
            />
          </div>
        }
      </div>
    )
  }
}

const messages = defineMessages({
  toggle_visible: { id: 'media_gallery.toggle_visible', defaultMessage: 'Hide media' },
})

Video.propTypes = {
  preview: PropTypes.string,
  sourceMp4: PropTypes.string,
  alt: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  sensitive: PropTypes.bool,
  startTime: PropTypes.number,
  detailed: PropTypes.bool,
  inline: PropTypes.bool,
  visible: PropTypes.bool,
  onToggleVisibility: PropTypes.func,
  intl: PropTypes.object.isRequired,
  blurhash: PropTypes.string,
  classes: PropTypes.array,
  aspectRatio: PropTypes.number,
  meta: ImmutablePropTypes.map,
  fileContentType: PropTypes.string,
  autoplay: PropTypes.string,
  muted: PropTypes.string,
  shouldStopAllOtherPlayers: PropTypes.bool,
}

export default injectIntl(Video)
