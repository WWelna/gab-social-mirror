class AddFileFingerprintColumnToMediaAttachments < ActiveRecord::Migration[5.2]
  def up
    add_column :media_attachments, :file_fingerprint, :string
  end

  def down
    remove_column :media_attachments, :file_fingerprint
  end
end