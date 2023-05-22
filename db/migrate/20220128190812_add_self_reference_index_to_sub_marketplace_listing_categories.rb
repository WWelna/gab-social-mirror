class AddSelfReferenceIndexToSubMarketplaceListingCategories < ActiveRecord::Migration[6.0]
  def change
    safety_assured { add_column :marketplace_listing_categories, :parent_marketplace_listing_category, :integer }
    safety_assured { add_foreign_key :marketplace_listing_categories, :marketplace_listing_categories, column: :parent_marketplace_listing_category, on_delete: :nullify }
  end
end
