import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ProgressBar from '../../../components/progress_bar'
import Upload from './media_upload_item'
import Text from '../../../components/text'
import SensitiveMediaButton from './sensitive_media_button'

class UploadForm extends ImmutablePureComponent {

  state = {
    secondsSinceUploadStarted: 0,
    periodCount: 1,
  }

  uploadTimer = null
  periodTimer = null

  componentDidUpdate(prevProps) {
    // timer for placing progress periods "."
    if (this.props.uploadProgress === 100 && !this.periodTimer) {
      this.periodTimer = setInterval(() => {
        this.setState({ periodCount: this.state.periodCount === 3 ? 1 : this.state.periodCount + 1})
      }, 800)
    }
    if (this.periodTimer && !this.props.isUploading) {
      this.setState({ periodCount: 1 })
      clearInterval(this.periodTimer)
      this.periodTimer = null
    }

    // timer for counting seconds
    if (prevProps.uploadProgress === 0 && this.props.uploadProgress !== 0) {
      this.uploadTimer = setInterval(() => {
        this.setState({ secondsSinceUploadStarted: this.state.secondsSinceUploadStarted + 1})
      }, 1000)
    }
    if (this.uploadTimer && prevProps.uploadProgress > 0 && this.props.uploadProgress === 0) {
      this.setState({ secondsSinceUploadStarted: 0 })
      clearInterval(this.uploadTimer)
      this.uploadTimer = null
    }
  }

  componentWillUnmount() {
    // clear all
    clearInterval(this.uploadTimer)
    clearInterval(this.periodTimer)
    this.uploadTimer = null
    this.periodTimer = null
  }

  render () {
    const {
      mediaIds,
      isUploading,
      uploadProgress,
    } = this.props
    const { periodCount, secondsSinceUploadStarted } = this.state

    // make periods string
    const periods = Array.apply(null, { length: periodCount }).map(() => '.').join('')
    const subtitle = (uploadProgress === 100 && secondsSinceUploadStarted > 1) ? `Media uploaded. Now processing. Do not refresh the page, this may take a few seconds${periods}` : null
  
    return (
      <div className={_s.d}>
        { isUploading && <ProgressBar small progress={uploadProgress} /> }

        <div className={[_s.d, _s.flexRow, _s.flexWrap].join(' ')}>
          {mediaIds.map(id => (
            <Upload id={id} key={id} />
          ))}
        </div>
          
        { !mediaIds.isEmpty() && <SensitiveMediaButton /> }

        {
          isUploading && subtitle &&
          <Text size='small' color='secondary' className={_s.pt10}>
            {subtitle}
          </Text>
        }
      </div>
    )
  }

}

const mapStateToProps = (state) => ({
  mediaIds: state.getIn(['compose', 'media_attachments']).map(item => item.get('id')),
  isUploading: state.getIn(['compose', 'is_uploading']),
  uploadProgress: state.getIn(['compose', 'progress'], 0),
})

UploadForm.propTypes = {
  isUploading: PropTypes.bool,
  mediaIds: ImmutablePropTypes.list.isRequired,
  uploadProgress: PropTypes.number,
}

export default connect(mapStateToProps)(UploadForm)