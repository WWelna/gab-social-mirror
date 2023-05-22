class AddUniqueIndexToMarketplaceListingCategories < ActiveRecord::Migration[6.0]
  disable_ddl_transaction!

  def change
    add_index :marketplace_listing_categories, :slug, unique: true, algorithm: :concurrently
  end
end
