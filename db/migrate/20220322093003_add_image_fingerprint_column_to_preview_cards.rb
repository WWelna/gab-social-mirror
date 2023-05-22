class AddImageFingerprintColumnToPreviewCards < ActiveRecord::Migration[5.2]
  def up
    add_column :preview_cards, :image_fingerprint, :string
  end
  
  def down
    remove_column :preview_cards, :image_fingerprint
  end
end