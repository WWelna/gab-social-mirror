import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { FormattedMessage } from 'react-intl'
import Video from '../video'

export const previewState = 'previewVideoModal'

class VideoModal extends ImmutablePureComponent {

  componentDidMount () {
    const { history } = this.props

    history.push(history.location.pathname, previewState)

    this.unlistenHistory = history.listen(() => {
      this.props.onClose()
    })
  }

  componentWillUnmount () {
    this.unlistenHistory()

    if (this.props.history.location.state === previewState) {
      this.props.history.goBack()
    }
  }

  handleStatusClick = e => {
    if (e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      this.props.history.push(`/${this.props.status.getIn(['account', 'acct'])}/posts/${this.props.status.get('id')}`)
    }
  }

  render () {
    const { media, status, time, onClose } = this.props

    const link = status && <a href={status.get('url')} onClick={this.handleStatusClick}><FormattedMessage id='lightbox.view_context' defaultMessage='View context' /></a>

    return (
      <div className='modal-root__modal video-modal'>
        <div>
          <Video
            preview={media.get('preview_url')}
            blurhash={media.get('blurhash')}
            src={media.get('url')}
            sourceMp4={media.get('url')}
            startTime={time}
            onCloseVideo={onClose}
            link={link}
            detailed
            alt={media.get('description')}
          />
        </div>
      </div>
    )
  }

}

VideoModal.propTypes = {
  media: ImmutablePropTypes.map.isRequired,
  status: ImmutablePropTypes.map,
  time: PropTypes.number,
  onClose: PropTypes.func.isRequired,
}

export default VideoModal
