class ChangeMarketplaceListingStatusChangesEnumsToSmallInts < ActiveRecord::Migration[6.0]
  disable_ddl_transaction!

  def change
    safety_assured { change_column :marketplace_listing_status_changes, :old_status, :smallint }
    safety_assured { change_column :marketplace_listing_status_changes, :new_status, :smallint }
  end
end
