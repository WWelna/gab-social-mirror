class AddMarketplaceListingIdToMediaAttachments < ActiveRecord::Migration[6.0]
  disable_ddl_transaction!

  def change
    safety_assured { add_reference :media_attachments, :marketplace_listing, foreign_key: { on_delete: :nullify }, index: false }
  end
end
