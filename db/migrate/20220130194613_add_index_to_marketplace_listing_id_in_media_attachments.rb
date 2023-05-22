class AddIndexToMarketplaceListingIdInMediaAttachments < ActiveRecord::Migration[6.0]
  disable_ddl_transaction!

  def change
    safety_assured { add_index :media_attachments, :marketplace_listing_id, algorithm: :concurrently }
  end
end