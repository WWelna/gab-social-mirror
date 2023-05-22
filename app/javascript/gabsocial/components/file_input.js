import React from 'react'
import PropTypes from 'prop-types'
import { CX } from '../constants'
import Icon from './icon'
import Image from './image'
import Text from './text'
import Button from './button'

class FileInput extends React.PureComponent {
  state = {
    file: this.props.file,
    hovering: false
  }

  componentDidUpdate(prevProps) {
    if (this.props.file !== prevProps.file) {
      this.setState({ file: this.props.file })
    }
  }

  handleOnClear = () => {
    const { onClear } = this.props
    !!onClear && onClear()
    this.setState({ file: null })
  }

  handleOnChange = e => {
    const { onChange } = this.props
    !!onChange && onChange(e)
    this.setState({ file: e.target.files[0] })
  }

  handleMouseLeave = () => {
    this.setState({ hovering: false })
  }

  handleMouseEnter = () => {
    this.setState({ hovering: true })
  }

  render() {
    const {
      id,
      fileType,
      disabled,
      title,
      height,
      width,
      className,
      isBordered,
      hasClear,
      accept
    } = this.props
    const { file, hovering } = this.state

    const containerClasses = CX(className, {
      d: 1,
      aiCenter: 1,
      cursorPointer: 1,
      jcCenter: 1,
      overflowHidden: 1,
      bgSecondary: 1,
      radiusSmall: isBordered,
      px10: isBordered,
      py10: isBordered,
      border2PX: isBordered,
      borderColorSecondary: isBordered,
      borderDashed: isBordered
    })

    const iconClasses = CX({
      cSecondary: !hovering && !disabled,
      cWhite: hovering
    })

    return (
      <div
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        {!!title && (
          <div className={[_s.d, _s.mb10, _s.pl15].join(' ')}>
            <Text size="small" weight="medium" color="secondary">
              {title}
            </Text>
          </div>
        )}

        <label
          className={containerClasses}
          htmlFor={`file-input-${id}`}
          style={{
            width,
            height
          }}
        >
          <Image
            alt={title || id}
            className={[_s.h100PC, _s.w100PC].join(' ')}
            src={file}
          />
          {(!file || hovering) && !disabled && (
            <div
              className={[
                _s.d,
                _s.posAbs,
                _s.cursorPointer,
                _s.top0,
                _s.bottom0,
                _s.left0,
                _s.right0,
                _s.aiCenter,
                _s.jcCenter,
                _s.bgBlackOpaquest_onHover
              ].join(' ')}
            >
              <Icon id="add-image" size="32px" className={iconClasses} />
            </div>
          )}
        </label>

        {hasClear && !!file && (
          <Button
            noClasses
            icon="close"
            iconSize="10px"
            iconClasses={_s.cWhite}
            onClick={this.handleOnClear}
            className={[
              _s.d,
              _s.outlineNone,
              _s.topRightRadiusSmall,
              _s.px10,
              _s.py10,
              _s.bgBlack,
              _s.bgBlackOpaque_onHover,
              _s.cursorPointer,
              _s.posAbs,
              _s.top0,
              _s.right0,
              _s.aiCenter,
              _s.jcCenter,
              _s.mt10,
              _s.mr10,
              _s.cWhite
            ].join(' ')}
          />
        )}

        <input
          id={`file-input-${id}`}
          className={_s.displayNone}
          disabled={disabled}
          onChange={this.handleOnChange}
          accept={accept}
          type="file"
        />
      </div>
    )
  }
}

FileInput.propTypes = {
  onChange: PropTypes.func,
  onClear: PropTypes.func,
  file: PropTypes.any,
  fileType: PropTypes.string,
  disabled: PropTypes.bool,
  title: PropTypes.string,
  id: PropTypes.string.isRequired,
  height: PropTypes.string,
  width: PropTypes.string,
  isBordered: PropTypes.bool,
  className: PropTypes.string,
  hasClear: PropTypes.bool,
  accept: PropTypes.string
}

FileInput.defaultProps = {
  fileType: 'image',
  isBordered: false
}

export default FileInput
