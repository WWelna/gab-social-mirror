import React from 'react'
import PropTypes from 'prop-types'
import { defineMessages, injectIntl } from 'react-intl'
import ReactSwipeableViews from 'react-swipeable-views'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { CX } from '../../constants'
import Video from '../video'
import ExtendedVideoPlayer from '../extended_video_player'
import Button from '../button'
import ImageLoader from '../image_loader'
import Pagination from '../pagination'

export const previewState = 'previewMediaModal'

class MediaModal extends ImmutablePureComponent {

  state = {
    index: null,
    navigationHidden: false,
  }

  handleSwipe = (index) => {
    if (!this.props.media) return

    this.setState({ index: index % this.props.media.size })
  }

  handleNextClick = () => {
    if (!this.props.media) return

    this.setState({ index: (this.getIndex() + 1) % this.props.media.size })
  }

  handlePrevClick = () => {
    if (!this.props.media) return

    this.setState({ index: (this.props.media.size + this.getIndex() - 1) % this.props.media.size })
  }

  handleChangeIndex = (i) => {
    if (!this.props.media) return

    this.setState({ index: i % this.props.media.size })
  }

  handleKeyDown = (e) => {
    if (!this.props.media) return

    switch (e.key) {
      case 'ArrowLeft':
        this.handlePrevClick()
        e.preventDefault()
        e.stopPropagation()
        break
      case 'ArrowRight':
        this.handleNextClick()
        e.preventDefault()
        e.stopPropagation()
        break
    }
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown, false)
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown)
  }

  getIndex() {
    return this.state.index !== null ? this.state.index : this.props.index
  }

  toggleNavigation = () => {
    this.setState(prevState => ({
      navigationHidden: !prevState.navigationHidden,
    }))
  }

  handleStatusClick = e => {
    if (e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      this.props.history.push(`/${this.props.status.getIn(['account', 'acct'])}/posts/${this.props.status.get('id')}`)
    }
  }

  render() {
    const {
      media,
      src,
      alt,
      status,
      intl,
      onClose,
    } = this.props
    const { navigationHidden } = this.state

    const index = this.getIndex()

    const content = !media ?
      <ImageLoader
        previewSrc={src}
        src={src}
        alt={alt}
        key={src}
      /> :
      media.map((image) => {
        const width = image.getIn(['meta', 'original', 'width']) || null
        const height = image.getIn(['meta', 'original', 'height']) || null

        if (image.get('type') === 'image') {
          return (
            <ImageLoader
              previewSrc={image.get('preview_url')}
              src={image.get('url')}
              width={width}
              height={height}
              alt={image.get('description')}
              key={image.get('url')}
              onClick={this.toggleNavigation}
            />
          )
        } else if (image.get('type') === 'video') {
          const { time } = this.props

          return (
            <Video
              preview={image.get('preview_url')}
              blurhash={image.get('blurhash')}
              src={image.get('url')}
              width={image.get('width')}
              height={image.get('height')}
              startTime={time || 0}
              onCloseVideo={onClose}
              detailed
              alt={image.get('description')}
              key={image.get('url')}
            />
          )
        } else if (image.get('type') === 'gifv') {
          return (
            <ExtendedVideoPlayer
              src={image.get('url')}
              muted
              controls={false}
              width={width}
              height={height}
              key={image.get('preview_url')}
              alt={image.get('description')}
              onClick={this.toggleNavigation}
            />
          )
        }

        return null
      }).toArray()

    // you can't use 100vh, because the viewport height is taller
    // than the visible part of the document in some mobile
    // browsers when it's address bar is visible.
    // https://developers.google.com/web/updates/2016/12/url-bar-resizing
    const swipeableViewsStyle = {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'center',
    }

    const navigationClasses = CX({
      d: 1,
      displayNone: navigationHidden,
    })

    return (
      <div className={[_s.d, _s.w100PC, _s.h100PC, _s.aiCenter, _s.jcCenter].join(' ')}>
        <div
          className={[_s.d, _s.posAbs, _s.top0, _s.right0, _s.bottom0, _s.left0].join(' ')}
          role='presentation'
          onClick={onClose}
        >
          <ReactSwipeableViews
            style={swipeableViewsStyle}
            containerStyle={{
              alignItems: 'center',
              width: '100%',
              height: '100%',
            }}
            slideStyle={{
              height: '100%',
            }}
            onChangeIndex={this.handleSwipe}
            onSwitching={this.handleSwitching}
            index={index}
          >
            {content}
          </ReactSwipeableViews>
        </div>

        <div className={navigationClasses}>
          <div className={[_s.posFixed, _s.top0, _s.right0, _s.mt10, _s.mr10, _s.saveAreaInsetPT, _s.saveAreaInsetPR].join(' ')}>
            <Button
              title={intl.formatMessage(messages.close)}
              icon='close'
              backgroundColor='black'
              onClick={onClose}
              iconSize='14px'
              className={_s.py15}
            />
          </div>

          {
            !!media && media.size > 1 &&
            <Button
              tabIndex='0'
              backgroundColor='black'
              className={[_s.py15, _s.posFixed, _s.top50PC, _s.left0, _s.mt10, _s.ml10].join(' ')}
              onClick={this.handlePrevClick}
              aria-label={intl.formatMessage(messages.previous)}
              icon='arrow-left'
              iconSize='18px'
            />
          }

          {
            !!media && media.size > 1 &&
            <Button
              tabIndex='0'
              backgroundColor='black'
              className={[_s.py15, _s.posFixed, _s.top50PC, _s.right0, _s.mt10, _s.mr10].join(' ')}
              onClick={this.handleNextClick}
              aria-label={intl.formatMessage(messages.next)}
              icon='arrow-right'
              iconSize='18px'
            />
          }

          { /** : todo : 
            status &&
            <div className={classNames('media-modal__meta', { 'media-modal__meta--shifted': media.size > 1 })}>
              <a href={status.get('url')} onClick={this.handleStatusClick}>
                {intl.formatMessage(messages.viewContext)}
              </a>
            </div>
            */
          }

        </div>

        {
          !!media && media.size > 1 &&
          <div className={[_s.d, _s.posAbs, _s.bottom0, _s.mb15].join(' ')}>
            <div className={[_s.d, _s.saveAreaInsetMB, _s.bgBlackOpaque, _s.circle, _s.py10, _s.px15].join(' ')}>
              <Pagination
                count={media.size}
                activeIndex={index}
                onClick={this.handleChangeIndex}          
              />
            </div>
          </div>
        }
      </div>
    )
  }

}

const messages = defineMessages({
  close: { id: 'lightbox.close', defaultMessage: 'Close' },
  previous: { id: 'lightbox.previous', defaultMessage: 'Previous' },
  next: { id: 'lightbox.next', defaultMessage: 'Next' },
  viewContext: { id: 'lightbox.view_context', defaultMessage: 'View context' },
})

MediaModal.propTypes = {
  media: ImmutablePropTypes.list.isRequired,
  status: ImmutablePropTypes.map,
  index: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
}

export default injectIntl(MediaModal)
