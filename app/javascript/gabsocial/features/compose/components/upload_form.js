import React from 'react'
import PropTypes from 'prop-types'
import Upload from './media_upload_item'
import SensitiveMediaButton from './sensitive_media_button'
import ProgressBar from '../../../components/progress_bar'

const UploadForm = ({
  media_attachments,
  isUploading,
  onFileChange,
  onFileRemove,
  onSensitive,
  sensitive,
  uploadProgress
}) => (
  <div className={_s.d}>
    {isUploading && media_attachments.length > 0 && (
      <ProgressBar small progress={uploadProgress} />
    )}
    <div className={[_s.d, _s.flexRow, _s.flexWrap].join(' ')}>
      {media_attachments.map((file, index) => (
        <Upload
          key={`upload-${index}`}
          index={index}
          file={file}
          onFileChange={onFileChange}
          onFileRemove={onFileRemove}
          onSensitive={onSensitive}
          isUploading={isUploading}
        />
      ))}
    </div>
    {media_attachments.length > 0 && (
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
