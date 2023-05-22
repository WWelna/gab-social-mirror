class CreateMarketplaceListings < ActiveRecord::Migration[6.0]
  def change
    create_table :marketplace_listings do |t|
      t.timestamps
      t.string :title, null: false, default: ''
      t.string :description
      t.string :tags, array: true
      t.string :location
      t.integer :status, default: 0, null: false
      t.integer :condition, default: 0, null: false
      t.integer :price, default: 0, null: false
      t.belongs_to :account, foreign_key: { on_delete: :cascade }, null: false
      t.integer :marketplace_listing_category_id
    end

    safety_assured { add_foreign_key :marketplace_listings, :marketplace_listing_categories, column: :marketplace_listing_category_id, on_delete: :nullify }
  end
end