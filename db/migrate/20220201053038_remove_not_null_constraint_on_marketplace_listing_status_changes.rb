class RemoveNotNullConstraintOnMarketplaceListingStatusChanges < ActiveRecord::Migration[6.0]
  def change
    change_column_null :marketplace_listing_status_changes, :reviewer_account_id, true
  end
end
