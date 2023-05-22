import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePureComponent from 'react-immutable-pure-component'
import get from 'lodash/get'
import { connect } from 'react-redux'
import { openPopover } from '../../../actions/popover'
import Button from '../../../components/button'
import GifBadge from '../../../components/gif_badge'
import Icon from '../../../components/icon'
import { CX, POPOVER_COMPOSE_MEDIA_DESCRIPTION } from '../../../constants'

function tryFormatSrc(src) {
  let op = src
  try {
    // createObjectURL can fail
    // e.g. TypeError: Failed to execute 'createObjectURL' on 'URL': Overload resolution failed.
    op = typeof src === 'object' ? URL.createObjectURL(src) : src
  } catch (err) {
    console.error('error creating object url', err)
  }
  return op
}

class MediaUploadItem extends ImmutablePureComponent {
  state = {
    description: get(this.props, 'file.description', ''),
  }

  handleOnFileChange = (index, description) => {
    this.setState({ description })
    this.props.onFileChange(index, description)
  }

  handleOnClick = () => {
    const { dispatch, index, onFileChange } = this.props
    const { description } = this.state

    if (!onFileChange) return

    dispatch(openPopover(POPOVER_COMPOSE_MEDIA_DESCRIPTION, {
      index,
      description,
      targetRef: this.node,
      onConfirm: this.handleOnFileChange,
      useProximity: false,
      position: 'right',
    }))
  }

  handleRemove = () => {
    this.props.onFileRemove(this.props.index)
  }

  setRef = (r) => {
    this.node = r
  }

  render() {
    const { file, isUploading } = this.props
    
    const isVideo = file.type.indexOf('video') > -1
    let src = !isVideo ? file.url || file.preview_url || file : file.preview_url || file.url || file
    src = tryFormatSrc(src)
    const isBlob = typeof src === 'string' ? src.startsWith('blob:') : false
    const showVideo = isBlob && isVideo

    const hasError = typeof file === 'object' && typeof file.error === 'string' && file.error.length > 0
    // const errorMsg = hasError ? file.error || 'Error' : null
    const containerClasses = CX({
      d: 1,
      h158PX: 1,
      wAuto: 1,
      minW76PX: 1,
      maxW100PC: 1,
      mt10: 1,
      mr10: 1,
      cursorPointer: 1,
      aiCenter: 1,
      radiusSmall: 1,
      border2PX: hasError,
      borderColorError: hasError,
    })

    return (
      <div
        className={containerClasses}
        onClick={this.handleOnClick}
        ref={this.setRef}
        role="button"
      >
        <div className={[_s.d, _s.radiusSmall, _s.borderColorSecondary, _s.border1PX, _s.overflowHidden, _s.h100PC].join(' ')}>
          { !showVideo && <img className={[_s.d, _s.h100PC, _s.w100PC, _s.objectFitCover].join(' ')} src={src} /> }
          { showVideo && <video className={[_s.d, _s.h100PC].join(' ')} src={src} /> }

          { file.type.indexOf('gif') > -1 && <GifBadge /> }
          { (isVideo && !hasError) && (
            <div className={[_s.d, _s.posAbs, _s.top0, _s.bottom0, _s.right0, _s.left0, _s.aiCenter, _s.jcCenter].join(' ')}>
              <div className={[_s.d, _s.aiCenter, _s.jcCenter, _s.circle, _s.w50PX, _s.h50PX, _s.border2PX, _s.borderColorWhite].join(' ')}>
                <Icon id='play' className={_s.cWhite} size='16px' />
              </div>
            </div>
          )}

          {
            hasError && 
            <div className={[_s.d, _s.posAbs, _s.top0, _s.bottom0, _s.right0, _s.left0, _s.aiCenter, _s.jcCenter].join(' ')}>
              <div className={[_s.d, _s.aiCenter, _s.jcCenter, _s.circle, _s.w50PX, _s.h50PX, _s.border2PX, _s.borderColorError, _s.bgBlackOpaque].join(' ')}>
                <Icon id='error' className={_s.cError} size='26px' />
              </div>
            </div>
          }

          {
            !isUploading && (
            <div className={[_s.d, _s.posAbs, _s.pr5, _s.pt5, _s.z3, _s.flexRow, _s.top0, _s.left0, _s.right0].join(' ')}>
              <Button
                backgroundColor="black"
                color="white"
                title='Delete'
                onClick={this.handleRemove}
                icon="close"
                iconSize="10px"
                iconClassName={_s.inherit}
                className={[_s.mlAuto, _s.px10].join(' ')}
              />
            </div>
          )}
        </div>
      </div>
    )
  }
}

MediaUploadItem.propTypes = {
  file: PropTypes.object,
  index: PropTypes.string,
  onFileChange: PropTypes.func,
  onFileRemove: PropTypes.func,
  isUploading: PropTypes.bool
}

export default connect()(MediaUploadItem)