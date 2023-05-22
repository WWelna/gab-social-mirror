import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'
import {
  uploadMarketplaceListingMedia,
  deleteMarketplaceListingMedia,
} from '../../actions/marketplace_listing_editor'
import {
  MAX_MARKETPLACE_IMAGE_UPLOAD,
} from '../../constants'
import Text from '../text'
import ProgressBar from '../progress_bar'
import Button from '../button'
import FileInput from '../file_input'

class MarketplaceListingMediaUploadBlock extends ImmutablePureComponent {

  handleOnUpload = (e) => {
    this.props.onUpload(e.target.files[0])
  }

  handleOnDelete = (index) => {
    const { medias } = this.props
    if (!medias) return null
    const item = medias.get(index)
    if (!item) return null
    const mediaId = item.get('id') || null
    if (!mediaId) return null
    this.props.onDeleteMedia(mediaId)
  }

  getMediaUrl = (index) => {
    const { medias } = this.props
    if (!medias) return null
    const item = medias.get(index)
    if (!item) return null
    return item.get('preview_url') || null
  }

  render() {
    const {
      isUploading,
      isSubmitting,
      uploadProgress,
      isDisabled,
    } = this.props

    const inputDisabled = isSubmitting || isDisabled

    return (
      <div className={[_s.d, _s.px10, _s.border2PX, _s.borderColorSecondary, _s.radiusSmall].join(' ')}>
        <Text className={[_s.mt15, _s.pl5, _s.mb10].join(' ')} size='small' weight='medium' color='secondary'>
          Listing Images
        </Text>

        { isUploading && <ProgressBar small progress={uploadProgress} /> }

        <div className={[_s.d, _s.flexRow, _s.flexWrap].join(' ')}>
          <FileInputWrapper url={this.getMediaUrl(0)} index={0} onChange={this.handleOnUpload} onClear={() => this.handleOnDelete(0)} disabled={inputDisabled} />
          <FileInputWrapper url={this.getMediaUrl(1)} index={1} onChange={this.handleOnUpload} onClear={() => this.handleOnDelete(1)} disabled={inputDisabled} />
          <FileInputWrapper url={this.getMediaUrl(2)} index={2} onChange={this.handleOnUpload} onClear={() => this.handleOnDelete(2)} disabled={inputDisabled} />
          <FileInputWrapper url={this.getMediaUrl(3)} index={3} onChange={this.handleOnUpload} onClear={() => this.handleOnDelete(3)} disabled={inputDisabled} />
          <FileInputWrapper url={this.getMediaUrl(4)} index={4} onChange={this.handleOnUpload} onClear={() => this.handleOnDelete(4)} disabled={inputDisabled} />
          <FileInputWrapper url={this.getMediaUrl(5)} index={5} onChange={this.handleOnUpload} onClear={() => this.handleOnDelete(5)} disabled={inputDisabled} />
          <FileInputWrapper url={this.getMediaUrl(6)} index={6} onChange={this.handleOnUpload} onClear={() => this.handleOnDelete(6)} disabled={inputDisabled} />
          <FileInputWrapper url={this.getMediaUrl(7)} index={7} onChange={this.handleOnUpload} onClear={() => this.handleOnDelete(7)} disabled={inputDisabled} />
        </div>
        <Text className={[_s.mt5, _s.pl5, _s.mb15].join(' ')} size='small' color='tertiary'>
          (Optional) Max: 5MB. Accepted image types: .jpg, .png
        </Text>
      </div>
    )
  }

}

const FileInputWrapper = ({ index, url, isDisabled, onClear, onChange }) => (
  <div className={[_s.d, _s.pr10, _s.py10].join(' ')}>
    <FileInput
      hasClear
      id={`file-input-${index}`}
      file={url}
      fileType='image'
      onClear={onClear}
      onChange={onChange}
      disabled={isDisabled}
      accept='image/jpeg,image/png'
      width='158px'
      height='158px'
      isBordered
    />
  </div>
)

const mapStateToProps = (state) => ({
  medias: state.getIn(['marketplace_listing_editor', 'media_attachments']),
  isUploading: state.getIn(['marketplace_listing_editor', 'is_uploading']),
  isSubmitting: state.getIn(['marketplace_listing_editor', 'isSubmitting']),
  uploadProgress: state.getIn(['marketplace_listing_editor', 'progress'], 0),
})

const mapDispatchToProps = (dispatch) => ({
  onUpload(file) {
    dispatch(uploadMarketplaceListingMedia([file]))
  },
  onDeleteMedia(mediaId) {
    dispatch(deleteMarketplaceListingMedia(mediaId))
  },
})

MarketplaceListingMediaUploadBlock.propTypes = {
  isUploading: PropTypes.bool,
  isDisabled: PropTypes.bool,
  mediaIds: ImmutablePropTypes.list.isRequired,
  uploadProgress: PropTypes.number,
}

export default connect(mapStateToProps, mapDispatchToProps)(MarketplaceListingMediaUploadBlock)
