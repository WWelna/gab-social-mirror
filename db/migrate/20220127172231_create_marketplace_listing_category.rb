class CreateMarketplaceListingCategory < ActiveRecord::Migration[6.0]
  def change
    create_table :marketplace_listing_categories do |t|
      t.timestamps
      t.string :name, null: false, default: ''
      t.string :slug, null: false, default: ''
      t.string :description
      t.attachment :cover_image, null: true
    end
  end
end
