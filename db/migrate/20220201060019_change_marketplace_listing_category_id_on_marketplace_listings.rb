class ChangeMarketplaceListingCategoryIdOnMarketplaceListings < ActiveRecord::Migration[6.0]
  disable_ddl_transaction!

  def change
    safety_assured { change_column :marketplace_listings, :marketplace_listing_category_id, :bigint }
  end
end
