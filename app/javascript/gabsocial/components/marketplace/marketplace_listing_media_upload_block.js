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

  state = {
    count: 1,
  }

  handleOnUpload = (e) => {
    this.props.onUpload(e.target.files[0])
  }

  handleOnDelete = (mediaId) => {
    this.props.onDeleteMedia(mediaId)
  }

  handleOnAppend = () => {
    this.setState({ count: Math.min(this.state.count + 1, MAX_MARKETPLACE_IMAGE_UPLOAD) })  
  }

  render() {
    const {
      medias,
      isUploading,
      isSubmitting,
      uploadProgress,
      isDisabled,
    } = this.props
    const { count, nulled } = this.state
    
    return (
      <div className={[_s.d, _s.px10, _s.border2PX, _s.borderColorSecondary, _s.radiusSmall].join(' ')}>
        <Text className={[_s.mt15, _s.pl5, _s.mb10].join(' ')} size='small' weight='medium' color='secondary'>
          Listing Images
        </Text>

        { isUploading && <ProgressBar small progress={uploadProgress} /> }

        <div className={[_s.d, _s.flexRow, _s.flexWrap].join(' ')}>
          {!!medias && medias.map((item, i) => (
            <div className={[_s.d, _s.pr10, _s.py10].join(' ')} key={`mpl-media-${i}-${item.get('id')}`}>
              <FileInput
                hasClear
                disabled
                onClear={() => this.handleOnDelete(item.get('id'))}
                onChange={this.handleOnUpload}
                id='marketplace-listing-cover-photo'
                file={item.get('preview_url')}
                width='158px'
                height='158px'
                isBordered
              />
            </div>
          ))}

          {
            Array.apply(null, {
              length: count - medias.size
            }).map((_, i) => (
            <div className={[_s.d, _s.pr10, _s.py10].join(' ')} key={`mpl-file-upload-${i}`}>
              <FileInput
                hasClear
                file={null}
                id={`file-input-${count}`}
                onChange={this.handleOnUpload}
                disabled={isSubmitting || isDisabled}
                width='158px'
                height='158px'
                isBordered
              />
            </div>
          ))}
          {
            count !== MAX_MARKETPLACE_IMAGE_UPLOAD &&
            <div className={[_s.d, _s.pr10, _s.py10].join(' ')}>
              <Button
                noClasses
                className={[_s.d, _s.w158PX, _s.h158PX, _s.cursorPointer, _s.radiusSmall, _s.outlineNone, _s.bgSecondary, _s.bgSecondaryDark_onHover, _s.aiCenter, _s.jcCenter, _s.cSecondary, _s.cWhite_onHover].join(' ')}
                icon='add'
                iconSize='20px'
                isDisabled={isDisabled}
                onClick={this.handleOnAppend}
              />
            </div>
          }
        </div>
        <Text className={[_s.mt5, _s.pl5, _s.mb15].join(' ')} size='small' color='tertiary'>
          (Optional) Max: 5MB. Accepted image types: .jpg, .png
        </Text>
      </div>
    )
  }

}

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
