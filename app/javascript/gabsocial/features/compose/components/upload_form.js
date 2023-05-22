import React from 'react'
import PropTypes from 'prop-types'
import MediaUploadItem from './media_upload_item'
import SensitiveMediaButton from './sensitive_media_button'
import ProgressBar from '../../../components/progress_bar'
import Text from '../../../components/text'

const UploadForm = ({
  media_attachments,
  isUploading,
  onFileChange,
  onFileRemove,
  onSensitive,
  sensitive,
  uploadProgress
}) => (
  // {
  //   hasError && (
  //   <div className={[_s.d, _s.posAbs, _s.py15, _s.pl15, _s.pr50, _s.cError, _s.bgTertiary, _s.text].join(' ')}>
  //     {file.error}
  //   </div>
  // )}
  <div className={_s.d}>
    {isUploading && media_attachments.length > 0 && (
      <div className={[_s.d, _s.mb5].join(' ')}>
        <ProgressBar small progress={uploadProgress} />
        <Text className={_s.mt10}>Uploading...</Text>
      </div>
    )}
    <div className={[_s.d, _s.flexRow, _s.flexWrap].join(' ')}>
      {media_attachments.map((file, index) => (
        <MediaUploadItem
          key={`upload-${index}`}
          index={index}
          file={file}
          onFileChange={onFileChange}
          onFileRemove={onFileRemove}
          isUploading={isUploading}
        />
      ))}
    </div>
    {media_attachments.length > 0 && !!onSensitive && (
      <SensitiveMediaButton sensitive={sensitive} onSensitive={onSensitive} />
    )}
  </div>
)

UploadForm.propTypes = {
  isUploading: PropTypes.bool,
  media_attachments: PropTypes.array,
  sensitive: PropTypes.bool
}

export default UploadForm
