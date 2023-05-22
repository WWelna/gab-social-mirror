import React from 'react'
import PropTypes from 'prop-types'
import { defineMessages, injectIntl } from 'react-intl'
import ReactSwipeableViews from 'react-swipeable-views'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { CX } from '../../constants'
import Button from '../button'
import ImageLoader from '../image_loader'
import Pagination from '../pagination'
import MediaGalleryItem from '../media_gallery_item'

class MediaModal extends ImmutablePureComponent {

  state = {
    index: null,
    changed: false,
    navigationHidden: false,
  }

  handleSwipe = (index) => {
    if (!this.props.media) return

    this.setState({ index: index % this.props.media.size, changed: true })
  }

  handleNextClick = () => {
    if (!this.props.media) return

    this.setState({ index: (this.getIndex() + 1) % this.props.media.size, changed: true })
  }

  handlePrevClick = () => {
    if (!this.props.media) return

    this.setState({ index: (this.props.media.size + this.getIndex() - 1) % this.props.media.size, changed: true })
  }

  handleChangeIndex = (i) => {
    if (!this.props.media) return

    this.setState({ index: i % this.props.media.size, changed: true })
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

  handleOnClose = ({ target }) => {
    if (!target) return
    if (!!target.getAttribute('data-swipeable') || target.getAttribute('role') === 'presentation') {
      this.props.onClose()
    }
  }

  render() {
    const {
      media,
      src,
      alt,
      intl,
      onClose,
      index: propIndex,
    } = this.props
    const { changed, navigationHidden } = this.state 

    const index = this.getIndex()

    const content = !media ?
      <ImageLoader
        previewSrc={src}
        src={src}
        alt={alt}
        key={src}
      /> :
      media.map((item, i) => {
        const isVideo = item.get('type') === 'video'
        const styles = isVideo ? {
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
        } : {}
        
        let width = item.getIn(['meta', 'original', 'width'])
        let height = item.getIn(['meta', 'original', 'height'])

        if (isVideo) {
          width = `${Math.min(600, window.innerWidth)}px`
          height = 'auto'
        }

        const autoplayVideo = isVideo && i === propIndex && propIndex !== undefined && !changed

        return (
          <MediaGalleryItem
            onClick={this.toggleNavigation}
            photo={{
              width,
              height,
              styles: {
                ...styles,
                maxWidth: '100%',
                maxHeight: '100vh',
              },
              src: isVideo ? item.get('preview_url') : item.get('url') || item.get('preview_url'),
              attachment: item,
              isInModal: 1,
              noBlurhash: 1,
              autoplayVideo,
            }}
          />
        )
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
          onClick={this.handleOnClose}
        >
          <ReactSwipeableViews
            style={swipeableViewsStyle}
            containerStyle={{
              alignItems: 'center',
              width: '100%',
              height: '100%',
            }}
            slideStyle={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
              className={[_s.py15, _s.boxShadowWhiteGlow].join(' ')}
            />
          </div>

          {
            !!media && media.size > 1 &&
            <Button
              tabIndex='0'
              backgroundColor='black'
              className={[_s.py15, _s.posFixed, _s.top50PC, _s.left0, _s.mt10, _s.ml10, _s.boxShadowWhiteGlow].join(' ')}
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
              className={[_s.py15, _s.posFixed, _s.top50PC, _s.right0, _s.mt10, _s.mr10, _s.boxShadowWhiteGlow].join(' ')}
              onClick={this.handleNextClick}
              aria-label={intl.formatMessage(messages.next)}
              icon='arrow-right'
              iconSize='18px'
            />
          }
        </div>

        {
          !!media && media.size > 1 &&
          <div className={[_s.d, _s.posAbs, _s.bottom0, _s.mb15].join(' ')}>
            <div className={navigationClasses}>
              <div className={[_s.d, _s.saveAreaInsetMB, _s.boxShadowWhiteGlow, _s.bgBlackOpaquer, _s.circle, _s.py10, _s.px15].join(' ')}>
                <Pagination
                  count={media.size}
                  activeIndex={index}
                  onClick={this.handleChangeIndex}          
                />
              </div>
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
  index: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
}

export default injectIntl(MediaModal)
