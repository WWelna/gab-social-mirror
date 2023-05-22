import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePureComponent from 'react-immutable-pure-component'
import get from 'lodash.get'
import { defineMessages, injectIntl } from 'react-intl'
import Button from '../../../components/button'
import Image from '../../../components/image'
import Input from '../../../components/input'
import Text from '../../../components/text'
import { CX } from '../../../constants'

const errorMessageClasses = CX(
  'd',
  'posAbs',
  'py15',
  'pl15',
  'pr50',
  'cError',
  'bgTertiary',
  'text'
)

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

const VideoPreview = React.memo(
  ({ previewClasses, src }) => (
    <video className={previewClasses} src={tryFormatSrc(src)} muted autoPlay />
  ),
  (prevProps, nextProps) =>
    get(prevProps, 'src.name') !== get(nextProps, 'src.name')
)

class Upload extends ImmutablePureComponent {
  state = {
    hovering: false,
    focused: false,
    description:
      typeof this.props.file.description === 'string'
        ? this.props.file.description
        : ''
  }

  handleInputChange = description => this.setState({ description })

  handleMouseEnter = () => this.setState({ hovering: true })
  handleMouseLeave = () => this.setState({ hovering: false })
  handleInputFocus = () => this.setState({ focused: true })
  handleInputBlur = () => {
    this.setState({ focused: false })
    this.props.onFileChange(this.props.index, this.state.description)
  }
  handleClick = evt => {
    if (this.ref && this.ref.focus) this.ref.focus()
    this.setState({ focused: true })
    evt.preventDefault()
    evt.stopPropagation()
  }
  handleRemove = () => this.props.onFileRemove(this.props.index)

  setRef = ref => (this.ref = ref)

  render() {
    const { intl, file, index, isUploading } = this.props
    const { hovering, focused, description } = this.state
    const active = hovering || focused

    let preview
    const src = file.preview_url || file.url || file || file
    const hasError =
      typeof file === 'object' &&
      typeof file.error === 'string' &&
      file.error.length > 0
    const previewClasses = CX({
      d: true,
      minH106PX: !hasError,
      maxH100VH: !hasError
    })

    if (file.type.startsWith('video/')) {
      preview = <VideoPreview className={previewClasses} src={src} />
    } else {
      preview = <Image className={previewClasses} src={src} />
    }

    return (
      <div
        className={[_s.d, _s.w100PC, _s.mt10].join(' ')}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        onClick={this.handleClick}
        role="button"
      >
        <div
          className={CX({
            d: true,
            radiusSmall: true,
            borderColorSecondary: true,
            border1PX: true,
            overflowHidden: true,
            maxH100VH: !hasError,
            minH106PX: !hasError
          })}
        >
          {preview}
          {hovering && !hasError && (
            <div
              className={[
                _s.d,
                _s.posAbs,
                _s.z2,
                _s.top0,
                _s.bottom0,
                _s.right0,
                _s.left0,
                _s.bgBlackOpaquest
              ].join(' ')}
            />
          )}
          {file.type === 'gifv' && (
            <div
              className={[
                _s.d,
                _s.posAbs,
                _s.z3,
                _s.radiusSmall,
                _s.bgBlackOpaque,
                _s.px5,
                _s.py5,
                _s.ml10,
                _s.mt10,
                _s.bottom0,
                _s.right0
              ].join(' ')}
            >
              <Text size="extraSmall" color="white" weight="medium">
                GIF
              </Text>
            </div>
          )}
          <div
            className={[
              _s.d,
              _s.posAbs,
              _s.px15,
              _s.pt15,
              _s.z3,
              _s.flexRow,
              _s.top0,
              _s.left0,
              _s.right0
            ].join(' ')}
          >
            {active && !hasError && (
              <div className={[_s.d, _s.flexGrow1, _s.mr15].join(' ')}>
                <Input
                  small
                  hideLabel
                  id={`input-${file.name}-${index}`}
                  title={intl.formatMessage(messages.description)}
                  placeholder={intl.formatMessage(messages.description)}
                  value={description}
                  maxLength={420}
                  onFocus={this.handleInputFocus}
                  onChange={this.handleInputChange}
                  onBlur={this.handleInputBlur}
                  inputRef={this.setRef}
                />
              </div>
            )}
            {!isUploading && (
              <Button
                backgroundColor="black"
                color="white"
                title={intl.formatMessage(messages.delete)}
                onClick={this.handleRemove}
                icon="close"
                iconSize="10px"
                iconClassName={_s.inherit}
                className={[_s.mlAuto, _s.px10].join(' ')}
              />
            )}
          </div>
          {hasError && <div className={errorMessageClasses}>{file.error}</div>}
        </div>
      </div>
    )
  }
}

const messages = defineMessages({
  description: {
    id: 'upload_form.description',
    defaultMessage: 'Describe for the visually impaired'
  },
  delete: { id: 'upload_form.undo', defaultMessage: 'Delete' }
})

Upload.propTypes = {
  intl: PropTypes.object,
  file: PropTypes.object,
  onFileChange: PropTypes.func,
  onFileRemove: PropTypes.func,
  isUploading: PropTypes.bool
}

export default injectIntl(Upload)
