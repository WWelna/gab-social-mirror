import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { CX, MODAL_MEDIA } from '../constants'
import { openModal } from '../actions/modal'

const missingUrl = 'https://gab.com/headers/original/missing.png'

class Image extends React.PureComponent {
  state = {
    error: false
  }

  handleOnError = () => {
    const { onError } = this.props
    !!onError && onError()

    this.setState({ error: true })
  }
  
  handleOnLoad = () => {
    const { onLoad } = this.props
    !!onLoad && onLoad()
  }

  render() {
    const {
      alt,
      src,
      fit,
      className,
      nullable,
      isLazy,
      imageRef,
      expandOnClick,
      width,
      height,
      onMouseEnter,
      onMouseLeave
    } = this.props

    const { error } = this.state

    const classes = CX(className, {
      d: 1,
      objectFitCover: !!src && fit === 'cover',
      objectFitContain: !!src && fit === 'contain',
      bgSecondary: !src || error,
      cursorPointer: expandOnClick
    })

    //If error and not our own image
    if (error && nullable) {
      return null
    }

    if (!src) {
      return <div className={classes} />
    }

    let imageUrl

    if (error) {
      imageUrl = missingUrl
    } else if (typeof src === 'object' && src.name) {
      imageUrl = URL.createObjectURL(src)
    } else if (typeof src === 'string') {
      imageUrl = src
    }

    return (
      <img
        alt={alt}
        title={alt}
        className={classes}
        ref={imageRef}
        src={imageUrl}
        onError={this.handleOnError}
        onClick={this.props.onOpenMediaModal}
        loading={isLazy ? 'lazy' : undefined}
        width={width}
        height={height}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onLoad={this.handleOnLoad}
      />
    )
  }
}

const mapDispatchToProps = (dispatch, { alt, src, expandOnClick }) => ({
  onOpenMediaModal() {
    if (expandOnClick) {
      dispatch(openModal(MODAL_MEDIA, { alt, src }))
    }
  }
})

Image.propTypes = {
  alt: PropTypes.string,
  isLazy: PropTypes.bool,
  className: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  fit: PropTypes.oneOf(['contain', 'cover', 'tile', 'none']),
  nullable: PropTypes.bool,
  lazy: PropTypes.bool,
  imageRef: PropTypes.func,
  expandOnClick: PropTypes.bool,
  onOpenMediaModal: PropTypes.func.isRequired,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
}

Image.defaultProps = {
  width: '100%',
  fit: 'cover'
}

export default connect(null, mapDispatchToProps)(Image)
