class ChangeReviewerAccountIdOnMarketplaceListingStatusChanges < ActiveRecord::Migration[6.0]
  disable_ddl_transaction!

  def change
    safety_assured { change_column :marketplace_listing_status_changes, :reviewer_account_id, :bigint }
  end
end
